// CODIGO ANTERIOR CASO DER ERRO PARA REVERTER
// import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
// import {ConfigModule} from '@nestjs/config';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { RegistryModule } from './registry/registry.module';
// import { DatabaseModule } from './database/database.module';
// import { AuthModule } from './auth/auth.module';
// import { ImportDataModule } from './import-data/import-data.module';
// import {SharedModule} from './shared/shared.module';
// import {APP_GUARD, APP_INTERCEPTOR, MiddlewareBuilder} from '@nestjs/core';
// import {LogginInterceptor} from './shared/logging.interceptor';
// import {BIModule} from './bi/bi.module';
// import {VersionControlMiddleware} from './shared/version-control.middleware';
// import { UserRolesGlobalGuard } from './auth/user-roles/user-roles-global.guard';
// import { UserRolesService } from './auth/user-roles/user-roles.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { CampaignModule } from './campaign/campaign.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     SharedModule,
//     RegistryModule,
//     DatabaseModule,
//     AuthModule,
//     ImportDataModule,
//     BIModule,
//   ],
//   controllers: [AppController],
//   providers: [
//     UserRolesService,
//     AppService,
//     {
//       provide: APP_INTERCEPTOR,
//       useClass: LogginInterceptor
//     }
//   ],
// })
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(VersionControlMiddleware)
//       .forRoutes({ path: '*', method: RequestMethod.ALL })
//   }
// }


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
import { APP_GUARD, APP_INTERCEPTOR, MiddlewareBuilder } from '@nestjs/core';
import { LogginInterceptor } from './shared/logging.interceptor';
import { BIModule } from './bi/bi.module';
import { VersionControlMiddleware } from './shared/version-control.middleware';
import { UserRolesGlobalGuard } from './auth/user-roles/user-roles-global.guard';
import { UserRolesService } from './auth/user-roles/user-roles.service';
import { CampaignModule } from './bi/campaign/campaign.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Substituir este trecho no app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres', // Altere para o tipo correto do seu banco (postgres, mysql, etc)
  host: 'localhost',
  port: 5432, // 5432 para PostgreSQL, 3306 para MySQL
  username: 'admin', // Substitua pelo usuário real do banco
  password: 'admin', // Substitua pela senha real do banco
  database: 'bi',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false, // Definido como false para evitar alterações automáticas no esquema
}),
    SharedModule,
    RegistryModule,
    DatabaseModule,
    AuthModule,
    ImportDataModule,
    BIModule,
    CampaignModule,
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