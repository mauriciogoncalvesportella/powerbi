import {Inject, Injectable, Scope} from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadEquipeMetaMensalEntity} from "src/database/entity/tenant/cad_equipe_meta_mensal.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection, Entity, EntityManager, FindOneOptions} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSEquipe} from "./ids-equipe";

type MyEntity = CadEquipeMetaMensalEntity

@Injectable()
export class IDSEquipeMetaMensal extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
    private idsEquipe: IDSEquipe,
  ) {
    super(unitOfWorkEntity, CadEquipeMetaMensalEntity)
  }

  public async importData (entities: MyEntity[]) {
    for (const entity of entities) {
      await this.idsEquipe.has(entity.cdEquipe)
    }
    await this.unitOfWorkEntity.save(entities)
  }
}
