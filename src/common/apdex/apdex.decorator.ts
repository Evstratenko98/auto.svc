import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { ApdexInterceptor } from './apdex.interceptor';
import { APDEX_TARGET_TIME_KEY, APDEX_TIME_MS_MAP, METRICS_URL_METADATA_KEY } from './apdex.constants';

export const ApdexDecorator = (path: keyof typeof APDEX_TIME_MS_MAP) => {
  const decorators = [];

  decorators.push(SetMetadata(METRICS_URL_METADATA_KEY, path));

  const targetTimeMs = APDEX_TIME_MS_MAP[path];

  if (targetTimeMs !== undefined) {
    decorators.push(SetMetadata(APDEX_TARGET_TIME_KEY, targetTimeMs));
  }
  decorators.push(UseInterceptors(ApdexInterceptor));
  return applyDecorators(...decorators);
};
