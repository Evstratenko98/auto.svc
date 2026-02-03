import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DelayAutosendController } from './delay-autosend.controller';
import { DelayAutosendService } from './delay-autosend.service';

@Module({
    imports: [BullModule.registerQueue({ name: 'delay-autosend' })],
    controllers: [DelayAutosendController],
    providers: [DelayAutosendService],
})
export class DelayAutosendModule {}
