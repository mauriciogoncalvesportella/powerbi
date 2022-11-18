import {Inject, Injectable} from "@nestjs/common";
import {CadCondicaoPagamentoEntity} from "src/database/entity/tenant/cad_codicao_pagamento.entity";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection, Entity} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSEmpresa} from "../import-empresa/ids-empresa";
import {IDSCliente} from "./ids-cliente";
import {IDSCondicaoPagamento} from "./ids-condicao-pagamento";
import {IDSTipoPedido} from "./ids-tipo-pedido";

type MyEntity = VdPedidoEntity

@Injectable()
export class IDSPedido extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
    private idsTipoPedido: IDSTipoPedido,
    private idsCondicaoPagamento: IDSCondicaoPagamento,
    private idsCliente: IDSCliente,
    private idsEmpresa: IDSEmpresa,
  ) {
    super(uow, VdPedidoEntity)
  }

  public async importData(entities: MyEntity[]) {
    for (const entity of entities) {
      await this.idsTipoPedido.has(entity.cdTipoPedido)
      await this.idsCondicaoPagamento.has(entity.cdCondicaoPagamento)
      await this.idsCliente.has(entity.cdCliente)
      await this.idsEmpresa.has(entity.cdEmpresa)
      // entity.idMesAno = await this.idsEmpresa.getAdjustedYearMonth(entity.dtEntrega)
      await this.repository.save(entity)
    }
  }
}
