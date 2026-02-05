import { Injectable } from '@nestjs/common';
import { HttpClientSrv } from '../../common/http-client/http-client.service';
import { Customer, CustomerApplication, CustomerApplicationResponse, LoadCustomerParams } from './customer.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomerApiService {
  private serviceHost;
  constructor(
    private readonly httpClient: HttpClientSrv,
    private readonly configService: ConfigService,
  ) {
    this.serviceHost = this.configService.get('CUSTOMER');
  }

  async loadCustomer(userId: number): Promise<Customer> {
    const url = `${this.serviceHost}/v1/customers/load`;
    const body: LoadCustomerParams = {
      userId,
      channel: 'Web',
      options: {
        skipScoreRequest: true,
      },
    };

    const { data } = await this.httpClient.post<Customer>({
      url,
      data: body,
      metricsURL: url,
    });

    return data;
  }

  async postApplication(application: CustomerApplication) {
    const url = `${this.serviceHost}/v1/loans/applications`;
    const { data } = await this.httpClient.post<CustomerApplicationResponse>({
      url,
      data: application,
      metricsURL: url,
    });

    return data;
  }
}
