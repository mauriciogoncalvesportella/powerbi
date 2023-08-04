import { CadClienteEntity } from "src/database/entity/tenant/cad_cliente.entity";
import { CadProdutoEntity } from "src/database/entity/tenant/cad_produto.entity";
import { VdPedidoEntity } from "src/database/entity/tenant/vd_pedido.entity";
import { VdPedidoProdutoEntity } from "src/database/entity/tenant/vd_pedido_produto.entity";

export interface OrderProductDTO extends VdPedidoProdutoEntity {
  product: CadProdutoEntity
}

export interface OrderDTO extends VdPedidoEntity {
  client: CadClienteEntity
}

export interface FavoriteProductDTO {
  code: number,
  label: string,
}

export interface IBaseDailyBarsChart {
  goal: number,
  dates: string[],
  values: number[],
  goalValues: number[]
}

export interface IBaseResumeChart {
  cds: number[],
  labels: string[],
  values: number[],
  goalValues: number[],
  types: number[] // 0- Team, 1- seller
}

export interface IBaseDateValue {
  date: string,
  value: number
}

export class DateOrYearMonthParam {
  public yearMonthParam: string
  public dateParam: string[]

  constructor (
    public type: 'yearMonth' | 'dates',
    param: string | string[]
  ) {
    if (type === 'yearMonth' && typeof param === 'string') {
      this.yearMonthParam = param
      this.dateParam = ['1998-08-07', '1998-08-07']
    } else if (typeof param === 'object') {
      this.yearMonthParam = 'impossible';
      this.dateParam = param
    }
  }
}
