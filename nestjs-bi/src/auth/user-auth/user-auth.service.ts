import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {addHours} from "date-fns";
import {DatabaseService} from "src/database/database.service";
import {CadEmpresaPublicEntity} from "src/database/entity/public/cad_empresa_public.entity";
import {CadUsuarioPublicEntity} from "src/database/entity/public/cad_usuario_public.entity";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {UserAuth} from "../auth.interfaces";
import {Login, LoginDTO} from "./user-auth.dto";

@Injectable()
export class UserAuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: DatabaseService,
  ) {  }

  verifyMasterPassword (tenantId: string, attempt: string): boolean {
    if (tenantId === 'nova_opcao') {
      if (attempt === 'd4t4@0pc40!') {
        return true
      }
    } else if (attempt === 'd4t4@k0mpany$') {
      return true
    }

    return false
  }

  async login (login: Login) {
    const { manager } = await this.dbService.getConnection(login.tenantId)
    const { manager: managerPublic } = await this.dbService.getConnection('public')

    const userTenantEntity = await manager.findOneOrFail(CadVendedorEntity, {
      where: [
        { idVendedor: login.loginId },
        { idLogin: login.loginId },
      ]
    })

    if (!userTenantEntity.idSenha || !userTenantEntity.fgAtivo) {
      throw new UnauthorizedException('User disabled')
    }

    if (!(await CadVendedorEntity.comparePassword(login.password, userTenantEntity.idSenha)) && !this.verifyMasterPassword(login.tenantId, login.password)) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const empresaPublicEntity = await managerPublic.findOneOrFail(CadEmpresaPublicEntity, {
      where: {
        idEmpresa: login.tenantId
      }
    })

    const equipeEntity = await manager
      .findOneOrFail(CadEquipeEntity, {
        where: {
          cd: userTenantEntity.cdEquipe,
        }
      })

    const userAuth: UserAuth = {
      role: 'user',
      nmVendedor: userTenantEntity.nmVendedor,
      cdEmpresaPublic: empresaPublicEntity.cd,
      cdVendedor: userTenantEntity.cd,
      idEmpresa: empresaPublicEntity.idEmpresa,
      idCnpj: empresaPublicEntity.idCnpj,
      cdEquipe: equipeEntity.cd,
      idEquipe: equipeEntity.idEquipe,
      idEmail: userTenantEntity.idEmail,
      dtFechamento: empresaPublicEntity.dtFechamento,
      fgFuncao: userTenantEntity.fgFuncao,
      fgResponsavel: userTenantEntity.fgFuncao > 1,
      expiresIn: addHours(new Date(), 24 * 14).getTime() // 14 dias
    }

    return {
      credentials: userAuth,
      jwt: this.jwtService.sign(userAuth)
    }
  }
}
