import {Injectable} from "@nestjs/common";
import {CadEmpresaEntity} from "src/database/entity/tenant/cad_empresa.entity";
import {CadEmpresaMetaMensalEntity} from "src/database/entity/tenant/cad_empresa_meta_mensal.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import { QueryFailedError } from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSEmpresa} from "./ids-empresa";

type MyEntity = CadEmpresaMetaMensalEntity

@Injectable()
export class IDSEmpresaMetaMensal extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
    private idsEmpresa: IDSEmpresa,
  ) {
    super(unitOfWorkEntity, CadEmpresaMetaMensalEntity)
  }

  public async importData (entities: MyEntity[]) {
    for (const entity of entities) {
      await this.idsEmpresa.has(entity.cdEmpresa)
    }

    await this.unitOfWorkEntity.save(entities)
  }
}
