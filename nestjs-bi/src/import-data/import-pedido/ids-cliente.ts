import {Inject, Injectable} from "@nestjs/common";
import {CadClienteEntity} from "src/database/entity/tenant/cad_cliente.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSVendedor} from "../import-empresa/ids-vendedor";

type MyEntity = CadClienteEntity

@Injectable()
export class IDSCliente extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
    private readonly idsVendedor: IDSVendedor
  ) {
    super(uow, CadClienteEntity)
  }

  public async importData(entities: MyEntity[]) {
    for (const entity of entities) {
      if (entity.cdVendedor != null) {
        await this.idsVendedor.has(entity.cdVendedor)
      }
      await this.repository.save(entity)
    }
    // await this.repository.save(entities) 
  }
}
