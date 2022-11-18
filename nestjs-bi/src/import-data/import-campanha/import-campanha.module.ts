import { forwardRef, Module } from '@nestjs/common';
import {ImportProdutoModule} from '../import-produto/import-produto.module';
import {IDSCampanha} from './ids-campanha';
import {IDSCampanhaProduto} from './ids-campanha-produto';
import {ImportCampanhaController} from './import-campanha.controller';

@Module({
  imports: [
    ImportProdutoModule,
  ],
  controllers: [
    ImportCampanhaController
  ],
  providers: [
    IDSCampanha,
    IDSCampanhaProduto
  ],
  exports: [
    IDSCampanha,
  ],
})
export class ImportCampanhaModule {}
