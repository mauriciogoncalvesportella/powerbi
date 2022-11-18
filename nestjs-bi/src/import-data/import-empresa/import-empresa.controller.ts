import {Body, Controller, ParseArrayPipe, Post, Req, UseFilters, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {CadEmpresaEntity} from "src/database/entity/tenant/cad_empresa.entity";
import {CadEmpresaMetaMensalEntity} from "src/database/entity/tenant/cad_empresa_meta_mensal.entity";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadEquipeMetaMensalEntity} from "src/database/entity/tenant/cad_equipe_meta_mensal.entity";
import {CadGeralMetaMensal} from "src/database/entity/tenant/cad_geral_meta_mensal.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {CadVendedorMetaMensalEntity} from "src/database/entity/tenant/cad_vendedor_meta_mensal.entity";
import { UnitOfWorkInterceptor } from "src/database/unit-of-work/uow.interceptor";
import {DBExceptionFilter} from "src/shared/dbexception.filter";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {IDSEmpresa} from "./ids-empresa";
import {IDSEmpresaMetaMensal} from "./ids-empresa-meta-mensal";
import {IDSEquipe} from "./ids-equipe";
import {IDSEquipeMetaMensal} from "./ids-equipe-meta-mensal";
import {IDSGeralMetaMensal} from "./ids-geral-meta-mensal";
import {IDSVendedor} from "./ids-vendedor";
import {IDSVendedorMetaMensal} from "./ids-vendedor-meta-mensal";

@UseInterceptors(UnitOfWorkInterceptor)
@UseGuards(JwtGuard)
@Role('commerce')
@Controller('import/empresa-module')
export class ImportEmpresaController {
  constructor(
    private readonly idsGeralMetaMensal: IDSGeralMetaMensal,
    private readonly idsEquipeMetaMensal: IDSEquipeMetaMensal,
    private readonly idsVendedorMetaMensal: IDSVendedorMetaMensal,
    private readonly idsEmpresaMetaMensal: IDSEmpresaMetaMensal,
    private readonly idsEmpresa: IDSEmpresa,
    private readonly idsEquipe: IDSEquipe,
    private readonly idsVendedor: IDSVendedor,
    private readonly requestMedata: RequestMetadata,
  ) { }

  @Post('empresa')
  async addEmpresa (@Body(new ParseArrayPipe({ items: CadEmpresaEntity })) data: CadEmpresaEntity[]) {
    await this.idsEmpresa.importData(data)
  }

  @Post('equipe')
  async addEquipe (@Body(new ParseArrayPipe({ items: CadEquipeEntity })) data: CadEquipeEntity[]) {
    await this.idsEquipe.importData(data)
  }

  @Post('equipe-meta-mensal')
  async addEquipeMetaMensal (@Body(new ParseArrayPipe({ items: CadEquipeMetaMensalEntity })) data: CadEquipeMetaMensalEntity[]) {
    await this.idsEquipeMetaMensal.importData(data)
  }
  
  @Post('empresa-meta-mensal')
  async addEmpresaParametro (@Body(new ParseArrayPipe({ items: CadEmpresaMetaMensalEntity })) data: CadEmpresaMetaMensalEntity[]) {
    await this.idsEmpresaMetaMensal.importData(data)
  }

  @Post('geral-meta-mensal')
  async addGeralMetaMensal (@Body(new ParseArrayPipe({ items: CadGeralMetaMensal })) data: CadGeralMetaMensal[]) {
    await this.idsGeralMetaMensal.importData(data)
  }

  @Post('vendedor-meta-mensal')
  async addVendedorMetaMensal (@Body(new ParseArrayPipe({ items: CadVendedorMetaMensalEntity })) data: CadVendedorMetaMensalEntity[]) {
    await this.idsVendedorMetaMensal.importData(data)
  }

  @Post('vendedor')
  async addVendedor (@Body(new ParseArrayPipe({ items: CadVendedorEntity })) data: CadVendedorEntity[]) {
    await this.idsVendedor.importData(data)
  }
}
