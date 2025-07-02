import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistryModule } from './registry/registry.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ImportDataModule } from './import-data/import-data.module';
import { SharedModule } from './shared/shared.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LogginInterceptor } from './shared/logging.interceptor';
import { BIModule } from './bi/bi.module';
import { VersionControlMiddleware } from './shared/version-control.middleware';
import { UserRolesGlobalGuard } from './auth/user-roles/user-roles-global.guard';
import { UserRolesService } from './auth/user-roles/user-roles.service';

// MÓDULO PRINCIPAL DA APLICAÇÃO


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'powerbi',
      password: 'admin',
      database: 'powerbi',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
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
    UserRolesService,
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogginInterceptor
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VersionControlMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}