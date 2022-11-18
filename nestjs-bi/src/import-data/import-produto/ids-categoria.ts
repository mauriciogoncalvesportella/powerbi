import {Inject, Injectable} from "@nestjs/common";
import {CadCategoriaEntity} from "src/database/entity/tenant/cad_categoria.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadCategoriaEntity

@Injectable()
export class IDSCategoria extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
  ) {
    super(uow, CadCategoriaEntity)
  }

  public async importData (entities: MyEntity[]): Promise<any> {
    const check = {}

    for (const entity of entities) {
      check[entity.cd] = true
    }

    for (const entity of entities) {
      if (entity.cdCategoriaPai != null && !check[entity.cdCategoriaPai]) {
        await this.has(entity.cdCategoriaPai)
      }
    }

    await this.unitOfWorkEntity.save(entities)
  }
}
