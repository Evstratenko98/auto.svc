import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_TITLE } from './delay-autosend.constants';
import { CustomerService } from '../customer/customer.service';
import { DelayAutosendRequestDto } from './dto/delay-autosend.request.dto';
import { IdentityService } from '../identity/identity.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

@Processor(QUEUE_TITLE)
export class DelayAutosendConsumer extends WorkerHost {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly customerService: CustomerService,
    private readonly identityService: IdentityService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { data } = job;
    console.log(data);
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
        return;
      }

      if (customerDataResult.status === 'rejected' || !customerDataResult.value) {
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
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
