import { components } from '../../common/types/generated/customer.svc.types';

export type LoadCustomerParams = components['schemas']['LoadCustomerDto'];
export type Customer = components['schemas']['CustomerDto'];
export type ClientChannels = components['schemas']['ClientTrafficChannels'];

export type CustomerApplication = Omit<components['schemas']['SaveApplicationDto'], 'analytics'> & {
  analytics: Record<string, string>;
};
export type CustomerApplicationResponse = components['schemas']['GetApplicationDto'];
