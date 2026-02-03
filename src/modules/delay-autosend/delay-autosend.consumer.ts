import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_TITLE } from './delay-autosend.constants';

@Processor(QUEUE_TITLE)
export class DelayAutosendConsumer extends WorkerHost {
  private readonly logger = new Logger(DelayAutosendConsumer.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Delay autosend job received: ${JSON.stringify(job)}`);
  }
}
