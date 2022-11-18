import {Injectable, Scope} from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {UnitOfWorkEntity} from "src/database/unit-of-work/uow.provider";
import { Connection, EntityManager, EntityTarget, Repository, BaseEntity, FindOneOptions } from "typeorm";
import { IDNotFoundError } from "./import-data.errors";

export type ObjectType<T> = { new (): T } | Function;

export class ImportDataService<T> {
  protected repository: Repository<T>;

  constructor (
    protected unitOfWorkEntity: UnitOfWorkEntity,
    private entityClass: new () => T,
  ) {
    this.repository = this.unitOfWorkEntity.getRepository(this.entityClass)
    // this.repository = this.connection.manager.getRepository(this.entityClass)
  }

  async has (cd: number,/* manager: EntityManager = null*/): Promise<T> {
    // manager = manager ?? this.connection.manager
    // return await manager.findOneOrFail(this.entityClass.name, cd)
    return await this.repository.findOneOrFail(cd)
  }

  protected async injectEntityCD (entity: T, findOptions: FindOneOptions<T>) {
    const dbEntity = await this.unitOfWorkEntity.findOne(this.entityClass, findOptions)
    if (dbEntity) {
      entity['cd'] = dbEntity['cd']
    }
    return entity
  }

  async importData (entities: T[]) {
    await this.repository.save(entities as any[])
  }
}
