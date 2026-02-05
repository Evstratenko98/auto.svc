import { PostApplicationsDto } from '../delay-autosend/dto/post-applications.dto';
import { CustomerApplication } from './customer.types';
import { CsOffer } from '../credit-selection/credit-selection.types';
import { parsePeriodToTerm } from '../delay-autosend/utils/period-to-term-and-unit';

export class CustomerMappingService {
  mapOfferDataToApplications(postApplication: PostApplicationsDto, offer: CsOffer): CustomerApplication {
    const { phoneVerification, customer, calcId, userId } = postApplication;
    const loanGrace: {
      loanGracePeriodUnit?: 'month' | 'day';
      loanGracePeriod?: number;
    } = offer.gracePeriod
      ? {
          loanGracePeriodUnit: offer.category === 'Credit' ? 'month' : 'day',
          loanGracePeriod: offer.gracePeriod,
        }
      : {};

    return {
      consents: {
        code: phoneVerification.code,
        dateTime: phoneVerification.date,
      },
      client: {
        channel: 'Web',
        sourceUrl: 'Delay-autosend',
        ip: 'Delay-autosend',
        deviceType: 'Delay-autosend',
        userAgent: 'Delay-autosend',
      },
      analytics: {
        // utmSource: analytics.utmSource,
        // utmMedium: analytics.utmMedium,
        // utmCampaign: analytics.utmCampaign,
        // utmContent: analytics.utmContent,
        // utmTerm: analytics.utmTerm,
      },
      other: {},
      customer: {
        ...customer,
        ...parsePeriodToTerm(customer.period),
        calcId,
        userId,
        productId: offer.newId,
        productName: offer.name,
        productType: offer.category,
        organizationId: offer.organization.newId,
        organizationName: offer.organization.name,

        loanRate: offer.calculatedValues?.rate?.from?.toString(),
        loanPerMonth: offer.calculatedValues?.perMonth?.from?.toString(),
        employerStatus: 'ACTIVE',
        ...loanGrace,
      },
    };
  }
}
