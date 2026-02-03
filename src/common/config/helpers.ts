import { EEnvironment } from '@sravni/nest-utils/config/constants';

export const isProduction = () => process.env.NODE_ENV === EEnvironment.PRODUCTION;
export const isStaging = () => process.env.NODE_ENV === EEnvironment.STAGING;
export const debugLog = () => [true, 'true'].includes(process.env.DEBUG_LOG);
