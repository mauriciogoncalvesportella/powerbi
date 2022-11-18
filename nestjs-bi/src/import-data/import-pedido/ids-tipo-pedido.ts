import {Inject, Injectable} from "@nestjs/common";
import {CadTipoPedidoEntity} from "src/database/entity/tenant/cad_tipo_pedido.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadTipoPedidoEntity

@Injectable()
export class IDSTipoPedido extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
  ) {
    super(uow, CadTipoPedidoEntity)
  }
}
