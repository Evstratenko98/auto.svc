import { Customer } from '../../customer/customer.types';
import { IdentityPhoneVerificationsEventModel } from '../../identity/identity.types';

export class PostApplicationsDto {
  userId: number;
  calcId: string;
  customer: Customer;
  phoneVerification: IdentityPhoneVerificationsEventModel;
}
