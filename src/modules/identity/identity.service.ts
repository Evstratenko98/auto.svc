import { Injectable } from '@nestjs/common';
import { IdentityPhoneVerificationsEventModel, IdentityPhoneVerificationsResultModel } from './identity.types';
import { IdentityApiService } from './identity.api.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

@Injectable()
export class IdentityService {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly identityApiService: IdentityApiService,
  ) {}

  async getPhoneVerifications(userId: number): Promise<IdentityPhoneVerificationsResultModel | null> {
    try {
      const phoneVerifications = await this.identityApiService.getPhoneVerifications(userId);

      return phoneVerifications || null;
    } catch (error) {
      this.logger.error(error);

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
