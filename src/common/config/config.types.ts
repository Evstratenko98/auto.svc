import { TBaseConfig } from '@sravni/nest-utils/dist/config/types';

export type TConfig = {
  [key: string]: any;
  logger: TBaseConfig['logger'] & { logFormat: 'json' | 'string' };
} & TBaseConfig;
