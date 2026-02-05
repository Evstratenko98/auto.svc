import { PostApplicationsDto } from '../delay-autosend/dto/post-applications.dto';
import { CustomerApplication } from './customer.types';
import { CsOffer } from '../credit-selection/credit-selection.types';
import { parsePeriodToTerm } from '../delay-autosend/utils/period-to-term-and-unit';

export class CustomerMappingService {
  mapOfferDataToApplications(postApplication: PostApplicationsDto, offer: CsOffer): CustomerApplication {
    const { phoneVerification, customer, calcId, userId, source } = postApplication;
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
        channel: source,
        sourceUrl: '//autosend-service/delay-autosend',
        ip: '3e28:dd2b:b621:00f9:cd40:941d:4fbe:4027',
        deviceType: source,
        userAgent: source,
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
