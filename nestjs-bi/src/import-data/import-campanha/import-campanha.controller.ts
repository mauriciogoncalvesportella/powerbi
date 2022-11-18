import {Body, Controller, ParseArrayPipe, Post, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {CadCampanhaEntity} from "src/database/entity/tenant/cad_campanha.entity";
import {CadCampanhaProdutoEntity} from "src/database/entity/tenant/cad_campanha_produto.entity";
import { UnitOfWorkInterceptor } from "src/database/unit-of-work/uow.interceptor";
import {IDSCampanha} from "./ids-campanha";
import {IDSCampanhaProduto} from "./ids-campanha-produto";

@UseInterceptors(UnitOfWorkInterceptor)
@UseGuards(JwtGuard)
@Role('commerce')
@Controller('import/campanha-module')
export class ImportCampanhaController {
  constructor(
    private readonly idsCampanha: IDSCampanha,
    private readonly idsCampanhaProduto: IDSCampanhaProduto
  ) {}

  @Post('campanha')
  async addCampanha (@Body(new ParseArrayPipe({ items: CadCampanhaEntity })) data: CadCampanhaEntity[]) {
    await this.idsCampanha.importData(data)
  }

  @Post('campanha-produto')
  async addCampanhaProduto (@Body(new ParseArrayPipe({ items: CadCampanhaProdutoEntity })) data: CadCampanhaProdutoEntity[]) {
    await this.idsCampanhaProduto.importData(data)
  }
}
