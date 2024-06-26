/* eslint-disable @typescript-eslint/no-explicit-any */
import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { CreateListReturn } from '../dto/create-list-return.dto';

export class RemoveListCreateFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        return plainToInstance(
          CreateListReturn,
          { list: data },
          { excludeExtraneousValues: true },
        );
      }),
    );
  }
}
