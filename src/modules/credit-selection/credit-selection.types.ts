import { components } from '../../generated/credit-selection.svc.types';

export type CsOffer = (components['schemas']['CreditSuitableWeb'] | components['schemas']['CreditCardSuitableWeb']) & {
  gracePeriod?: number;
  calculatedValues: {
    rate?: {
      from?: string;
    };
    perMonth?: {
      from?: string;
    };
  };
};
