import {Body, Controller, ParseArrayPipe, Post, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {CadClienteEntity} from "src/database/entity/tenant/cad_cliente.entity";
import {CadCondicaoPagamentoEntity} from "src/database/entity/tenant/cad_codicao_pagamento.entity";
import {CadTipoPedidoEntity} from "src/database/entity/tenant/cad_tipo_pedido.entity";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import { UnitOfWorkInterceptor } from "src/database/unit-of-work/uow.interceptor";
import {IDSCliente} from "./ids-cliente";
import {IDSCondicaoPagamento} from "./ids-condicao-pagamento";
import {IDSPedido} from "./ids-pedido";
import {IDSTipoPedido} from "./ids-tipo-pedido";

@UseGuards(JwtGuard)
@UseInterceptors(UnitOfWorkInterceptor)
@Role('commerce')
@Controller('import/pedido-module')
export class ImportPedidoController {
  constructor (
    private readonly idsTipoPedido: IDSTipoPedido,
    private readonly idsCondicaoPagamento: IDSCondicaoPagamento,
    private readonly idsCliente: IDSCliente,
    private readonly idsPedido: IDSPedido,
  ) {}

  @Post('tipo-pedido')
  async addTipoPedido (@Body(new ParseArrayPipe({ items: CadTipoPedidoEntity })) data: CadTipoPedidoEntity[]) {
    await this.idsTipoPedido.importData(data)
  }

  @Post('condicao-pagamento')
  async addCondicaoPagamento (@Body(new ParseArrayPipe({ items: CadCondicaoPagamentoEntity })) data: CadCondicaoPagamentoEntity[]) {
    await this.idsCondicaoPagamento.importData(data)
  }

  @Post('cliente')
  async addCliente (@Body(new ParseArrayPipe({ items: CadClienteEntity })) data: CadClienteEntity[]) {
    await this.idsCliente.importData(data)
  }

  @Post('pedido')
  async addPedido (@Body(new ParseArrayPipe({ items: VdPedidoEntity })) data: VdPedidoEntity[]) {
    await this.idsPedido.importData(data)
  }
}
