import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { LoggerProvider } from '@sravni/nest-utils/logger';

@Injectable()
export class CustomLoggerService {
  private SKIPPED_HEADERS = new Set([
    'common',
    'connection',
    'content-length',
    'content-security-policy',
    'content-type',
    'date',
    'delete',
    'get',
    'head',
    'patch',
    'post',
    'put',
    'vary',
  ]);
  private HIDDEN_HEADERS = new Set(['Authorization']);
  private HIDDEN_VALUE_PLACEHOLDER = 'xxx';

  constructor(private readonly logger: LoggerProvider) {}

  error(error: Error) {
    try {
      if (isAxiosError(error) && error.config) {
        const { config, response } = error;

        this._printError('AxiosError', error.stack, {
          ...this._formatRequestConfig(config),
          status: this._formatStatus(response?.status, response?.statusText),
          headers: this._formatHeaders(response?.headers),
          data: this._formatData(response?.data),
        });

        return;
      }

      this._printError(error.message, error.stack);
    } catch (e) {
      this._printError(e.message, e.stack);
    }
  }

  request(request: InternalAxiosRequestConfig) {
    try {
      const { baseURL, headers, method, params, url } = request;
      this._printLog('REQUEST', {
        headers: this._formatHeaders(headers),
        method: this._formatMethod(method),
        params: this._formatParams(params),
        url: this._formatURL(baseURL, url),
      });
    } catch (e) {
      this._printError(e.message, e.stack);
    }
  }

  response(response: AxiosResponse) {
    try {
      const { config, headers, status, statusText } = response;

      this._printLog('RESPONSE', {
        ...this._formatRequestConfig(config),
        headers: this._formatHeaders(headers),
        status: this._formatStatus(status, statusText),
      });
    } catch (e) {
      this._printError(e.message, e.stack);
    }
  }

  private _printLog(message: string, params: Record<string, string> = {}) {
    this.logger.debug(message, JSON.stringify(params));
  }

  private _printError(message: string, trace: string, params: Record<string, string> = {}) {
    this.logger.error(message, trace, JSON.stringify(params));
  }

  private _formatRequestConfig(config: AxiosRequestConfig) {
    const { baseURL, method, params, url } = config;
    return {
      method: this._formatMethod(method),
      params: this._formatParams(params),
      url: this._formatURL(baseURL, url),
    };
  }

  private _combineUrls(baseURL: string, relativeURL?: string): string {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
  }

  private _formatData(data?: unknown): string | undefined {
    if (typeof data === 'string') {
      return data;
    } else if (data instanceof URLSearchParams) {
      return data.toString();
    } else if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data);
    }

    return undefined;
  }

  private _formatHeaders(headers?: AxiosRequestConfig['headers'] | AxiosResponse['headers']): string | undefined {
    if (headers) {
      const headersMap: Record<string, string | number | boolean> = {};

      for (const [key, value] of Object.entries(headers)) {
        if (this.SKIPPED_HEADERS.has(key)) continue;
        headersMap[key] = this.HIDDEN_HEADERS.has(key) ? this.HIDDEN_VALUE_PLACEHOLDER : value;
      }

      return JSON.stringify(headersMap);
    }

    return undefined;
  }

  private _formatMethod(method: string | undefined) {
    return method?.toUpperCase();
  }

  private _formatParams(params: URLSearchParams | object | undefined): string {
    return params instanceof URLSearchParams ? params.toString() : JSON.stringify(params);
  }

  private _formatStatus(status?: number, statusText?: string): string | undefined {
    if (status) {
      return statusText ? `${status}: ${statusText}` : status.toString();
    }

    return undefined;
  }

  private _formatURL(baseURL: string | undefined, url: string | undefined): string | undefined {
    return baseURL ? this._combineUrls(baseURL, url) : url;
  }
}
