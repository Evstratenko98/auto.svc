import { Injectable } from '@nestjs/common';
import {
  IdentityPhoneVerificationsEventModel,
  IdentityPhoneVerificationsResultModel,
  IdentityUserModel,
} from './identity.types';
import { IdentityApiService } from './identity.api.service';

@Injectable()
export class IdentityService {
  constructor(private readonly identityApiService: IdentityApiService) {}

  async getPhoneVerifications(
    userId: number,
    clientIp?: string,
  ): Promise<IdentityPhoneVerificationsResultModel | null> {
    try {
      const phoneVerifications = await this.identityApiService.getPhoneVerifications(userId);

      return phoneVerifications || null;
    } catch (error) {
      // logger.error('getUserByPhone error', { error })

      return null;
    }
  }

  hasCodeVerification(phoneVerificationsResultModel: IdentityPhoneVerificationsResultModel): boolean {
    return !!phoneVerificationsResultModel?.verifications?.some((verification) => verification?.code);
  }

  getCodeVerification(
    phoneVerificationsResultModel: IdentityPhoneVerificationsResultModel,
  ): IdentityPhoneVerificationsEventModel {
    return phoneVerificationsResultModel?.verifications?.filter((verification) => !!verification?.code)[0];
  }
}
