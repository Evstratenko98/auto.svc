import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {DelayAutosendRequestDto} from "./dto/delay-autosend.dto";

const DEFAULT_DELAY_MINUTES = 30;

@Injectable()
export class DelayAutosendService {
    constructor(@InjectQueue('delay-autosend') private readonly delayAutosendQueue: Queue) {}

    async scheduleAutosend(payload: DelayAutosendRequestDto) {
        const jobId = `delayautosend_${payload.userId}`;
        const delayMinutes = payload.delay ?? DEFAULT_DELAY_MINUTES;
        const delayMs = delayMinutes * 60000;

        const existingJob = await this.delayAutosendQueue.getJob(jobId);
        if (existingJob) {
            await existingJob.remove();
        }

        await this.delayAutosendQueue.add(
            'delay-autosend',
            {
                userId: payload.userId,
                offers: payload.offers,
                source: payload.source,
            },
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
