import { CustomLoggerService } from '../custom-logger.service';
import { TestLoggerProvider } from '../../../../mocks/LoggerService';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('WHEN "CustomLoggerService" is used', () => {
  const testLoggerService = new CustomLoggerService(new TestLoggerProvider());

  describe('AND "error" was called', () => {
    it('AND it is axios error, MUST format it in special way', () => {
      const error = new AxiosError('TEST');
      error.config = {
        data: undefined,
        headers: undefined,
        url: '/internal/health',
        baseURL: 'http://test',
      };

      testLoggerService.error(error);

      expect(TestLoggerProvider.log).toHaveBeenCalledWith(
        'AxiosError',
        error.stack,
        '{"url":"http://test/internal/health"}',
      );
    });

    it('AND it is not axios error, MUST format it as unknown error', () => {
      const error = new Error('TEST');

      testLoggerService.error(error);

      expect(TestLoggerProvider.log).toHaveBeenCalledWith(error.message, error.stack, '{}');
    });
  });

  it('AND "request" was called, MUST format it in special way', () => {
    const request: InternalAxiosRequestConfig = {
      data: undefined,
      headers: undefined,
      url: '/internal/health',
      baseURL: 'http://test',
    };

    testLoggerService.request(request);

    expect(TestLoggerProvider.log).toHaveBeenCalledWith('REQUEST', '{"url":"http://test/internal/health"}');
  });

  it('AND "response" was called, MUST format it in special way', () => {
    const response: AxiosResponse = {
      headers: undefined,
      status: 200,
      statusText: 'OK',
      data: undefined,
      config: {
        url: '/internal/health',
        baseURL: 'http://test',
        headers: undefined,
      },
    };

    testLoggerService.response(response);

    expect(TestLoggerProvider.log).toHaveBeenCalledWith(
      'RESPONSE',
      '{"url":"http://test/internal/health","status":"200: OK"}',
    );
  });
});
