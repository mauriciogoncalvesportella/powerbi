import {Inject, Injectable} from "@nestjs/common";
import {getDay, add, format, addMonths} from "date-fns";
import {DatabaseService} from "src/database/database.service";
import {CadEmpresaPublicEntity} from "src/database/entity/public/cad_empresa_public.entity";
import {CadEmpresaEntity} from "src/database/entity/tenant/cad_empresa.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, Entity, Equal} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";

type MyEntity = CadEmpresaEntity

@Injectable()
export class IDSEmpresa extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
    private requestMetadata: RequestMetadata
  ) {
    super(unitOfWorkEntity, CadEmpresaEntity)
  }

  dtFechamentoMap: Map<number, number> = new Map()

  async getAdjustedYearMonth (dtEntrega: string): Promise<string | null> {
    const dtFechamento = await this.requestMetadata.dtFechamento()
    const date = new Date(dtEntrega)
    if (dtFechamento && getDay(date) > dtFechamento) {
      return format(addMonths(new Date(dtEntrega), 1), 'yyyy-MM')
    } else {
      return format(new Date(dtEntrega), 'yyyy-MM')
    }
  }
}
