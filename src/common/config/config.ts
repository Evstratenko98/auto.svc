import * as dotenv from 'dotenv';
import * as process from 'process';
import { ELoggerLevels } from '@sravni/nest-utils/logger/enums';
import { TConfig } from './config.types';
import { EExporterType, ESamplerType } from '@sravni/nest-utils/tracing/enums';
import { debugLog, isProduction, isStaging } from './helpers';

dotenv.config();
export const config = (): TConfig => ({
  metrics: {
    percentiles: [0.01, 0.1, 0.9, 0.95, 0.99],
    buckets: [100, 200, 250, 300, 600, 900, 1000, 1200, 1500, 2000, 3000, 4000, 5000],
    providersUseMetrics: true,
  },
  tracing: {
    httpEnabled: true,
    sampler: {
      type: ESamplerType.PARENT_BASED,
      params: {
        ratio: 0.5,
      },
    },
    exporter: {
      type: EExporterType.JAEGER,
      params: {
        host: process.env.JAEGER_AGENT_HOST,
        port: Number(process.env.JAEGER_AGENT_PORT),
      },
    },
  },
  services: {
    ['autosend-service']: {
      name: 'autosend-service',
      service: {
        port: Number(process.env.PORT),
      },
    },
  },
  logger: {
    logFormat: isProduction() || isStaging() ? 'json' : 'string',
    levels: [ELoggerLevels.INFO, ELoggerLevels.WARNING, ELoggerLevels.ERROR, debugLog() && ELoggerLevels.DEBUG].filter(
      Boolean,
    ),
  },
});
