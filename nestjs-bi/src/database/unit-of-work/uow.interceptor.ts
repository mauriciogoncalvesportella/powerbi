import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, Scope } from "@nestjs/common";
import { resolve } from "path";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { UnitOfWorkEntity } from "./uow.provider";

@Injectable({ scope: Scope.REQUEST })
export class UnitOfWorkInterceptor implements NestInterceptor {
  constructor (
    private readonly unitOfWorkEntity: UnitOfWorkEntity
  ) { }

  async intercept (context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    await this.unitOfWorkEntity.queryRunner.startTransaction()
    const commit = async (): Promise<void> => {
      await this.unitOfWorkEntity.queryRunner.commitTransaction()
      await this.unitOfWorkEntity.queryRunner.release()
    }

    const rollback = async (): Promise<void> => {
      await this.unitOfWorkEntity.queryRunner.rollbackTransaction()
      await this.unitOfWorkEntity.queryRunner.release()
    }
    
    return next
      .handle()
      .pipe(
        tap(
          commit,
          rollback,
        )
      )
  }
}
