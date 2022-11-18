import { Inject, Injectable } from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager} from "typeorm";
import { ILinearityQueries, QueryResultPerCustomer } from './linearity.generator'

@Injectable()
export class LinearityQueries implements ILinearityQueries {
  private manager: EntityManager
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private requestMetadata: RequestMetadata
  ) { 
    this.manager = connection.manager
  }

  get tenant () {
    return `ten_${this.connection.name}`
  }

  private async getSellerOrTeam (cd: number, type: 'seller' | 'team') {
    const sellerCode = type === 'seller' ? cd : -1
    const teamId = type === 'team'
      ? (await this.manager.findOneOrFail(CadEquipeEntity, cd)).idEquipe
      : 'impossible'

    return {
      sellerCode,
      teamId
    }
  }

  async monthPerCustomer (cd: number, type: 'seller' | 'team', yearMonthInterval: string[]): Promise<QueryResultPerCustomer[]> {
    const [yearMonth0, yearMonth1] = yearMonthInterval
    const { sellerCode, teamId } = await this.getSellerOrTeam(cd, type)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        "cdCliente" as customer_code,
        "idMesAno" as year_month,
        cc."dtCriacao" as create_date,
        COALESCE(NULLIF(cv."idLogin", ''), cv."idVendedor", cv."cd"::VARCHAR) as seller_name,
        (${this.tenant}.extract_year_month(cc."dtCriacao") between :yearMonth0 and :yearMonth1) as new_customer,
        "idFantasia" as customer_name,
        sum("vlCusto")::float AS cost_value,
        sum("vlLucro")::float AS profit_value,
        cc."fgStatus" AS status,
        COALESCE(sum(case when ("fgSituacao" = 1) then "vlProdutos" else 0 end), 0)::float as not_billed,
        COALESCE(sum(case when ("fgSituacao" IN (2,4,5)) then "vlProdutos" else 0 end), 0)::float as billed
          FROM ${this.tenant}.vd_pedidos vp
            JOIN ${this.tenant}.cad_cliente cc on cc.cd = vp."cdCliente"
            --JOIN ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
            JOIN ${this.tenant}.cad_vendedor cv on cc."cdVendedor" = cv.cd
            JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe" and (ce."idEquipe" similar to :teamId or cv."cd" = :sellerCode)
      WHERE vp."fgSituacao" in (1,2,4,5) and "idMesAno" between :yearMonth0 and :yearMonth1
      GROUP BY "idMesAno", cc."dtCriacao", "cdCliente", "idFantasia", "fgStatus", cv."idVendedor", cv."cd"
      ORDER BY "cdCliente"
      `,
      { yearMonth0, yearMonth1, sellerCode, teamId: `${teamId}%` },
      {}
    )
    return await this.manager.query(query, parameters)
  }
}
