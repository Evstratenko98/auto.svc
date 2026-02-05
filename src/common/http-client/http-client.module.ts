import { HttpClientSrv } from './http-client.service';
import { Module } from '@nestjs/common';
import { MetricsModule } from '@sravni/nest-utils/toolkit/modules/metrics';
import { CustomLoggerModule } from '../logger/custom-logger.module';

@Module({
  exports: [HttpClientSrv],
  imports: [MetricsModule, CustomLoggerModule],
  providers: [HttpClientSrv],
})
export class HttpClientModule {}
