import { Injectable } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityPhoneVerificationsResultModel, IdentityUserModel } from './identity.types';

@Injectable()
export class IdentityApiService {
  constructor() {}

  async getPhoneVerifications(userId: number, clientIp?: string): Promise<IdentityPhoneVerificationsResultModel> {
    // const headers = await getHeaders(clientIp, SCOPES.IDENTITY_USER_READ)
    // const { data } = await client.get<IdentityPhoneVerificationsResultModel>(`/api/users/${userId}/phone-verifications`, {
    //     headers,
    // })

    return null;
  }
}
