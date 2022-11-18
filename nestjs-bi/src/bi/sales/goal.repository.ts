import { Inject, Injectable } from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager, QueryBuilder} from "typeorm";

export interface GoalTeams {
  teamCode: number,
  teamId: string,
  teamName: string,
  goal: number,
  bonus: number,
  bonusPerc: number,
  bonusQt: number
}

export interface GoalSellers extends GoalTeams {
  sellerCode: number,
  sellerName: string,
}

@Injectable()
export class GoalRepository {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    connection: Connection,
    private requestMetadata: RequestMetadata
  ) {
    this.manager = connection.manager
  }

  static goalTeam2map (data: GoalTeams[]): Map<number, GoalTeams> {
    const map = new Map<number, GoalTeams>()

    for (const item of data) {
      map.set(item.teamCode, item)
    }

    return map
  }

  static goalSeller2map (data: GoalSellers[]): Map<number, GoalSellers> {
    const map = new Map<number, GoalSellers>()

    for (const item of data) {
      map.set(item.sellerCode, item)
    }

    return map
  }

  private generateQueryBuilderSeller (yearMonth: string, cds: number[]) {
    return this.manager.createQueryBuilder(CadVendedorEntity, 'vendedor')
      .leftJoinAndMapOne('vendedor.equipe', 'CadEquipeEntity', 'equipe', 'vendedor.cdEquipe = equipe.cd')
      .leftJoinAndMapOne('equipe.meta', 'CadEquipeMetaMensalEntity', 'meta', `meta.cdEquipe = equipe.cd AND meta.idMesAno = '${yearMonth}'`)
      .select('vendedor.cd', 'sellerCode')
      .addSelect('equipe.cd', 'teamCode')
      .addSelect('vendedor.jsMetaMensal', 'sellerGoal')
      .addSelect('vendedor.nmVendedor', 'sellerName')
      .addSelect('equipe.idEquipe', 'teamId')
      .addSelect('equipe.nmEquipe', 'teamName')
  }

  private generateQueryBuilderTeam (yearMonth: string, cds: number[]) {
    return this.manager.createQueryBuilder(CadEquipeEntity, 'equipe')
      .leftJoinAndMapOne('equipe.meta', 'CadEquipeMetaMensalEntity', 'meta', `meta.cdEquipe = equipe.cd AND meta.idMesAno = '${yearMonth}'`)
      .select('equipe.cd', 'teamCode')
      .addSelect('equipe.idEquipe', 'teamId')
      .addSelect('equipe.nmEquipe', 'teamName')
  }

  public async generateMarkup (type: 'seller' | 'team', cds: number[], yearMonth: string): Promise<GoalTeams[] | GoalSellers[]> {
    let queryBuilder: any
    
    if (type === 'seller') {
      queryBuilder = this.generateQueryBuilderSeller(yearMonth, cds)
    } else {
      queryBuilder = this.generateQueryBuilderTeam(yearMonth, cds)
    }
    
    return await queryBuilder
      .addSelect('meta.pcBonusMarkup', 'bonusPerc')
      .addSelect('meta.vlBonusMarkup', 'bonus')
      .addSelect('meta.qtBonusMarkup', 'bonusQt')
      .addSelect('meta.pcMetaMarkup', 'goal')
      .getRawMany()
  }

  public async generateProfit (type: 'seller' | 'team', cds: number[], yearMonth: string): Promise<GoalTeams[] | GoalSellers[]> {
    let queryBuilder: any
    
    if (type === 'seller') {
      queryBuilder = this.generateQueryBuilderSeller(yearMonth, cds)
    } else {
      queryBuilder = this.generateQueryBuilderTeam(yearMonth, cds)
    }
    
    return await queryBuilder
      .addSelect('meta.pcBonusMarkup', 'bonusPerc')
      .addSelect('meta.vlBonusMarkup', 'bonus')
      .addSelect('meta.qtBonusMarkup', 'bonusQt')
      .addSelect('meta.pcLucro', 'goal')
      .getRawMany()
  }

  public async generateRevenue (type: 'seller' | 'team', cds: number[], yearMonth: string): Promise<GoalTeams[] | GoalSellers[]> {
    let queryBuilder: any
    
    if (type === 'seller') {
      queryBuilder = this.generateQueryBuilderSeller(yearMonth, cds)
    } else {
      queryBuilder = this.generateQueryBuilderTeam(yearMonth, cds)
    }
    
    const raw = await queryBuilder
      .addSelect('meta.pcBonusMetaVenda', 'bonusPerc')
      .addSelect('meta.vlBonusMetaVenda', 'bonus')
      // .addSelect('meta.qtBonusMarkup', 'bonusQt')
      .addSelect('meta.vlMetaVenda', 'goal')
      .getRawMany()

    if (type === 'seller') {
      return raw.map(row => ({
        ...row,
        goal: row.sellerGoal[yearMonth] ?? 0
      }))
    }

    return raw
  }
}
