import {ConflictException, Inject, Injectable} from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {UnitOfWorkEntity} from "src/database/unit-of-work/uow.provider";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection} from "typeorm";
import {UserAuth} from "../auth.interfaces";
import {UserStatusQueries} from "./user-status.queries";
import {UserStatus} from "./user-status.types";

@Injectable()
export class UserStatusService {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private unityOfWorkEntity: UnitOfWorkEntity,
    private userStatusQueries: UserStatusQueries,
    private metadata: RequestMetadata
  ) {}

  private status: Record<string, Record<number, UserStatus> >= {}

  get connectionId () {
    return this.connection.name
  }

  private async getStatusFromDataBase (code: number, useUow: boolean = false): Promise<UserStatus> {
    const manager = useUow
      ? this.unityOfWorkEntity
      : this.connection.manager
    const sellerEntity = await manager.findOneOrFail(
      CadVendedorEntity,
      undefined,
      { where: { cd: code } }
    )
    const teamEntity = await manager.findOneOrFail(
      CadEquipeEntity,
      undefined,
      { where: { cd: sellerEntity.cdEquipe } }
    )

    return {
      email: sellerEntity.idEmail,
      teamCode: sellerEntity.cdEquipe,
      teamId: teamEntity.idEquipe,
      sellerId: sellerEntity.idVendedor,
      active: sellerEntity.fgAtivo,
      passwordCreated: sellerEntity.idSenha != null,
      role: sellerEntity.fgFuncao
    }
  }

  public async getStatus (code: number): Promise<boolean> {
    if (!this.status[this.connectionId]) {
      this.status[this.connectionId] = {}
    }
    if (!this.status[this.connectionId][code]) {
      this.status[this.connectionId][code] = await this.getStatusFromDataBase(code)
    }
    return this.status[this.connectionId][code].active
  }

  public async updateStatus (code: number, useUow: boolean = false) {
    if (!this.status[this.connectionId]) {
      this.status[this.connectionId] = {}
    }
    this.status[this.connectionId][code] = await this.getStatusFromDataBase(code, useUow)
  }

  public async getAllUsers () {
    const teamCode = (this.metadata.user as UserAuth).cdEquipe
    const entities = await this.userStatusQueries.allUsers(teamCode)
    return entities.map(entity => ({
      code: entity.code,
      name: entity.name,
      loginId: entity.login_id,
      email: entity.email,
      active: entity.active,
      role: entity.role,
      teamId: entity.team_id,
      teamCode: entity.team_code,
      teamName: entity.team_name,
      passwordCreated: entity.password_created
    }))
  }

  public async activeOrDeactive (userCode: number, status: boolean) {
    const userEntity = await this.connection.manager.findOneOrFail(CadVendedorEntity, userCode)
    userEntity.fgAtivo = status
    await this.connection.manager.save(userEntity)
    await this.getStatus(userEntity.cd)
  }

  public async changeUserId (userCode: number, id: string) {
    const userEntity = await this.connection.manager.findOneOrFail(CadVendedorEntity, userCode)
    userEntity.idLogin = id
    await this.connection.manager.save(userEntity)
  }

  public async changePassword (userCode: number, password: string) {
    const userEntity = await this.connection.manager.findOneOrFail(CadVendedorEntity, userCode)
    userEntity.idSenha = await CadVendedorEntity.hashPassword(password)
    await this.connection.manager.save(userEntity)
  }
}
