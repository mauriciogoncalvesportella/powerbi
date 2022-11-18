import {Inject, Injectable} from "@nestjs/common";
import {CadCondicaoPagamentoEntity} from "src/database/entity/tenant/cad_codicao_pagamento.entity";
import {CadSubtabelaEntity} from "src/database/entity/tenant/cad_subtabela.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection, Entity} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadSubtabelaEntity

@Injectable()
export class IDSSubtabela extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
  ) {
    super(uow, CadSubtabelaEntity) }
}
