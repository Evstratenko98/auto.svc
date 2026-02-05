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
import { CustomHttpExceptionFilter } from './common/exception-filters/custom-http-exception-filter';
import {ClsModule} from "nestjs-cls";
import {HEADERS} from "./common/constants/headers.constants";
import {ApdexModule} from "./common/apdex/apdex.module";

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
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers[HEADERS.TRACE_ID] ?? 1,
      },
    }),
    ApdexModule,
  ],
  // providers: [
  //   {
  //     provide: 'APP_FILTER',
  //     useClass: CustomHttpExceptionFilter,
  //   },
  // ],
})
export class AppModule {}
