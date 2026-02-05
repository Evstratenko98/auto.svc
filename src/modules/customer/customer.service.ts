import { Injectable } from '@nestjs/common';
import { CustomerMappingService } from './customer-mapping.service';
import { PostApplicationsDto } from '../delay-autosend/dto/post-applications.dto';
import { CsOffer } from '../credit-selection/credit-selection.types';
import { CustomerApiService } from './customer.api.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import {Counter} from "@sravni/nest-utils/toolkit/modules/metrics/providers";
import {JOB_REASONS} from "../delay-autosend/delay-autosend.constants";

@Injectable()
export class CustomerService {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly customerMappingService: CustomerMappingService,
    private readonly customerApiService: CustomerApiService,
  ) {}

  async loadCustomer(userId: number) {
    try {
      const customer = await this.customerApiService.loadCustomer(userId);

      return customer || null;
    } catch (error) {
      this.logger.error(error);

      return null;
    }
  }

  async postApplications(postApplicationsDto: PostApplicationsDto, offers: Array<CsOffer>, completedJobCount: Counter) {
    try {
      const settledApplications = await Promise.allSettled(
        offers.map((offer) =>
          this.customerApiService.postApplication(
            this.customerMappingService.mapOfferDataToApplications(postApplicationsDto, offer),
          ),
        ),
      );

      settledApplications.map((settledApplication) => {
        if(settledApplication.status === 'rejected') {
          completedJobCount.inc({
            status: JOB_REASONS.APPLICATION_SEND_ERROR,
          })
        }

        if (settledApplication.status === 'fulfilled') {
          completedJobCount.inc({
            status: JOB_REASONS.SUCCESS,
          })
        }
      })
    } catch (error) {
      this.logger.error(error);

      return null;
    }
  }
}
