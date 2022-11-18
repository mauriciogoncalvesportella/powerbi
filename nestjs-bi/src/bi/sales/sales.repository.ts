import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import {VdPedidoProdutoEntity} from "src/database/entity/tenant/vd_pedido_produto.entity";
import {Connection, EntityManager, Equal, In} from "typeorm";
import {OrderDTO, OrderProductDTO} from "./sales.types";

@Injectable()
export class SalesRepository {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    connection: Connection,
  ) {
    this.manager = connection.manager
  }

  private normalizeDate (arr: any[], ...keys: string[]) {
    for (let i = 0; i < arr.length; i++) {
      for (const key of keys) { 
        arr[i][key] = format(new Date(arr[i][key]), 'yyyy-MM-dd')
      }
    }
  }

  async orderFromSellers (cds: number[], dtInit: string, dtEnd: string): Promise<OrderDTO[]> {
    let raw = (await this.manager.createQueryBuilder(VdPedidoEntity, 'pedido')
      .leftJoinAndMapOne('pedido.client', 'CadClienteEntity', 'cliente', 'pedido.cdCliente = cliente.cd')
      .where({
        cdVendedor: In(cds) 
      })
      .andWhere('pedido.dtEntrega >= :dtInit AND pedido.dtEntrega <= :dtEnd', { dtInit, dtEnd })
      .orderBy('pedido.dtEntrega', 'ASC')
      .getMany()) as OrderDTO[]
    this.normalizeDate(raw, 'dtEntrega', 'dtEmissao')
    return raw
  }

  async orderFromSellersYearMonth (cds: number[], yearMonth: string): Promise<OrderDTO[]> {
    let raw = (await this.manager.createQueryBuilder(VdPedidoEntity, 'pedido')
      .leftJoinAndMapOne('pedido.client', 'CadClienteEntity', 'cliente', 'pedido.cdCliente = cliente.cd')
      .where({
        cdVendedor: In(cds),
        idMesAno: Equal(yearMonth)
      })
      .orderBy('pedido.dtEntrega', 'ASC')
      .getMany()) as OrderDTO[]
    this.normalizeDate(raw, 'dtEntrega', 'dtEmissao')
    return raw
  }

  async orderProducts (cdOrder: number): Promise<OrderProductDTO[]> {
    let raw: OrderProductDTO[] = (await this.manager.createQueryBuilder(VdPedidoProdutoEntity, 'pedidoProduto')
      .leftJoinAndMapOne('pedidoProduto.product', 'CadProdutoEntity',  'produto', 'pedidoProduto.cdProduto = produto.cd')
      .where({ cdPedido: Equal(cdOrder) })
      .getMany()) as OrderProductDTO[]
    return raw
  }
}
