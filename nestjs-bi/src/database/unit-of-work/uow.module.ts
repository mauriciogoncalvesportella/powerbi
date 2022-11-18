import { Module } from '@nestjs/common';
import {UnitOfWorkInterceptor} from './uow.interceptor';
import {UnitOfWorkEntity} from './uow.provider';

@Module({
  providers: [UnitOfWorkEntity],
  exports: [UnitOfWorkEntity]
})
export class UnitOfWorkModule {}
