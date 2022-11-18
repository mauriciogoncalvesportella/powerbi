import {Injectable} from "@nestjs/common";
import {CadVendedorMetaMensalEntity} from "src/database/entity/tenant/cad_vendedor_meta_mensal.entity";
import {UnitOfWorkEntity} from "src/database/unit-of-work/uow.provider";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSVendedor} from "./ids-vendedor";

type MyEntity = CadVendedorMetaMensalEntity

@Injectable()
export class IDSVendedorMetaMensal extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
    private idsVendedor: IDSVendedor
  ) {
    super(unitOfWorkEntity, CadVendedorMetaMensalEntity)
  }

  public async importData (entities: MyEntity[]) {
    for (const entity of entities) {
      await this.idsVendedor.has(entity.cdVendedor)
    }
    await this.unitOfWorkEntity.save(entities)
  }
}
