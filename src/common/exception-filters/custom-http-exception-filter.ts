import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from '@sravni/creditselection-utils/modules/custom-logger';
import { AxiosResponseHeaders } from 'axios';
import { isArray } from 'lodash';
import { HEADERS } from '../constants/headers.constants';
import { ClsService } from 'nestjs-cls';
import { BaseCustomException } from '../exceptions/base-custom.exception';

@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly cls: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = 500;
    let message: string[] = [];
    let exceptionName: string = 'InternalServerError';
    const defaultErrorMessage = 'Unknown error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      exceptionName = exception.name;

      // custom exceptions (yup validation, Loans API response etc)
      if (exception instanceof BaseCustomException) {
        message = exception.messages;
      }

      // NestJS ValidationPipe error
      const errorResponse = exception.getResponse() ?? {};
      const responseMessage = errorResponse['message'];
      if (responseMessage && isArray(responseMessage)) {
        message = responseMessage;
      }
      if (typeof errorResponse === 'string' && errorResponse?.length > 0) {
        message = [errorResponse];
      }
    } else {
      if (exception instanceof Error) {
        exceptionName = exception.constructor.name;
        message = [exception.message];
      }
    }

    if (!message || !isArray(message) || message.length === 0) {
      message = exception instanceof Error ? [exception.message || defaultErrorMessage] : [defaultErrorMessage];
    }

    const errorData = {
      statusCode: status,
      error: exceptionName,
      request: request.url,
      message: message,
    };

    const traceId = this.cls.getId();
    if (traceId) {
      response.setHeader(HEADERS.TRACE_ID, traceId);
    }

    this.logger.response(
      {
        data: errorData,
        status: errorData.statusCode,
        statusText: errorData.error,
        // @ts-ignore
        headers: response.getHeaders() as AxiosResponseHeaders,
        config: {
          url: request.url,
          method: request.method,
          // @ts-ignore
          headers: request.headers as AxiosResponseHeaders,
          params: request.params,
          data: request.body,
        },
      },
      true,
      undefined,
      exception as Error,
    );

    response.status(status).json(errorData);
  }
}
