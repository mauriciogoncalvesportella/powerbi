import { Global, Module } from '@nestjs/common';
import ConnectionProvider from './connection.provider'
import {DatabaseService} from './database.service';
import { UnitOfWorkModule } from './unit-of-work/uow.module';

@Global()
@Module({
  imports: [UnitOfWorkModule],
  providers: [ConnectionProvider, DatabaseService],
  exports: ['CONNECTION', UnitOfWorkModule, DatabaseService],
})
export class DatabaseModule {}
