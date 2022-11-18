import { Module } from '@nestjs/common';
import {ImportPedidoModule} from '../import-pedido/import-pedido.module';
import {IDSCategoria} from './ids-categoria';
import {IDSFabrica} from './ids-fabrica';
import {IDSPedidoProduto} from './ids-pedido-produto'
import {IDSProduto} from './ids-produto';
import {IDSSubtabela} from './ids-subtabela';
import {IDSTabelaPreco} from './ids-tabela-preco';
import {ImportProdutoController} from './import-produto.controller';

@Module({
  imports: [
    ImportPedidoModule,
  ],
  providers: [
    IDSSubtabela,
    IDSCategoria,
    IDSTabelaPreco,
    IDSFabrica,
    IDSProduto,
    IDSPedidoProduto,
  ],
  controllers: [
    ImportProdutoController
  ],
  exports: [
    IDSProduto,
    IDSFabrica,
  ],
})
export class ImportProdutoModule {}
