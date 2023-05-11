import { Global, Module } from '@nestjs/common';
import ConnectionProvider from './connection.provider'
import {DatabaseService} from './database.service';
import { UnitOfWorkModule } from './unit-of-work/uow.module';
import MultitenantConnectionProvider from './multitenant-connection.provider';

@Global()
@Module({
  imports: [UnitOfWorkModule],
  providers: [ConnectionProvider, DatabaseService, MultitenantConnectionProvider],
  exports: ['CONNECTION', MultitenantConnectionProvider, UnitOfWorkModule, DatabaseService],
})
export class DatabaseModule {}
