import { Module } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger.service';

@Module({
  imports: [CustomLoggerModule],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
