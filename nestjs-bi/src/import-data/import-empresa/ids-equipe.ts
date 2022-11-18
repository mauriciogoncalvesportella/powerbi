import { Injectable } from "@nestjs/common";
import { CadEquipeEntity } from "src/database/entity/tenant/cad_equipe.entity";
import {UnitOfWorkEntity} from "src/database/unit-of-work/uow.provider";
import { IImportData } from "../import-data.interface";
import { ImportDataService } from "../import-data.service";
import {IDSVendedor} from "./ids-vendedor";

type MyEntity = CadEquipeEntity;

@Injectable()
export class IDSEquipe extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
    private idsVendedor: IDSVendedor,
  ) {
    super(unitOfWorkEntity, CadEquipeEntity)
  }

  public async importData (entities: MyEntity[]): Promise<any> {
    const check = {}

    for (const entity of entities) {
      check[entity.cd] = true
    }

    for (const entity of entities) {
      if (entity.cdEquipePai != null && !check[entity.cdEquipePai]) {
        await this.has(entity.cdEquipePai)
      }

      if (entity.cdResponsavel != null) {
        await this.idsVendedor.has(entity.cdResponsavel)
      }
    }
    await this.unitOfWorkEntity.save(entities)
  }
}
