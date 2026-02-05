export const QUEUE_TITLE = 'delay-autosend';
export const JOB_PREFIX = 'delay_autosend';

export enum DELAY_AUTOSEND_SOURCE {
  WEB = 'Web',
  APP = 'MobileApp',
}

export enum JOB_REASONS {
  SUCCESS = 'SUCCESS',
  NO_PHONE_VERIFICATION_CODE = 'NO_PHONE_VERIFICATION_CODE',
  NO_CUSTOMER_DATA = 'NO_CUSTOMER_DATA',
  APPLICATION_SEND_ERROR = 'APPLICATION_SEND_ERROR',
}
