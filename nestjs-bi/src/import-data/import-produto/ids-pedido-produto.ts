import {BadRequestException, Inject, Injectable, forwardRef} from "@nestjs/common";
import {VdPedidoProdutoEntity} from "src/database/entity/tenant/vd_pedido_produto.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSPedido} from "../import-pedido/ids-pedido";
import {IDSFabrica} from "./ids-fabrica";
import {IDSProduto} from "./ids-produto";
import {IDSSubtabela} from "./ids-subtabela";
import {IDSTabelaPreco} from "./ids-tabela-preco";
import { VdPedidoEntity } from "src/database/entity/tenant/vd_pedido.entity";

type MyEntity = VdPedidoProdutoEntity

@Injectable()
export class IDSPedidoProduto extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    uow: UnitOfWorkEntity,
    private idsSubtabela: IDSSubtabela,
    @Inject(forwardRef(() => IDSPedido))
    private idsPedido: IDSPedido,
    private idsProduto: IDSProduto,
    private idsTabelaPreco: IDSTabelaPreco,
    private idsFabrica: IDSFabrica,
  ) {
    super(uow, VdPedidoProdutoEntity)
  }

  public async importData(entities: MyEntity[]) {
    let cdPedido: number = entities[0].cdPedido
    for (const entity of entities) {
      if (entity.cdPedido !== cdPedido) {
        throw new BadRequestException('Todos os produtos precisam estar vinculados ao mesmo pedido')
      }
    }

    await this.unitOfWorkEntity.update(
      VdPedidoProdutoEntity,
      { fgSituacao: 9 },
      { cdPedido: cdPedido }
    )

    for (const entity of entities) {
      await this.idsPedido.has(entity.cdPedido)
      await this.idsProduto.has(entity.cdProduto)

      if (entity.cdTabelaPreco != null) {
        await this.idsTabelaPreco.has(entity.cdTabelaPreco) 
      }
      
      if (entity.cdSubtabela != null) {
        await this.idsSubtabela.has(entity.cdSubtabela)
      }

      if (entity.cdFabrica != null) {
        await this.idsFabrica.has(entity.cdFabrica)
      }

      entity.fgSituacao = 1

      try {
        await this.repository.save(entity)
      } catch (err: any) {
        throw err
      }
    }

    await this.unitOfWorkEntity.delete(VdPedidoProdutoEntity, { fgSituacao: 9 })
  }

  public async deletePedidoProdutoFromPedido (cdPedido: number) {
    await this.repository.delete({ cdPedido })
  }
}
