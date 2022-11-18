import {Inject, Injectable} from "@nestjs/common";
import {CadFabricaEntity} from "src/database/entity/tenant/cad_fabrica.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadFabricaEntity

@Injectable()
export class IDSFabrica extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
  ) {
    super(uow, CadFabricaEntity) }
}
