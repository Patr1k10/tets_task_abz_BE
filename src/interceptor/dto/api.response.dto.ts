import { HttpStatus } from '@nestjs/common';

export class ApiResponseDto<T> {
  status_code: HttpStatus;
  detail: T;
  result: 'success' | 'error';
}
