import {Global, Module} from "@nestjs/common";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {RequestMetadataInterceptor} from "./request-metadata.interceptor";
import {RequestMetadata} from "./request-metadata.provider";

@Global()
@Module({
  providers: [
    RequestMetadata,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetadataInterceptor,
    }
  ],
  exports: [
    RequestMetadata,
  ]
})
export class SharedModule {}
