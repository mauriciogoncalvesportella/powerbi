import {Body, Controller, ParseArrayPipe, Post, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {CadCategoriaEntity} from "src/database/entity/tenant/cad_categoria.entity";
import {CadFabricaEntity} from "src/database/entity/tenant/cad_fabrica.entity";
import {CadProdutoEntity} from "src/database/entity/tenant/cad_produto.entity";
import {CadSubtabelaEntity} from "src/database/entity/tenant/cad_subtabela.entity";
import {CadTabelaPrecoEntity} from "src/database/entity/tenant/cad_tabela_preco.entity";
import {VdPedidoProdutoEntity} from "src/database/entity/tenant/vd_pedido_produto.entity";
import { UnitOfWorkInterceptor } from "src/database/unit-of-work/uow.interceptor";
import {IDSCategoria} from "./ids-categoria";
import {IDSFabrica} from "./ids-fabrica";
import {IDSPedidoProduto} from "./ids-pedido-produto";
import {IDSProduto} from "./ids-produto";
import {IDSSubtabela} from "./ids-subtabela";
import {IDSTabelaPreco} from "./ids-tabela-preco";

@UseInterceptors(UnitOfWorkInterceptor)
@UseGuards(JwtGuard)
@Role('commerce')
@Controller('import/produto-module')
export class ImportProdutoController {
  constructor(
    private readonly idsSubtabela: IDSSubtabela,
    private readonly idsTabelaPreco: IDSTabelaPreco,
    private readonly idsFabrica: IDSFabrica,
    private readonly idsCategoria: IDSCategoria,
    private readonly idsProduto: IDSProduto,
    private readonly idsPedidoProduto: IDSPedidoProduto,
  ) { }

  @Post('subtabela')
  async addSubtabela (@Body(new ParseArrayPipe({ items: CadSubtabelaEntity })) data: CadSubtabelaEntity[]) {
    await this.idsSubtabela.importData(data)
  }

  @Post('tabela-preco')
  async addTabelaPreco (@Body(new ParseArrayPipe({ items: CadTabelaPrecoEntity })) data: CadTabelaPrecoEntity[]) {
    await this.idsTabelaPreco.importData(data)
  }

  @Post('fabrica')
  async addFabrica (@Body(new ParseArrayPipe({ items: CadFabricaEntity })) data: CadFabricaEntity[]) {
    await this.idsFabrica.importData(data)
  }

  @Post('categoria')
  async addCategoria (@Body(new ParseArrayPipe({ items: CadCategoriaEntity })) data: CadCategoriaEntity[]) {
    await this.idsCategoria.importData(data)
  }

  @Post('produto')
  async addProduto (@Body(new ParseArrayPipe({ items: CadProdutoEntity })) data: CadProdutoEntity[]) {
    await this.idsProduto.importData(data)
  }

  @Post('pedido-produto')
  async addPedidoProduto (@Body(new ParseArrayPipe({ items: VdPedidoProdutoEntity })) data: VdPedidoProdutoEntity[]) {
    await this.idsPedidoProduto.importData(data)
  }
}
