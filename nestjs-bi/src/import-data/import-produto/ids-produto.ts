import {Inject, Injectable} from "@nestjs/common";
import {CadProdutoEntity} from "src/database/entity/tenant/cad_produto.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSCategoria} from "./ids-categoria";
import {IDSFabrica} from "./ids-fabrica";

type MyEntity = CadProdutoEntity

@Injectable()
export class IDSProduto extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
    private idsCategoria: IDSCategoria,
    private idsFabrica: IDSFabrica,
  ) {
    super(uow, CadProdutoEntity)
  }

  public async importData (entities: CadProdutoEntity[]) {
    for (const entity of entities) {
      if (entity.cdCategoria != null) {
        await this.idsCategoria.has(entity.cdCategoria)
      }
      if (entity.cdFabrica != null) {
        await this.idsFabrica.has(entity.cdFabrica)
      }
      await this.repository.save(entity)
    }
  }
}
