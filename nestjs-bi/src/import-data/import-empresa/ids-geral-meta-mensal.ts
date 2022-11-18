import {Injectable} from "@nestjs/common";
import {CadGeralMetaMensal} from "src/database/entity/tenant/cad_geral_meta_mensal.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadGeralMetaMensal

@Injectable()
export class IDSGeralMetaMensal extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
  ) {
    super(unitOfWorkEntity, CadGeralMetaMensal)
  }
}
