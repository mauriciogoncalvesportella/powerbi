import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistryModule } from './registry/registry.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ImportDataModule } from './import-data/import-data.module';
import {SharedModule} from './shared/shared.module';
import {APP_GUARD, APP_INTERCEPTOR, MiddlewareBuilder} from '@nestjs/core';
import {LogginInterceptor} from './shared/logging.interceptor';
import {BIModule} from './bi/bi.module';
import {VersionControlMiddleware} from './shared/version-control.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    RegistryModule,
    DatabaseModule,
    AuthModule,
    ImportDataModule,
    BIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogginInterceptor
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VersionControlMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
