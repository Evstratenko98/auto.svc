import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JOB_REASONS, QUEUE_TITLE } from './delay-autosend.constants';
import { CustomerService } from '../customer/customer.service';
import { DelayAutosendRequestDto } from './dto/delay-autosend.request.dto';
import { IdentityService } from '../identity/identity.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { Counter, MetricsProvider } from '@sravni/nest-utils/toolkit/modules/metrics/providers';

@Processor(QUEUE_TITLE)
export class DelayAutosendConsumer extends WorkerHost {
  private jobCount: Counter;
  private completedJobCount: Counter;

  constructor(
    private readonly metricsProvider: MetricsProvider,
    private readonly logger: CustomLoggerService,
    private readonly customerService: CustomerService,
    private readonly identityService: IdentityService,
  ) {
    super();

    this.jobCount = this.metricsProvider.counter('autosend_job_count', 'count of job autosend');

    this.completedJobCount = this.metricsProvider.counter(
      'autosend_completed_job_count',
      'count of completed job autosend',
      ['status'],
    );
  }

  async process(job: Job<DelayAutosendRequestDto>): Promise<void> {
    const { data } = job;
    console.log(data);
    this.jobCount.inc();

    await this.postApplications(data);
  }

  async postApplications(delayAutosendRequestDto: DelayAutosendRequestDto): Promise<void> {
    try {
      const { userId, calcId, offers, source } = delayAutosendRequestDto;

      const [phoneVerificationResult, customerDataResult] = await Promise.allSettled([
        this.identityService.getPhoneVerifications(userId),
        this.customerService.loadCustomer(userId),
      ]);

      if (
        phoneVerificationResult.status === 'rejected' ||
        !this.identityService.hasCodeVerification(phoneVerificationResult.value)
      ) {
        this.completedJobCount.inc({
          status: JOB_REASONS.NO_PHONE_VERIFICATION_CODE,
        });
        console.log(JOB_REASONS.NO_PHONE_VERIFICATION_CODE);
        return;
      }

      if (customerDataResult.status === 'rejected' || !customerDataResult.value) {
        this.completedJobCount.inc({
          status: JOB_REASONS.NO_CUSTOMER_DATA,
        });
        console.log(JOB_REASONS.NO_CUSTOMER_DATA);
        return;
      }

      await this.customerService.postApplications(
        {
          userId,
          calcId,
          source,
          customer: customerDataResult.value,
          phoneVerification: this.identityService.getCodeVerification(phoneVerificationResult.value),
        },
        offers,
        this.completedJobCount,
      );
    } catch (error) {
      this.completedJobCount.inc({
        status: JOB_REASONS.UNKNOWN,
      });
      console.log(JOB_REASONS.UNKNOWN);
      this.logger.error(error);
    }
  }
}
