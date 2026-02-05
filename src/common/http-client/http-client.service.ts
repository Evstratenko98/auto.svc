import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import Axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosRetry, { IAxiosRetryConfigExtended } from 'axios-retry';
import { Histogram, MetricsProvider } from '@sravni/nest-utils/toolkit/modules/metrics/providers';
import { CustomLoggerService } from '../logger/custom-logger.service';

export const DEFAULT_TIMEOUT = 10_000;

export const MAX_BODY_LENGTH = Infinity; // Because length of data is not limited
export const MAX_CONTENT_LENGTH = Infinity; // Because length of data is not limited

@Injectable()
export class HttpClientSrv {
  readonly REQ_METHOD = {
    GET: 'GET',
    POST: 'POST',
  };
  private client: typeof Axios;
  private histogramHTTPOutReqDuration: Histogram;

  constructor(
    private readonly metricsSrv: MetricsProvider,
    private readonly logger: CustomLoggerService,
  ) {
    this.buildClient();
    this.registerPromMetrics();
  }

  async get<T = unknown>(
    config: AxiosRequestConfig & { metricsURL: string; retries?: number },
  ): Promise<AxiosResponse<T>> {
    const start = Date.now();
    const method = this.REQ_METHOD.GET;
    const { metricsURL, retries = 0, ...requestConfig } = config;
    const headers = {
      ...requestConfig.headers,
    };

    try {
      const result = await this.client({
        ...requestConfig,
        headers,
        method,
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

  async post<T = unknown>(
    config: AxiosRequestConfig & { metricsURL: string; retries?: number },
  ): Promise<AxiosResponse<T>> {
    const start = Date.now();
    const method = this.REQ_METHOD.POST;
    const { metricsURL, retries = 0, ...requestConfig } = config;
    const headers = {
      ...requestConfig.headers,
    };

    try {
      const result = await this.client({
        ...requestConfig,
        headers,
        method,
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
    if (retries === 0) {
      return {};
    }
    return {
      retries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: () => true,
      shouldResetTimeout: true,
    };
  }

  private handleError(e: unknown, start: number, route: string, method: string): never {
    if (Axios.isAxiosError(e)) {
      const code = e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      this.histogramHTTPOutReqDuration.labels({ route, code, method }).observe(Date.now() - start);
      throw e;
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
    // @ts-ignore
    this.logger.request(request);
    return request;
  }

  private interceptResponse(response: AxiosResponse) {
    // @ts-ignore
    this.logger.response(response, true);
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
}
