import {NotImplementedException} from "@nestjs/common";
import {CadClienteEntity} from "src/database/entity/tenant/cad_cliente.entity";
import {CadCondicaoPagamentoEntity} from "src/database/entity/tenant/cad_codicao_pagamento.entity";
import {CadEmpresaEntity} from "src/database/entity/tenant/cad_empresa.entity";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadProdutoEntity} from "src/database/entity/tenant/cad_produto.entity";
import {CadTipoPedidoEntity} from "src/database/entity/tenant/cad_tipo_pedido.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import {VdPedidoProdutoEntity} from "src/database/entity/tenant/vd_pedido_produto.entity";
import {SelectQueryBuilder} from "typeorm";
import {GetOrder} from "./order.types";
import { format } from 'date-fns'

export namespace GetOrderTypeOrm {
  export type Raw = Partial<VdPedidoEntity> & {
    empresa: Partial<CadEmpresaEntity>,
    cond_pgto: Partial<CadCondicaoPagamentoEntity>,
    vendedor: Partial<CadVendedorEntity> & {
      equipe: Partial<CadEquipeEntity>
    },
    tipo_pedido: Partial<CadTipoPedidoEntity>,
    cliente: Partial<CadClienteEntity>,
    pedido_produto: (Partial<VdPedidoProdutoEntity> & {
      produto: Partial<CadProdutoEntity>
    })[]
  }

  export abstract class BaseStrategy {
    params: GetOrder.BaseStrategy;
    abstract execute (qb: SelectQueryBuilder<Raw>): SelectQueryBuilder<Raw>;
  }

  export function electStrategy (params: GetOrder.BaseStrategy): BaseStrategy {
    if (params instanceof GetOrder.FromCustomerStrategy)
      return new FromCustomer(params)
    if (params instanceof GetOrder.FromSellerStrategy)
      return new FromSeller(params)
    throw new NotImplementedException()
  }

  export class FromCustomer extends BaseStrategy {
    constructor (params: GetOrder.FromCustomerStrategy) {
      super()
      this.params = params
    }

    public execute(qb: SelectQueryBuilder<Raw>) {
      const params = this.params as GetOrder.FromCustomerStrategy
      const { customerCode, startYearMonth, endYearMonth } = params
      qb
        .andWhere('cliente.cd = :customerCode', { customerCode })
        .andWhere('pedido.idMesAno BETWEEN :startYearMonth AND :endYearMonth', { startYearMonth, endYearMonth })
      return qb
    }
  }

  export class FromSeller extends BaseStrategy {
    constructor (params: GetOrder.FromSellerStrategy) {
      super()
      this.params = params
    }

    public execute (qb: SelectQueryBuilder<Raw>) {
      const params = this.params as GetOrder.FromSellerStrategy
      const { sellerCode, param } = params
      qb.andWhere('(vendedor.cd = :sellerCode OR pedido."cdVendedor2" = :sellerCode)', { sellerCode })

      if (param.type === 'yearMonth') {
        qb.andWhere('pedido.idMesAno = :yearMonth', { yearMonth: param.yearMonthParam })
      } else {
        qb.andWhere('pedido.dtEmissao >= :startDate AND pedido.dtEmissao <= :endDate', {
          startDate: param.dateParam[0],
          endDate: param.dateParam[1]
        })
      }

      return qb
    }
  }

  export function map (raw: Raw): GetOrder.OrderInfo {
    return {
      code: raw.cd,
      yearMonth: raw.idMesAno,
      orderId: raw.idPedido,
      tabletId: raw.idTablet,
      invoiceId: raw.idNotaFiscal,
      status: raw.fgSituacao,
      shippingType: raw.fgTipoFrete,
      seller: {
        code: raw.vendedor.cd,
        name: raw.vendedor.nmVendedor,
        teamCode: raw.vendedor.equipe.cd,
        teamName: raw.vendedor.equipe.nmEquipe
      },
      orderType: {
        code: raw.tipo_pedido.cd,
        name: raw.tipo_pedido.nmTipo
      },
      customer: {
        code: raw.cliente.cd,
        name: raw.cliente.nmRazao,
        tradingName: raw.cliente.idFantasia
      },
      paymentTerms: {
        code: raw.cond_pgto.cd,
        name: raw.cond_pgto.nmCondicao,
        average: raw.cond_pgto.nrPrazoMedio,
        installments: raw.cond_pgto.qtParcelas
      },
      company: {
        code: raw.empresa.cd,
        name: raw.empresa.nmRazao,
        tradingName: raw.empresa.idFantasia
      },
      values: {
        products: raw.vlProdutos,
        disconts: raw.vlDesconto,
        icmsTax: raw.vlIcmsst,
        ipiTax: raw.vlIpi,
        shipping: raw.vlFrete,
        comission: raw.vlComissao,
        cost: raw.vlCusto,
        profit: raw.vlLucro,
        comissionPercentual: raw.pcComissao,
        markupPercentual: raw.pcMarkup,
        profitPercentual: raw.pcLucro
      },
      dates: {
        issue: format(new Date(raw.dtEmissao), 'yyyy-MM-dd'),
        delivery: format(new Date(raw.dtEntrega), 'yyyy-MM-dd')
      },
      productResume: raw.pedido_produto.map(item => ({
        code: item.cd,
        id: item.produto.idProduto,
        name: item.produto.nmProduto,
        quantity: item.qtProduto,
        total: item.vlTotal
      }))
    }
  }
}
