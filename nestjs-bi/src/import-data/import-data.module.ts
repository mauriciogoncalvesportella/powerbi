import { Module } from '@nestjs/common';
import { ImportEmpresaModule } from './import-empresa/import-empresa.module';
import {ImportPedidoModule} from './import-pedido/import-pedido.module';
import {ImportProdutoModule} from './import-produto/import-produto.module';
import { ImportCampanhaModule } from './import-campanha/import-campanha.module';

@Module({
  imports: [
    ImportPedidoModule,
    ImportEmpresaModule,
    ImportProdutoModule,
    ImportCampanhaModule,
  ],
})
export class ImportDataModule {}
