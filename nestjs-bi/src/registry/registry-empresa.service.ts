import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import { join } from 'path';
import {CommerceAuth} from 'src/auth/auth.interfaces';
import {DatabaseService} from 'src/database/database.service';
import {CadEmpresaPublicEntity} from 'src/database/entity/public/cad_empresa_public.entity';
import { UnitOfWorkEntity } from 'src/database/unit-of-work/uow.provider';
import {Connection, createConnection, EntityManager, Migration, Repository} from 'typeorm';
import {RegistryDTO} from './registry.dto';
import {RegistryTenantDatabaseError} from './registry.errors';

@Injectable()
export class RegistryEmpresaService {
  constructor(
    private uwoEntity: UnitOfWorkEntity,
    private jwtService: JwtService,
    private dbService: DatabaseService,
  ) {  }

  private async registrySchema (schema: string) {
    try {
      await this.uwoEntity.query(`CREATE SCHEMA ten_${schema}`)
    } catch (err: any) {
      throw new HttpException({
        message: `${schema} already exists`,
        error: 'Query Failed Error',
        status: HttpStatus.BAD_REQUEST,
      }, HttpStatus.BAD_REQUEST)
    }
  }

  private generateToken (entity: CadEmpresaPublicEntity, idEmpresa: string): string {
    const commerceAuth: CommerceAuth = {
      role: 'commerce',
      idEmpresa,
      cdEmpresaPublic: entity.cd,
      idCnpj: entity.idCnpj
    }
    return this.jwtService.sign(commerceAuth)
  }

  async createTenantDatabase (schema: string) {
    const publicConn = await this.dbService.getConnection('public')
    await publicConn.query(`CREATE SCHEMA IF NOT EXISTS ten_${schema}`)
    const connection = await this.dbService.getConnection(schema)
    await connection.runMigrations()
    await connection.close()
  }

  async registry (registryDTO: RegistryDTO) {
    let entity: CadEmpresaPublicEntity

    const idEmpresa: string = registryDTO.idFantasia
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/ /g, '_')
        .replace(/[^a-z_]/g, '')
        .replace(/_{1,}/g, '_')

    entity = this.uwoEntity.create(CadEmpresaPublicEntity, {
      ...registryDTO,
      idEmpresa,
    })

    entity = await this.uwoEntity.save(entity)
    entity.idToken = this.generateToken(entity, idEmpresa)
    await this.uwoEntity.save(entity)

    try {
      await this.createTenantDatabase(idEmpresa)
    } catch (err: any) {
      throw new RegistryTenantDatabaseError(err.message ?? err)
    }

    return {
      token: entity.idToken,
    }
  }
}
