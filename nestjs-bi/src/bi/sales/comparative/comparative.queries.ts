import { Inject, Injectable, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { ComparativeRepository, QueryResultOrdersByMonth, QueryResultOrdersByMonthExpanded, QueryResultOrdersByMonthExpandedProducts } from "./comparative.interfaces";
import { Connection } from "typeorm";
import { TeamUtilsService } from "../team-utils/team-utils.service";

@Injectable()
export class ComparativeQueries implements ComparativeRepository {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private teamUtilsService: TeamUtilsService,
  ) { }

  get tenant () {
    return `ten_${this.connection.name}`
  }

  public async ordersByMonthExpandedProducts(code: number, type: 'seller' | 'team', yearMonths: string[], productCode: number | null = null): Promise<QueryResultOrdersByMonthExpandedProducts[]> {
    const teamOrSeller = await this.teamUtilsService.getSellerCodeOrTeamId(code, type)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        SELECT
          vpp."cdProduto" as product_code,
          cp."nmProduto" as product_label,
          vp."idMesAno" as year_month,
          (SUBSTRING(vp."idMesAno" from 6)::int - 1) as month,
          COALESCE(sum(vp."vlCusto"), 0)::float as cost_value,
          COALESCE(sum(vp."vlLucro"), 0)::float as profit_value,
          COALESCE(sum(vp."vlProdutos" - vp."vlDesconto"), 0)::float as revenue,
          COALESCE(sum(vpp."qtProduto"), 0)::int as products_count
        FROM ${this.tenant}.vd_pedidos VP
          JOIN ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
          JOIN ${this.tenant}.vd_pedido_produto vpp on vpp."cdPedido" = vp.cd
          JOIN ${this.tenant}.cad_produto cp on cp.cd = vpp."cdProduto"
        WHERE cp."fgFavorito" = TRUE
          AND (cast(:productCode as int) is NULL OR cp."cd" = :productCode)
          AND vp."fgSituacao" in (1,2,4,5)
          AND vp."idMesAno" in (:...yearMonths)
          AND (ce."idEquipe" like :teamId||'%' or cv.cd = :sellerCode)
        GROUP BY vp."idMesAno", vpp."cdProduto", cp."nmProduto"
      `,
      { yearMonths, teamId: teamOrSeller.teamId, sellerCode: teamOrSeller.sellerCode, productCode },
      {}
    )

    return await this.connection.manager.query(query, parameters)
  }

  public async ordersByMonthExpanded (code: number, type: 'seller' | 'team', yearMonths: string[], productCode: number | null = null): Promise<QueryResultOrdersByMonthExpanded[]> {
    const teamOrSeller = await this.teamUtilsService.getSellerCodeOrTeamId(code, type)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        SELECT
          ce."cd" as team_code,
          ce."idEquipe" as team_id,
          cv.cd as seller_code,
          vp."idMesAno" as year_month,
          (SUBSTRING(vp."idMesAno" from 6)::int - 1) as month,
          COALESCE(SUM("vlCusto"), 0)::float as cost_value,
          COALESCE(SUM("vlLucro"), 0)::float as profit_value,
          COALESCE(SUM("vlProdutos" - vp."vlDesconto"), 0)::float as revenue,
          SUM(products_count)::int as products_count
        FROM ${this.tenant}.vd_pedidos vp
          JOIN ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
          LEFT JOIN (
            SELECT vpp."cdPedido", SUM(vpp."qtProduto") AS products_count
            FROM ${this.tenant}.vd_pedido_produto vpp
              JOIN ${this.tenant}.cad_produto cp on cp.cd = vpp."cdProduto"
            where cp."fgFavorito" = TRUE and (cast(:productCode as int) is NULL OR cp."cd" = :productCode)
            GROUP BY vpp."cdPedido"
          ) as quantity_table on quantity_table."cdPedido" = vp.cd
        WHERE vp."fgSituacao" in (1,2,4,5)
          AND vp."idMesAno" in (:...yearMonths)
          AND (ce."idEquipe" like :teamId||'%' or cv.cd = :sellerCode)
        GROUP BY ce."cd", ce."idEquipe", cv."cd", vp."idMesAno"
      `,
      { yearMonths, teamId: teamOrSeller.teamId, sellerCode: teamOrSeller.sellerCode, productCode },
      {}
    )

    return await this.connection.manager.query(query, parameters)
  }

  async ordersByMonth (code: number, type: "seller" | "team", yearMonths: string[], productCode?: number): Promise<QueryResultOrdersByMonth[]> {
    const teamOrSeller = await this.teamUtilsService.getSellerCodeOrTeamId(code, type)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        select
          vp."idMesAno" as year_month,
          (SUBSTRING(vp."idMesAno" from 6)::int - 1) as month,
          COALESCE(sum("vlCusto"), 0::float) as cost_value,
          COALESCE(sum("vlLucro"), 0::float) as profit_value,
          COALESCE(sum("vlProdutos" - vp."vlDesconto"), 0)::float as revenue,
          COALESCE(sum(products_count), 0)::int AS products_count
        from ${this.tenant}.vd_pedidos vp
          join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          join ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
          left join (
            SELECT vpp."cdPedido", sum(vpp."qtProduto") AS products_count
            FROM ${this.tenant}.vd_pedido_produto vpp
              JOIN ${this.tenant}.cad_produto cp on cp.cd = vpp."cdProduto"
            where cp."fgFavorito" = TRUE and (cast(:productCode as int) is NULL OR cp."cd" = :productCode)
            GROUP BY vpp."cdPedido"
          ) as quantity_table on quantity_table."cdPedido" = vp.cd
        where vp."fgSituacao" in (1,2,4,5) and vp."idMesAno" in (:...yearMonths) and (ce."idEquipe" like :teamId||'%' or cv.cd = :sellerCode)
        group by ce."cd", ce."idEquipe", cv."cd", vp."idMesAno"
      `,
      { yearMonths, teamId: teamOrSeller.teamId, sellerCode: teamOrSeller.sellerCode, productCode },
      {}
    )

    return await this.connection.manager.query(query, parameters)
  }
}
