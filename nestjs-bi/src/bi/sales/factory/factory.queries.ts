import {Inject} from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {Connection, EntityManager} from "typeorm";
import {IFactoryQueries, QueryResultResumeFactory} from "./factory.generator";

export class FactoryQueries implements IFactoryQueries {
  private manager: EntityManager
  public column: 'nmFabrica' | 'nmCategoria'
  
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
  ) {
    this.manager = connection.manager
  }

  get tenant () {
    return `ten_${this.connection.name}`
  }

  get table () {
    return this.column === 'nmFabrica' ? 'cf' : 'cc'
  }

  get productCodeColumn () {
    return this.column === 'nmFabrica' ? 'cdFabrica' : 'cdCategoria'
  }

  public async resumePerTeam (cd: number, yearMonth: string): Promise<QueryResultResumeFactory[]> {
    const teamEntity = await this.manager.findOneOrFail(CadEquipeEntity, cd)
    const id = `${teamEntity.idEquipe}%`
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        ${this.table}.cd as code,
        "${this.column}" as label,
        sum(vpp."vlTotal")::float as amount,
        count(*) as order_count
      FROM ${this.tenant}.vd_pedidos vp
        join ${this.tenant}.vd_pedido_produto vpp on vpp."cdPedido" = vp.cd
        join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
        join ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe" and ce."idEquipe" like :id
        ${
        this.column === 'nmCategoria'
          ? `join ${this.tenant}.cad_produto cp on cp."cd" = vpp."cdProduto"
             join ${this.tenant}.cad_categoria cc on cc."cd" = cp."cdCategoria"`

          : `join ${this.tenant}.cad_fabrica cf on cf.cd = vpp."cdFabrica"`
        }
      WHERE vp."idMesAno" = :yearMonth
        AND vp."fgSituacao" in (1,2,4,5)
      GROUP BY ${this.table}.cd, ${this.table}."${this.column}"
      HAVING SUM(vpp."vlTotal") > 0
      ORDER BY amount DESC
      `,
      { yearMonth, id },
      {}
    )
    return await this.manager.query(query, parameters)
  }

  public async resumePerSeller (cd: number, yearMonth: string): Promise<QueryResultResumeFactory[]> {
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        t.code,
        t.label,
        SUM(amount)::float as amount,
        COUNT(*) as order_count
        FROM (
          SELECT
            ${this.table}.cd as code,
            "${this.column}" as label,
            SUM(vpp."vlTotal") as amount
          FROM ${this.tenant}.vd_pedido_produto vpp
            join ${this.tenant}.vd_pedidos vp on vp.cd = vpp."cdPedido"
            join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
            ${
            this.column === 'nmCategoria'
              ? `join ${this.tenant}.cad_produto cp on cp."cd" = vpp."cdProduto"
                 join ${this.tenant}.cad_categoria cc on cc."cd" = cp."cdCategoria"`

              : `join ${this.tenant}.cad_fabrica cf on cf.cd = vpp."cdFabrica"`
            }
          WHERE vp."idMesAno" = :yearMonth
            AND (cv.cd = :cd or vp."cdVendedor2" = :cd)
            AND vp."fgSituacao" in (1,2,4,5)
          GROUP BY vpp."cdPedido", ${this.table}.cd, ${this.table}."${this.column}"
        ) t
      group by t.code, t.label
      order by amount desc
      `,
      { yearMonth, cd },
      {}
    )

    return await this.manager.query(query, parameters)
  }

  public async resumeProduct (cd: number, menuCode: number, yearMonth: string, type: 'seller' | 'team'): Promise<QueryResultResumeFactory[]> {
    const sellerCode = type === 'seller' ? cd : -1
    let teamId: string = 'impossible'
    if (type === 'team') {
      const teamEntity = await this.manager.findOneOrFail(CadEquipeEntity, cd)
      teamId = `%${teamEntity.idEquipe}%`
    }

    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        cp.cd AS code,
        cp."nmProduto" AS label,
        cp."idProduto" AS id,
        sum(vpp."vlTotal")::float AS amount,
        sum(vpp."qtProduto") AS quantity,
        count(*) as order_count
      FROM ${this.tenant}.vd_pedidos vp
        JOIN ${this.tenant}.vd_pedido_produto vpp ON vpp."cdPedido" = vp.cd
        JOIN ${this.tenant}.cad_produto cp ON cp.cd = vpp."cdProduto"
        JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
        JOIN ${this.tenant}.cad_equipe ce ON ce.cd = cv."cdEquipe"
      WHERE (ce."idEquipe" similar to :teamId OR cv.cd = :sellerCode OR vp."cdVendedor2" = :sellerCode)
        AND vp."idMesAno" = :yearMonth
        AND cp."${this.productCodeColumn}" = :menuCode
        AND vp."fgSituacao" in (1,2,4,5)
      GROUP BY cp.cd, cp."idProduto", cp."nmProduto"
      ORDER BY amount DESC
      `,
      { menuCode, teamId, sellerCode, yearMonth },
      {}
    )
    return await this.manager.query(query, parameters) 
  }

  public async resumeTeamByFactory (teamCode: number, menuCode: number, yearMonth: string) {
    const teamEntity = await this.manager.findOneOrFail(CadEquipeEntity, teamCode)
    const teamId = teamEntity.idEquipe
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT *
      FROM (
        SELECT
          ce.cd AS code,
          ce."nmEquipe" AS label,
          SUM(t."vlTotal") AS amount,
          COUNT(*) AS order_count,
          'team' AS type
          FROM
            (
            SELECT vpp.*, ce.*
              FROM ${this.tenant}.vd_pedidos vp
                JOIN ${this.tenant}.vd_pedido_produto vpp ON vpp."cdPedido" = vp.cd
                JOIN ${this.tenant}.cad_produto cp ON cp."cd" = vpp."cdProduto"
                JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
                JOIN ${this.tenant}.cad_equipe ce ON ce.cd = cv."cdEquipe"
            WHERE vp."idMesAno" = :yearMonth
              AND cp."${this.productCodeColumn}" = :menuCode 
              AND ce."idEquipe" like :teamId || '%'
              AND vp."fgSituacao" in (1,2,4,5)
            ) t
            JOIN ${this.tenant}.cad_equipe ce on ce."cdEquipePai" = :teamCode
          WHERE t."idEquipe" like ce."idEquipe" || '%'
          GROUP BY ce.cd, ce."idEquipe", ce."nmEquipe"
          
        UNION
        
        SELECT
          cv.cd AS code,
          cv."nmVendedor" AS label,
          SUM(vpp."vlTotal") AS amount,
          count(*) AS order_count,
          'seller' AS type
        FROM ${this.tenant}.vd_pedidos vp
          JOIN ${this.tenant}.vd_pedido_produto vpp ON vpp."cdPedido" = vp.cd
          JOIN ${this.tenant}.cad_produto cp ON cp."cd" = vpp."cdProduto"
          JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
        WHERE vp."idMesAno" = :yearMonth
          AND cp."${this.productCodeColumn}" = :menuCode
          AND cv."cdEquipe" = :teamCode
          AND vp."fgSituacao" in (1,2,4,5)
        GROUP BY cv.cd, cv."nmVendedor") result
      ORDER BY amount DESC
      `,
      { teamCode, teamId, menuCode, yearMonth },
      {}
    )

    return await this.manager.query(query, parameters)
  }
}
