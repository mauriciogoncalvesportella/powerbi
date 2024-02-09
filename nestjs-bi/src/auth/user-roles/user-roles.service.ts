import { Inject, Injectable } from "@nestjs/common";
import { CadPerfilAcesso } from "src/database/entity/tenant/cad_perfil_acesso.entity";
import { CadVendedorEntity } from "src/database/entity/tenant/cad_vendedor.entity";
import { UnitOfWorkEntity } from "src/database/unit-of-work/uow.provider";
import { Connection } from "typeorm";
import { UserAuth } from "../auth.interfaces";
import _ from 'lodash'
import { UpdateRolesDTO } from "./user.roles.dto";
import { SellerService } from "src/bi/sales/team/seller.service";
import UserRoles from "./user-roles.enum";

@Injectable()
export class UserRolesService {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private unityOfWorkEntity: UnitOfWorkEntity,
  ) {}

  // <connectionId, <cdPerfilAcesso, <roleName, true | false> > > 
  private profileRolesMap: Record<string, Record<number, Record<string, boolean>>> = {}

  get connectionId () {
    return this.connection.name
  }

  private async getProfileRolesFromDataBase (code: number, useUow: boolean = false): Promise<Record<string, boolean>> {
    const manager = useUow
      ? this.unityOfWorkEntity
      : this.connection.manager

    const perfilAcessoEntity = await manager.findOneOrFail(CadPerfilAcesso, code)

    const rolesMap = {} 
    for (const role of perfilAcessoEntity.roles) {
      rolesMap[role] = true
    }
    return rolesMap
  }

  private async getRolesByProfileCode (profileCode: number) {
    if (this.profileRolesMap[this.connectionId] && this.profileRolesMap[this.connectionId][profileCode]) {
      return this.profileRolesMap[this.connectionId][profileCode]
    }

    if (!this.profileRolesMap[this.connectionId]) {
      this.profileRolesMap[this.connectionId] = {}
    }

    if (!this.profileRolesMap[this.connectionId][profileCode]) {
      this.profileRolesMap[this.connectionId][profileCode] = await this.getProfileRolesFromDataBase(profileCode)
    }
    
    return this.profileRolesMap[this.connectionId][profileCode]
  }

  // clientRoles = roles da requisição
  public async verifyProfileRoles (user: UserAuth): Promise<boolean> {
    let actualRoles = await this.getRolesByProfileCode(user.cdPerfilAcesso)

    if (Object.keys(actualRoles).length !== user.userRoles.length) {
      return false
    }

    const userRoles = {}
    for (const role in user.userRoles) {
      userRoles[role] = true
    }

    for (const role in UserRoles) {
      if (userRoles[role] !== actualRoles[role]) {
        return false
      }
    }

    return true
  }

  public async verifySpecificRoles (user: UserAuth, neededRoles: UserRoles[]): Promise<boolean> {
    let currentRoles = await this.getRolesByProfileCode(user.cdPerfilAcesso)
    const currentRolesArr = Object.keys(currentRoles)

    // const includedRoles = Object.keys(UserRoles).filter(role => {
    //   for (const currentRole of currentRolesArr) {
    //     if (currentRole.includes((role))) {
    //       return true
    //     }
    //   }
    //   return false
    // })

    for (const neededRole of neededRoles) {
      if (currentRoles[neededRole] !== true) {
        let included = false
        for (const currentRole of currentRolesArr) {
          if (currentRole.includes(neededRole)) {
            included = true
            break
          }
        }

        if (!included) {
          return false
        }
      }
    }

    return true
  }

  public async updateProfileRoles (input: UpdateRolesDTO) {
    const currentRoles = await this.getRolesByProfileCode(input.cdPerfilAcesso)

    // Inativa todas as roles
    for (const role in currentRoles) {
      delete currentRoles[role]
    }

    // Habilita as novas roles
    for (const role of input.roles) {
      currentRoles[role] = true
    }

    // Salva no banco de dados o novo perfil de acesso
    const perfilAcessoEntity = await this.unityOfWorkEntity.findOneOrFail(CadPerfilAcesso, input.cdPerfilAcesso)
    perfilAcessoEntity.roles = input.roles
    await this.unityOfWorkEntity.save(perfilAcessoEntity)
  }
}
