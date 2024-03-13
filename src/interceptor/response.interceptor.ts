import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseDto } from './dto/api.response.dto';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse();
        const statusCode = response.statusCode || HttpStatus.OK;
        return {
          status_code: statusCode,
          detail: data,
          result: 'success',
        };
      }),
    );
  }
}
