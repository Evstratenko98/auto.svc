import { Customer } from '../../customer/customer.types';
import { IdentityPhoneVerificationsEventModel } from '../../identity/identity.types';
import { DELAY_AUTOSEND_SOURCE } from '../delay-autosend.constants';

export class PostApplicationsDto {
  userId: number;
  calcId: string;
  customer: Customer;
  phoneVerification: IdentityPhoneVerificationsEventModel;
  source: DELAY_AUTOSEND_SOURCE;
}
