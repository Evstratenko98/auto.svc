import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerMappingService } from './customer-mapping.service';
import { CustomerApiService } from './customer.api.service';
import { MetricsModule } from '@sravni/nest-utils/toolkit/modules/metrics';
import { HttpClientModule } from '../../common/http-client/http-client.module';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from '../../common/logger/custom-logger.module';

@Module({
  imports: [HttpClientModule, MetricsModule, ConfigModule],
  providers: [CustomerService, CustomerMappingService, CustomerApiService],
  exports: [CustomerService, CustomerMappingService, CustomerApiService],
})
export class CustomerModule {}
