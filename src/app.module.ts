import { config } from './common/config/config';
import { ConfigModule } from '@sravni/nest-utils/config';
import { HealthModule } from '@sravni/nest-utils/toolkit/modules/health';
import { Module } from '@nestjs/common';
import { MetricsModule } from '@sravni/nest-utils/toolkit/modules/metrics';
import { TracingModule } from '@sravni/nest-utils/tracing';
import { LoggerModule } from '@sravni/nest-utils/logger';
import { BullModule } from '@nestjs/bullmq';
import { CustomerModule } from './modules/customer/customer.module';
import { CustomLoggerModule } from './common/logger/custom-logger.module';
import { DelayAutosendModule } from './modules/delay-autosend/delay-autosend.module';
import { IdentityModule } from './modules/identity/identity.module';
import { OpenIdModule } from './modules/openid/openid.module';
import {CustomHttpExceptionFilter} from "./common/exception-filters/custom-http-exception-filter";

ConfigModule.setServiceName('autosend-service');

@Module({
  imports: [
    ConfigModule.register(() => config),
    TracingModule,
    LoggerModule,
    CustomLoggerModule,
    MetricsModule,
    HealthModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    OpenIdModule,
    DelayAutosendModule,
    CustomerModule,
    IdentityModule,
  ],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: CustomHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
