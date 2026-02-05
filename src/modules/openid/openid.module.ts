import { Module } from '@nestjs/common';
import { OpenIdService } from './openid.service';

@Module({
  imports: [],
  providers: [OpenIdService],
  exports: [OpenIdService],
  controllers: [],
})
export class OpenIdModule {}
