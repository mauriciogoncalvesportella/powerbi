import { Module, forwardRef } from '@nestjs/common';
import {ImportEmpresaModule} from '../import-empresa/import-empresa.module';
import {IDSCliente} from './ids-cliente';
import {IDSCondicaoPagamento} from './ids-condicao-pagamento';
import {IDSPedido} from './ids-pedido';
import {IDSTipoPedido} from './ids-tipo-pedido';
import {ImportPedidoController} from './import-pedido.controller';
import { ImportProdutoModule } from '../import-produto/import-produto.module';

@Module({
  imports: [
    ImportEmpresaModule,
    forwardRef(() => ImportProdutoModule)
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
