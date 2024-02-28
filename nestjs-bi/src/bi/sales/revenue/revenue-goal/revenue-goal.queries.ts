import {Inject, Injectable} from "@nestjs/common";
import {CadEquipeMetaMensalEntity} from "src/database/entity/tenant/cad_equipe_meta_mensal.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {CadVendedorMetaMensalEntity} from "src/database/entity/tenant/cad_vendedor_meta_mensal.entity";
import {Connection, EntityManager, QueryFailedError} from "typeorm";
import {RevenueGoal} from "./revenue-goal.types";
import {IRevenueGoalQueries, RevenueGoalQueryResult} from "./revenue-goal.types";

@Injectable()
export class RevenueGoalQueries implements IRevenueGoalQueries {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    private connection: Connection
  ) {
    this.manager = connection.manager
  }

  get tenant () {
    return `ten_${this.connection.name}`
  }

  async teamGoal (code: number, yearMonth: string): Promise<RevenueGoalQueryResult> {
    const [query, parameters ] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        ce.cd AS code,
        ce."nmEquipe" AS label,
        'team' AS type,
        COALESCE(cemm."vlMetaVenda", 0)::float AS revenue,
        COALESCE(cemm."pcMetaMarkup", 0)::float AS markup,
        COALESCE(cemm."pcLucro", 0)::float AS profit 
          FROM ${this.tenant}.cad_equipe ce
            LEFT JOIN ${this.tenant}.cad_equipe_meta_mensal cemm ON cemm."cdEquipe" = ce.cd AND cemm."idMesAno" = :yearMonth
        WHERE ce."cd" = :teamCode
      `,
      { teamCode: code, yearMonth },
      {}
    )
    const queryResult: RevenueGoalQueryResult[] = await this.connection.manager.query(query, parameters)
    return queryResult[0]
  }

  async sellerGoal (code: number, yearMonth: string): Promise<RevenueGoalQueryResult> {
    const [query, parameters ] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        cv.cd AS code,
        cv."nmVendedor" AS label,
        'seller' AS type,
        COALESCE(cvmm."vlMetaVenda", 0)::float AS revenue,
        COALESCE(cemm."pcMetaMarkup", 0)::float AS markup,
        COALESCE(cemm."pcLucro", 0)::float AS profit
          FROM ${this.tenant}.cad_vendedor cv
            LEFT JOIN ${this.tenant}.cad_vendedor_meta_mensal cvmm ON cvmm."cdVendedor" = cv.cd
            LEFT JOIN ${this.tenant}.cad_equipe_meta_mensal cemm ON cemm."cdEquipe" = cv."cdEquipe"
        WHERE cv.cd = :sellerCode AND cvmm."idMesAno" = :yearMonth AND cemm."idMesAno"= :yearMonth 
      `,
      { sellerCode: code, yearMonth },
      {}
    )
    const queryResult: RevenueGoalQueryResult[] = await this.connection.manager.query(query, parameters)
    return queryResult[0]
  }

  async resumeGoal (code: number, yearMonth: string): Promise<RevenueGoalQueryResult[]> {
    const [query, parameters ] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        cv.cd AS code,
        cv."nmVendedor" AS label,
        'seller' AS type,
        COALESCE(cvmm."vlMetaVenda", 0)::float AS revenue,
        COALESCE(cemm."pcMetaMarkup", 0)::float AS markup,
        COALESCE(cemm."pcLucro", 0)::float AS profit
          FROM ${this.tenant}.cad_vendedor cv
            LEFT JOIN ${this.tenant}.cad_vendedor_meta_mensal cvmm ON cvmm."cdVendedor" = cv.cd and cvmm."idMesAno" = :yearMonth
            LEFT JOIN ${this.tenant}.cad_equipe_meta_mensal cemm ON cemm."cdEquipe" = cv."cdEquipe" and cemm."idMesAno" = :yearMonth
        WHERE cv."cdEquipe" = :teamCode
        
      UNION

      SELECT
        ce.cd AS code,
        ce."nmEquipe" AS label,
        'team' AS type,
        COALESCE(cemm."vlMetaVenda", 0)::float AS revenue,
        COALESCE(cemm."pcMetaMarkup", 0)::float AS markup,
        COALESCE(cemm."pcLucro", 0)::float AS profit
        FROM ${this.tenant}.cad_equipe ce
          LEFT JOIN ${this.tenant}.cad_equipe_meta_mensal cemm ON cemm."cdEquipe" = ce.cd AND cemm."idMesAno" = :yearMonth
        WHERE ce."cdEquipePai" = :teamCode
      `,
      { teamCode: code, yearMonth },
      {}
    )
    return await this.connection.manager.query(query, parameters)
  }
}
