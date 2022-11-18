import {Inject, Injectable} from "@nestjs/common";
import {CadTabelaPrecoEntity} from "src/database/entity/tenant/cad_tabela_preco.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadTabelaPrecoEntity

@Injectable()
export class IDSTabelaPreco extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWork: UnitOfWorkEntity,
  ) {
    super(unitOfWork, CadTabelaPrecoEntity) }
}
