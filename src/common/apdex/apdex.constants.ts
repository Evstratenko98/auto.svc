import { TApdexConfigurationCounter } from '@sravni/nest-utils/toolkit/modules/metrics/extended-metrics/types';

export const APDEX_TARGET_TIME_KEY = 'apdexTargetTime';
export const METRICS_URL_METADATA_KEY = 'metricsURL';

/**
 * Map of routes to their respective Apdex target times in milliseconds.
 */
export const APDEX_TIME_MS_MAP = {
  '/v1/customers/load': 3000,
  '/v2/customers/load': 3000,
  '/v1/customers/update': 2000,
  '/v2/customers/update': 2000,
  '/v1/loans/contacts': 1500,
  '/v2/loans/contacts': 1500,
  '/v1/loans/applications': 2500,
  '/v2/loans/applications': 2500,
  '/v1/loans/referrals': 2500,
  '/v2/loans/pre-approvals/search': 2500,
  '/v2/loans/referrals': 2500,
  '/v1/loans/applications/:applicationId': 1000,
  '/v1/loans/calculations': 1500,
  '/v2/loans/calculations': 1500,
  '/v1/loans/first-touch': 1000,
  '/v1/loans/profile/restore': 1000,
  '/v1/loans/users/applications/statuses': 2000,
  '/v2/loans/users/applications/statuses': 2000,
  '/v1/scores': 1500,
  '/credit-history': 1000,
  '/v1/loans/delivery-info': 1500,
} as const;

export const DEFAULT_APDEX_TIME = 1000;
export const APDEX_T4_MULTIPLICATOR = 4;
export const MAX_SUCCESS_HTTP_CODE = 299;

export const CUSTOM_SATISFIED_CONFIG: TApdexConfigurationCounter = {
  name: 'custom_apdex_satisfied',
  help: '[CUSTOM] The responses number satisfied by x < T threshold time condition',
  labelNames: ['route', 'code'],
};

export const CUSTOM_TOLERATING_CONFIG: TApdexConfigurationCounter = {
  name: 'custom_apdex_tolerating',
  help: '[CUSTOM] The responses number tolerating by T < x <= 4 * T threshold time condition',
  labelNames: ['route', 'code'],
};

export const CUSTOM_TOTAL_CONFIG: TApdexConfigurationCounter = {
  name: 'custom_apdex_total',
  help: '[CUSTOM] The total responses number',
  labelNames: ['route', 'code'],
};
