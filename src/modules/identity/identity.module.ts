import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityApiService } from './identity.api.service';
import { HttpClientModule } from '../../common/http-client/http-client.module';
import { CustomLoggerModule } from '../../common/logger/custom-logger.module';
import { OpenIdModule } from '../openid/openid.module';

@Module({
  imports: [HttpClientModule, CustomLoggerModule, OpenIdModule],
  providers: [IdentityService, IdentityApiService],
  exports: [IdentityService],
})
export class IdentityModule {}
