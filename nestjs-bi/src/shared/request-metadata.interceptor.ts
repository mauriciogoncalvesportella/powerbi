import {CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope} from "@nestjs/common";
import {Observable} from "rxjs";
import {RequestMetadata} from "./request-metadata.provider";

@Injectable({ scope: Scope.REQUEST })
export class RequestMetadataInterceptor implements NestInterceptor {
  constructor (
    private readonly requestMetadata: RequestMetadata,
  ) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    const user = context.switchToHttp().getRequest().user
    if (user) {
      this.requestMetadata.user = user 
    }
    return next.handle()
  }
}
