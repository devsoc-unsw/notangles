import { HttpException, HttpStatus } from '@nestjs/common';

export function validate(
  condition: boolean,
  errorMessage: string,
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
): void {
  if (!condition) {
    throw new HttpException(errorMessage, statusCode);
  }
}
