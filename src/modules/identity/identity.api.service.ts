import { Injectable } from '@nestjs/common';
import { IdentityPhoneVerificationsResultModel } from './identity.types';
import { OpenIdService } from '../openid/openid.service';
import { HttpClientSrv } from '../../common/http-client/http-client.service';
import { config, SERVICES } from '../../common/config/config';

@Injectable()
export class IdentityApiService {
  constructor(
    private readonly httpClient: HttpClientSrv,
    private openIdService: OpenIdService,
  ) {}
  private serviceHost = config.services[SERVICES.identity].host;

  private async get<T, D = unknown>(url: string, params?: D, metricsURL = url): Promise<T> {
    const headers = await this.openIdService.getAuthHeaders();

    const { data } = await this.httpClient.get<T>({
      url,
      params,
      metricsURL,
      headers: {
        accept: 'text/plain',
        ...headers,
      },
    });

    return data;
  }

  async getPhoneVerifications(userId: number): Promise<IdentityPhoneVerificationsResultModel | null> {
    if (!userId) {
      return null;
    }
    const url = `${this.serviceHost}/api/users/${userId}/phone-verifications`;
    const metricsURL = `${this.serviceHost}/api/users/{userId}/phone-verifications`;

    return await this.get<IdentityPhoneVerificationsResultModel>(url, undefined, metricsURL);
  }
}
