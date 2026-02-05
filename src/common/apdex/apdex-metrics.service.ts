import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import {
  APDEX_T4_MULTIPLICATOR,
  DEFAULT_APDEX_TIME,
  CUSTOM_SATISFIED_CONFIG,
  CUSTOM_TOLERATING_CONFIG,
  CUSTOM_TOTAL_CONFIG,
  MAX_SUCCESS_HTTP_CODE,
} from './apdex.constants';
import { MetricsProvider } from '@sravni/nest-utils/toolkit/modules/metrics/providers';

@Injectable()
export class ApdexMetricsService {
  private satisfiedCounter: Counter;
  private toleratedCounter: Counter;
  private totalCounter: Counter<string>;

  constructor(private readonly metricsProvider: MetricsProvider) {
    this.satisfiedCounter = this.metricsProvider.counter(
      CUSTOM_SATISFIED_CONFIG.name,
      CUSTOM_SATISFIED_CONFIG.help,
      CUSTOM_SATISFIED_CONFIG.labelNames,
    );
    this.toleratedCounter = this.metricsProvider.counter(
      CUSTOM_TOLERATING_CONFIG.name,
      CUSTOM_TOLERATING_CONFIG.help,
      CUSTOM_SATISFIED_CONFIG.labelNames,
    );
    this.totalCounter = this.metricsProvider.counter(
      CUSTOM_TOTAL_CONFIG.name,
      CUSTOM_TOTAL_CONFIG.help,
      CUSTOM_TOTAL_CONFIG.labelNames,
    );
  }

  public processApdex(route: string, code: number, duration: number, targetTime: number = DEFAULT_APDEX_TIME): void {
    if (code > MAX_SUCCESS_HTTP_CODE) {
      return;
    }

    const t = targetTime;
    const t4 = t * APDEX_T4_MULTIPLICATOR;

    if (duration > t4) {
      return;
    }

    const counterData = { route, code };
    this.totalCounter.inc(counterData);

    if (duration <= t) {
      this.satisfiedCounter.inc(counterData);
      this.toleratedCounter.inc(counterData, 0);
    } else if (duration > t && duration <= t4) {
      this.satisfiedCounter.inc(counterData, 0);
      this.toleratedCounter.inc(counterData);
    }
  }
}
