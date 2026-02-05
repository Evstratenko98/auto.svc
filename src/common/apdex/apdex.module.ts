import { Global, Module } from '@nestjs/common';
import { ApdexMetricsService } from './apdex-metrics.service';

@Global()
@Module({
  providers: [ApdexMetricsService],
  controllers: [],
  exports: [ApdexMetricsService],
})
export class ApdexModule {}
