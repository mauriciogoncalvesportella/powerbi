import {Inject, Injectable} from "@nestjs/common";
import {CadCampanhaProdutoEntity} from "src/database/entity/tenant/cad_campanha_produto.entity";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {Connection} from "typeorm";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSProduto} from "../import-produto/ids-produto";
import {IDSCampanha} from "./ids-campanha";

type MyEntity = CadCampanhaProdutoEntity

@Injectable()
export class IDSCampanhaProduto extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
    private idsCampanha: IDSCampanha,
    private idsProduto: IDSProduto,
  ) {
    super (uow, CadCampanhaProdutoEntity)
  }

  async importData(entities: MyEntity[]) {
    for (const entity of entities) {
      await this.idsCampanha.has(entity.cdCampanha)
      await this.idsProduto.has(entity.cdProduto) 
    }
    await this.repository.save(entities)
  }
}
