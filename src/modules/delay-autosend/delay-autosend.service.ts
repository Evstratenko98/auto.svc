import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DelayAutosendRequestDto } from './dto/delay-autosend.request.dto';
import { QUEUE_TITLE } from './delay-autosend.constants';

@Injectable()
export class DelayAutosendService {
  private DEFAULT_DELAY_MINUTES = 30;

  constructor(@InjectQueue('delay-autosend') private readonly delayAutosendQueue: Queue) {}

  async scheduleAutosend(delayAutosendRequestDto: DelayAutosendRequestDto) {
    const { userId, offers, source, delay } = delayAutosendRequestDto;
    const jobId = `delayautosend_${userId}`;
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
  }
}
