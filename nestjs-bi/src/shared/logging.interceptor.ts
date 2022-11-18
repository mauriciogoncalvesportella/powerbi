import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {BaseAuth} from 'src/auth/auth.interfaces';

@Injectable()
export class LogginInterceptor implements NestInterceptor {
  intercept (context: ExecutionContext, next: CallHandler) : Observable<any> {
    const req =  context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();
    const id = (req.user as BaseAuth)?.idEmpresa ?? ''

    return next.handle().pipe(
      tap(
        () => Logger.log(
          `[${context.getClass().name}] ${method} ${id} ${url} ${Date.now() - now}ms`
        ),
        () => Logger.error(
          `[${context.getClass().name}] ${method} ${id} ${url} ${Date.now() - now}ms`
        )
      )
    );
  }
}
