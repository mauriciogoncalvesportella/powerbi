import {Inject, Injectable} from "@nestjs/common";
import {CadCampanhaEntity} from "src/database/entity/tenant/cad_campanha.entity";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSFabrica} from "../import-produto/ids-fabrica";

type MyEntity = CadCampanhaEntity

@Injectable()
export class IDSCampanha extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
    private readonly idsFabrica: IDSFabrica,
  ) {
    super (uow, CadCampanhaEntity)
  }

  async importData(entities: MyEntity[]) {
    for (const entity of entities) {
      if (entity.cdFabrica != null) {
        await this.idsFabrica.has(entity.cdFabrica)
      }
    }
    await this.repository.save(entities)
  }
}

