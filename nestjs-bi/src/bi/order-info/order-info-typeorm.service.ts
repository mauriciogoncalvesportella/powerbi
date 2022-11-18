import {Inject, Injectable, NotImplementedException} from "@nestjs/common";
import {CadClienteEntity} from "src/database/entity/tenant/cad_cliente.entity";
import {CadCondicaoPagamentoEntity} from "src/database/entity/tenant/cad_codicao_pagamento.entity";
import {CadEmpresaEntity} from "src/database/entity/tenant/cad_empresa.entity";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadProdutoEntity} from "src/database/entity/tenant/cad_produto.entity";
import {CadTipoPedidoEntity} from "src/database/entity/tenant/cad_tipo_pedido.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import {VdPedidoProdutoEntity} from "src/database/entity/tenant/vd_pedido_produto.entity";
import {Connection, EntityManager, QueryBuilder} from "typeorm";
import {GetOrderTypeOrm} from "./order-info-typeorm.types";
import {IOrderInfoService} from "./order-info.controller";
import {GetOrder} from "./order.types";

@Injectable()
export class OrderInfoTypeormService implements IOrderInfoService {
  protected manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    public connection: Connection,
  ) {
    this.manager = connection.manager
  }

  public async getOrderList(params: GetOrder.BaseStrategy): Promise<GetOrder.OrderInfo[]> {
    const orders = this.manager.createQueryBuilder<GetOrderTypeOrm.Raw>(VdPedidoEntity, 'pedido')
      .innerJoinAndMapOne('pedido.empresa', CadEmpresaEntity, 'empresa', 'pedido.cdEmpresa = empresa.cd')
      .innerJoinAndMapOne('pedido.cond_pgto', CadCondicaoPagamentoEntity, 'cond_pgto', 'pedido.cdCondicaoPagamento = cond_pgto.cd')
      .innerJoinAndMapOne('pedido.vendedor', CadVendedorEntity, 'vendedor', 'pedido.cdVendedor = vendedor.cd')
      .innerJoinAndMapOne('vendedor.equipe', CadEquipeEntity, 'equipe', 'vendedor.cdEquipe = equipe.cd')
      .innerJoinAndMapOne('pedido.tipo_pedido', CadTipoPedidoEntity, 'tipo_pedido', 'pedido.cdTipoPedido = tipo_pedido.cd')
      .innerJoinAndMapOne('pedido.cliente', CadClienteEntity, 'cliente', 'pedido.cdCliente = cliente.cd')
      .innerJoinAndMapMany('pedido.pedido_produto', VdPedidoProdutoEntity, 'pedido_produto', 'pedido.cd = pedido_produto.cdPedido')
      .innerJoinAndMapOne('pedido_produto.produto', CadProdutoEntity, 'produto', 'pedido_produto.cdProduto = produto.cd')
      .andWhere('pedido.fgSituacao IN (1, 2, 4, 5)')

    const strategy = GetOrderTypeOrm.electStrategy(params)
    strategy.execute(orders)
    orders.orderBy('pedido.dtEmissao', 'DESC')
    const raw = await orders.getMany()

    return raw.map(order => GetOrderTypeOrm.map(order))
  }
}
