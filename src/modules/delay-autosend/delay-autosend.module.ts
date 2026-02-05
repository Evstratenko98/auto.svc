import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DelayAutosendController } from './delay-autosend.controller';
import { DelayAutosendService } from './delay-autosend.service';
import { DelayAutosendConsumer } from './delay-autosend.consumer';
import { CustomerMappingService } from '../customer/customer-mapping.service';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from '../customer/customer.module';
import { HttpClientModule } from '../../common/http-client/http-client.module';
import { IdentityModule } from '../identity/identity.module';
import { CustomLoggerModule } from '../../common/logger/custom-logger.module';
import { OpenIdModule } from '../openid/openid.module';
import { MetricsModule } from '@sravni/nest-utils/toolkit/modules/metrics';

@Module({
  imports: [
    HttpClientModule,
    BullModule.registerQueue({ name: 'delay-autosend' }),
    ConfigModule,
    OpenIdModule,
    MetricsModule,
    CustomerModule,
    IdentityModule,
    CustomLoggerModule,
  ],
  controllers: [DelayAutosendController],
  providers: [DelayAutosendService, DelayAutosendConsumer, CustomerMappingService],
})
export class DelayAutosendModule {}
