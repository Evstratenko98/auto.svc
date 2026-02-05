import { CustomHttpExceptionFilter } from '../custom-http-exception-filter';
import { ArgumentsHost, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import { CustomLoggerService } from '@sravni/creditselection-utils/modules/custom-logger';
import { ClsService } from 'nestjs-cls';
import { HEADERS } from '../../constants/headers.constants';
import { LoansApiException } from '../../exceptions/loans-api.exceptions';

describe('WHEN "CustomHttpExceptionFilter" is used', () => {
  let filter: CustomHttpExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock; getHeaders: jest.Mock; setHeader: jest.Mock };
  let mockRequest: { url: string; method: string; headers: Record<string, string> };
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new CustomHttpExceptionFilter(
      {
        error: jest.fn().mockReturnThis(),
        request: jest.fn().mockReturnThis(),
        response: jest.fn().mockReturnThis(),
      } as unknown as CustomLoggerService,
      {
        getId: jest.fn().mockReturnValue('test-trace-id'),
      } as unknown as ClsService,
    );
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      getHeaders: jest.fn().mockReturnValue({}), // добавлен мок getHeaders
      setHeader: jest.fn().mockReturnValue({}), // добавлен мок getHeaders
    };
    mockRequest = { url: '/test-url', method: 'GET', headers: {} };
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
    jest.spyOn(filter['logger'], 'response');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('AND response is array, MUST return array in "message"', () => {
    const exception = {
      getStatus: () => 400,
      getResponse: () => ({ message: ['error1', 'error2'] }),
      name: 'BadRequestException',
    } as unknown as HttpException;
    Object.setPrototypeOf(exception, HttpException.prototype);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'BadRequestException',
        request: '/test-url',
        message: ['error1', 'error2'],
      }),
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 400,
          error: 'BadRequestException',
          request: '/test-url',
          message: ['error1', 'error2'],
        }),
        status: 400,
        statusText: 'BadRequestException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND NotFoundException is thrown, MUST return single-element array in "message"', () => {
    const exception = new NotFoundException('Not found');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'NotFoundException',
        request: '/test-url',
        message: ['Not found'],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 404,
          error: 'NotFoundException',
          request: '/test-url',
          message: ['Not found'],
        }),
        status: 404,
        statusText: 'NotFoundException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND response is string, MUST return single-element array in "message"', () => {
    const exception = {
      getStatus: () => 404,
      getResponse: () => 'Not found',
      name: 'NotFoundException',
    } as unknown as HttpException;
    Object.setPrototypeOf(exception, HttpException.prototype);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'NotFoundException',
        request: '/test-url',
        message: ['Not found'],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 404,
          error: 'NotFoundException',
          request: '/test-url',
          message: ['Not found'],
        }),
        status: 404,
        statusText: 'NotFoundException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND response is LOANS API formatted, MUST return array of concat strings in "message"', () => {
    const exception = new LoansApiException(
      {
        errors: [
          { property: 'field1', description: 'desc1' },
          { property: 'field2', description: 'desc2' },
        ],
      },
      422,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        error: 'LoansApiException',
        request: '/test-url',
        message: ['field1 desc1', 'field2 desc2'],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 422,
          error: 'LoansApiException',
          request: '/test-url',
          message: ['field1 desc1', 'field2 desc2'],
        }),
        status: 422,
        statusText: 'LoansApiException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND response is LOANS API formatted and with "detail", MUST return array of concat strings in "message"', () => {
    const exception = new LoansApiException(
      {
        type: 'urn:problem:client:400',
        title: 'Bad Request',
        status: 400,
        detail: 'Request body validation error',
        errors: [
          {
            property: 'profile.employment.employer.status',
            description: 'This value is too short. It should have 1 character or more.',
            type: 'urn:problem.validation:9ff3fdc4-b214-49db-8718-39c315e33d45',
          },
        ],
      },
      400,
    );
    // const exception = {
    //   getStatus: () => 400,
    //   getResponse: () => ({
    //     type: 'urn:problem:client:400',
    //     title: 'Bad Request',
    //     status: 400,
    //     detail: 'Request body validation error',
    //     errors: [
    //       {
    //         property: 'profile.employment.employer.status',
    //         description: 'This value is too short. It should have 1 character or more.',
    //         type: 'urn:problem.validation:9ff3fdc4-b214-49db-8718-39c315e33d45',
    //       },
    //     ],
    //   }),
    //   name: 'BadRequestException',
    // } as unknown as HttpException;
    // Object.setPrototypeOf(exception, HttpException.prototype);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'LoansApiException',
        request: '/test-url',
        message: ['profile.employment.employer.status This value is too short. It should have 1 character or more.'],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 400,
          error: 'LoansApiException',
          request: '/test-url',
          message: ['profile.employment.employer.status This value is too short. It should have 1 character or more.'],
        }),
        status: 400,
        statusText: 'LoansApiException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND response is LOANS API with detail: string, MUST return array with string in "message"', () => {
    const exception = new LoansApiException('test', 422);
    // const exception = {
    //   getStatus: () => 422,
    //   getResponse: () => ({
    //     detail: 'test',
    //   }),
    //   name: 'UnprocessableEntityException',
    // } as unknown as HttpException;
    // Object.setPrototypeOf(exception, HttpException.prototype);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        error: 'LoansApiException',
        request: '/test-url',
        message: ['test'],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 422,
          error: 'LoansApiException',
          request: '/test-url',
          message: ['test'],
        }),
        status: 422,
        statusText: 'LoansApiException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND exception thrown, MUST return array with string in "message"', () => {
    const message = 'Bearer is empty';
    const exception = new ForbiddenException(message);
    Object.setPrototypeOf(exception, HttpException.prototype);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        error: 'ForbiddenException',
        request: '/test-url',
        message: [message],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 403,
          error: 'ForbiddenException',
          request: '/test-url',
          message: [message],
        }),
        status: 403,
        statusText: 'ForbiddenException',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it('AND NOT HttpException thrown, MUST return status=500 and array with string in "message"', () => {
    const message = 'Cannot parse value';
    const exception = new SyntaxError(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'SyntaxError',
        request: '/test-url',
        message: [message],
      }),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

    expect(filter['logger'].response).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusCode: 500,
          error: 'SyntaxError',
          request: '/test-url',
          message: [message],
        }),
        status: 500,
        statusText: 'SyntaxError',
        headers: {},
        config: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          headers: {},
        }),
      }),
      true,
      undefined,
      exception,
    );
  });

  it.each([[null], [undefined], [''], [{}]])(
    'AND response is %p, MUST return array with default error string in "message"',
    (value) => {
      const exception = {
        getStatus: () => 500,
        getResponse: () => value,
        name: 'InternalServerErrorException',
      } as unknown as HttpException;
      Object.setPrototypeOf(exception, HttpException.prototype);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          error: 'InternalServerErrorException',
          request: '/test-url',
          message: ['Unknown error'],
        }),
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(HEADERS.TRACE_ID, 'test-trace-id');

      expect(filter['logger'].response).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusCode: 500,
            error: 'InternalServerErrorException',
            request: '/test-url',
            message: ['Unknown error'],
          }),
          status: 500,
          statusText: 'InternalServerErrorException',
          headers: {},
          config: expect.objectContaining({
            url: '/test-url',
            method: 'GET',
            headers: {},
          }),
        }),
        true,
        undefined,
        exception,
      );
    },
  );
});
