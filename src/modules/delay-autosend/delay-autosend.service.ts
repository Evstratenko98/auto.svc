import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DelayAutosendRequestDto } from './dto/delay-autosend.request.dto';
import { JOB_PREFIX, QUEUE_TITLE } from './delay-autosend.constants';
import { CustomLoggerService } from '@sravni/creditselection-utils/modules/custom-logger';

@Injectable()
export class DelayAutosendService {
  private DEFAULT_DELAY_MINUTES = 30;
  private readonly logger: CustomLoggerService;

  constructor(@InjectQueue('delay-autosend') private readonly delayAutosendQueue: Queue) {}

  async scheduleAutosend(delayAutosendRequestDto: DelayAutosendRequestDto) {
    try {
      const { userId, offers, source, delay } = delayAutosendRequestDto;
      const jobId = `${JOB_PREFIX}_${userId}`;
      const delayMinutes = delay ?? this.DEFAULT_DELAY_MINUTES;
      const delayMs = delayMinutes * 60 * 1000;

      const existingJob = await this.delayAutosendQueue.getJob(jobId);
      if (existingJob) {
        await existingJob.remove();
      }

      await this.delayAutosendQueue.add(
        QUEUE_TITLE,
        { userId, offers, source },
        {
          jobId,
          delay: delayMs,
        },
      );

      return {
        success: true,
        jobId,
      };
    } catch (error) {
      this.logger.error(error);

      return {
        success: false,
        jobId: null,
      };
    }
  }
}
