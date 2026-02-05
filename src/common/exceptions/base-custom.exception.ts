import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseCustomException extends HttpException {
  public _messages: string[];

  constructor(
    message: string | string[],
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    metadata?: Record<string, any>,
    errorType?: string,
  ) {
    const messages = Array.isArray(message) ? message : [message];
    super(
      {
        message: messages,
        errorType: errorType || 'BaseCustomException',
        statusCode: status,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      status,
    );
    this._messages = messages;
  }

  public get messages(): string[] {
    return this._messages;
  }
}
