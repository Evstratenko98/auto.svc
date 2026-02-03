import { config } from './common/config/config';
import { ConfigModule } from '@sravni/nest-utils/config';
import { HealthModule } from '@sravni/nest-utils/toolkit/modules/health';
import { Module } from '@nestjs/common';
import { MetricsModule } from '@sravni/nest-utils/toolkit/modules/metrics';
import { TracingModule } from '@sravni/nest-utils/tracing';
import { LoggerModule } from '@sravni/nest-utils/logger';
import { RequestsLoggerModule } from '@sravni/nest-utils/toolkit/modules/requests-logger';
import { BullModule } from '@nestjs/bullmq';
import {DelayAutosendModule} from "./modules/delay-autosend/delay-autosend.module";

ConfigModule.setServiceName('autosend-service');

@Module({
  imports: [
    ConfigModule.register(config),
    TracingModule,
    RequestsLoggerModule,
    LoggerModule,
    MetricsModule,
    HealthModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    DelayAutosendModule,
  ],
})
export class AppModule {}
