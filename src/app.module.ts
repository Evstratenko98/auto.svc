import { config } from './common/config/config';
import { ConfigModule } from '@sravni/nest-utils/config';
import { HealthModule } from '@sravni/nest-utils/toolkit/modules/health';
import { Module } from '@nestjs/common';
import { MetricsModule } from '@sravni/nest-utils/toolkit/modules/metrics';
import { TracingModule } from '@sravni/nest-utils/tracing';
import { LoggerModule } from '@sravni/nest-utils/logger';
import { RequestsLoggerModule } from '@sravni/nest-utils/toolkit/modules/requests-logger';

ConfigModule.setServiceName('autosend-service');

@Module({
  imports: [
    ConfigModule.register(config),
    TracingModule,
    RequestsLoggerModule,
    LoggerModule,
    MetricsModule,
    HealthModule,
  ],
})
export class AppModule {}
