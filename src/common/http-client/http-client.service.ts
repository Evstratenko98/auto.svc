import { Request } from 'express';
import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import Axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosRetry, { IAxiosRetryConfigExtended } from 'axios-retry';
import { Histogram, MetricsProvider } from '@sravni/nest-utils/toolkit/modules/metrics/providers';
import { CustomLoggerService } from '../logger/custom-logger.service';

export const DEFAULT_TIMEOUT = 30_000;

export const MAX_BODY_LENGTH = Infinity; // Because length of data is not limited
export const MAX_CONTENT_LENGTH = Infinity; // Because length of data is not limited

@Injectable()
export class HttpClientSrv {
  private client: typeof Axios;
  private histogramHTTPOutReqDuration: Histogram;

  constructor(
    private readonly metricsSrv: MetricsProvider,
    private readonly logger: CustomLoggerService,
  ) {
    this.buildClient();
    this.registerPromMetrics();
  }

  async proxy<R>(options: { url: string; req: Request; timeout?: number }): Promise<R> {
    const { url, req } = options;
    const headers = this.getHeaders(req.headers) as AxiosRequestConfig['headers'];

    const { data } = await this.send<R>({
      url,
      headers,
      method: req.method.toLowerCase(),
      data: req.body,
      metricsURL: req.route.path,
      timeout: options.timeout || DEFAULT_TIMEOUT,
    });

    return data;
  }

  async send<T = any>(
    config: AxiosRequestConfig & { metricsURL: string; retries?: number },
  ): Promise<AxiosResponse<T>> {
    const start = Date.now();
    const { metricsURL, retries = 0, ...requestConfig } = config;
    const method = requestConfig.method;

    try {
      const result = await this.client({
        ...requestConfig,
        timeout: config.timeout || DEFAULT_TIMEOUT,
        maxBodyLength: MAX_BODY_LENGTH,
        maxContentLength: MAX_CONTENT_LENGTH,
        'axios-retry': this.buildRetryConfig(retries),
      });

      this.histogramHTTPOutReqDuration
        .labels({ route: metricsURL, code: result.status, method })
        .observe(Date.now() - start);

      return result;
    } catch (e) {
      this.handleError(e, start, metricsURL, method);
    }
  }

  private buildClient() {
    this.client = Axios;
    this.registerInterceptors();
    axiosRetry(this.client);
  }

  private buildRetryConfig(retries: number): IAxiosRetryConfigExtended {
    if (retries === 0) return {};
    return {
      retries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: () => true,
      shouldResetTimeout: true,
    };
  }

  private handleError<T>(e: unknown, start: number, route: string, method: string): AxiosResponse<T> | never {
    if (Axios.isAxiosError(e)) {
      const code = e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      this.histogramHTTPOutReqDuration.labels({ route, code, method }).observe(Date.now() - start);
      throw new HttpException(e.response?.data || e.message, e.response?.status || HttpStatus.BAD_REQUEST);
    }

    this.histogramHTTPOutReqDuration
      .labels({ route, code: HttpStatus.INTERNAL_SERVER_ERROR, method })
      .observe(Date.now() - start);
    throw new InternalServerErrorException();
  }

  private interceptError(error: Error) {
    this.logger.error(error);
    throw error;
  }

  private interceptRequest(request: InternalAxiosRequestConfig) {
    this.logger.request(request);
    return request;
  }

  private interceptResponse(response: AxiosResponse) {
    this.logger.response(response);
    return response;
  }

  private registerInterceptors(): void {
    this.client.interceptors.request.use(this.interceptRequest.bind(this), this.interceptError.bind(this));
    this.client.interceptors.response.use(this.interceptResponse.bind(this), this.interceptError.bind(this));
  }

  private registerPromMetrics() {
    this.histogramHTTPOutReqDuration = this.metricsSrv.histogram(
      'http_out_req_duration_ms',
      'Duration of outcoming HTTP requests in milliseconds',
      ['method', 'route', 'code'],
      [100, 200, 350, 500, 700, 1_000, 3_000, 5_000, 7_000, 10_000],
    );
  }

  private getHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const allowedHeaders = [
      'auth',
      'authorization',
      'x-user-fingerprint',
      'x-trace-id',
      'x-owner-id',
      'x-partner-id',
      'x-session-id',
      'x-page-context',
      'marker',
      'x-ab-groups',
      'sub', // for CF-4426
    ];

    return Object.keys(headers).reduce((acc, headerField) => {
      const isAllowHeader = allowedHeaders.includes(headerField.toLowerCase());
      if (isAllowHeader) {
        acc[headerField] = headers[headerField];
      }
      return acc;
    }, {});
  }
}
