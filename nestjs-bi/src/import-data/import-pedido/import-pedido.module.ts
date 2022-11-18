import { Module } from '@nestjs/common';
import {ImportEmpresaModule} from '../import-empresa/import-empresa.module';
import {IDSCliente} from './ids-cliente';
import {IDSCondicaoPagamento} from './ids-condicao-pagamento';
import {IDSPedido} from './ids-pedido';
import {IDSTipoPedido} from './ids-tipo-pedido';
import {ImportPedidoController} from './import-pedido.controller';

@Module({
  imports: [
    ImportEmpresaModule,
  ],
  providers: [
    IDSTipoPedido,
    IDSCondicaoPagamento,
    IDSCliente,
    IDSPedido
  ],
  controllers: [
    ImportPedidoController,
  ],
  exports: [
    IDSPedido,
  ],
})
export class ImportPedidoModule {}
