import { Module } from '@nestjs/common';
import {RegistryModule} from 'src/registry/registry.module';
import {IDSEmpresa} from './ids-empresa';
import { IDSEmpresaMetaMensal } from './ids-empresa-meta-mensal';
import {IDSEquipe} from './ids-equipe';
import {IDSEquipeMetaMensal} from './ids-equipe-meta-mensal';
import {IDSGeralMetaMensal} from './ids-geral-meta-mensal';
import {IDSVendedor} from './ids-vendedor';
import {IDSVendedorMetaMensal} from './ids-vendedor-meta-mensal';
import {ImportEmpresaController} from './import-empresa.controller';

@Module({
  imports: [
    RegistryModule,
  ],
  providers: [
    IDSEquipeMetaMensal,
    IDSVendedorMetaMensal,
    IDSEmpresaMetaMensal,
    IDSGeralMetaMensal,
    IDSEmpresa,
    IDSEquipe,
    IDSVendedor,
  ],
  controllers: [ImportEmpresaController],
  exports: [
    IDSEmpresa,
    IDSVendedor,
  ]
})
export class ImportEmpresaModule {}
