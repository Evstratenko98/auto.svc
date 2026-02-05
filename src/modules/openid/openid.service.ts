import { Injectable } from '@nestjs/common';
import { OpenId } from '@sravni/server-utils/lib/openid';
import { config, SERVICES } from '../../common/config/config';
import { SCOPES } from './openid.constants';

@Injectable()
export class OpenIdService {
  private webPath = config.services[SERVICES.identity].webPath || '';
  private issuerUrl = config.services[SERVICES.identity].issuer || '';
  private clientId = config.services[SERVICES.identity].clientId || '';
  private clientSecret = config.services[SERVICES.identity].clientSecret || '';

  private openidInstance: OpenId | null = null;

  public getOpenId = (): OpenId => {
    if (this.openidInstance) {
      return this.openidInstance;
    }

    this.openidInstance = new OpenId({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      issuerUrl: this.issuerUrl,
      webPath: this.webPath,
    });

    return this.openidInstance;
  };

  public getAuthHeaders = async (scope = [SCOPES.IDENTITY_USER_READ]) => {
    const openId = this.getOpenId();
    const { access_token, token_type = 'Bearer' } = (await openId.getCredentials(scope)) || {};
    return {
      Authorization: `${token_type} ${access_token}`,
    };
  };
}
