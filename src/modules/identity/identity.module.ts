import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityApiService } from './identity.api.service';
import { HttpClientModule } from '../../common/http-client/http-client.module';

@Module({
  imports: [HttpClientModule],
  providers: [IdentityService, IdentityApiService],
  exports: [IdentityService],
})
export class IdentityModule {}
