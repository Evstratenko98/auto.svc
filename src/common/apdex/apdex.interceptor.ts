import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { APDEX_TARGET_TIME_KEY, METRICS_URL_METADATA_KEY } from './apdex.constants';
import { ApdexMetricsService } from './apdex-metrics.service';

@Injectable()
export class ApdexInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly apdexMetricsService: ApdexMetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> | Promise<Observable<unknown>> {
    const start = Date.now();

    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    const hander = context.getHandler();
    const route = this.reflector.get<string>(METRICS_URL_METADATA_KEY, hander);
    const targetTime = this.reflector.get(APDEX_TARGET_TIME_KEY, hander);

    if (route) {
      response.on('finish', () => {
        const code = response.statusCode;
        const duration = Date.now() - start;
        this.apdexMetricsService.processApdex(route, code, duration, targetTime);
      });
    }

    return next.handle();
  }
}
