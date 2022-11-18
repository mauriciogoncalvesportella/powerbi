import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import {Connection, EntityManager, Equal, In} from "typeorm";
import {OrderRepository} from "../order.repository";
import {RAWRevenue, RAWRevenueMonthlySeller, RAWRevenueSellerTeam} from "./revenue.types";

@Injectable()
export class RevenueRepository extends OrderRepository {
  async fromSellersGroupByDate (sellers: number[], idMesAno: string[], fgSituacao: number): Promise<RAWRevenue[]> {
    /*
    return await this.groupByDate(
      sellers,
      idMesAno,
      fgSituacao,
      'SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)'
    )
    */
    let raw = await this.manager.createQueryBuilder<RAWRevenue>(VdPedidoEntity, 'pedido')
      .select('pedido.dtEntrega', 'date')
      .addSelect('SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)', 'value')
      .where({
        idMesAno: In(idMesAno),
        fgSituacao: Equal(fgSituacao),
        cdVendedor: In(sellers),
      })
      .groupBy('pedido.dtEntrega')
      .orderBy('pedido.dtEntrega')
      .getRawMany()

    this.normalizeValue(raw)
    this.normalizeDate(raw)
    return raw
  }

  async fromSellersGroupBySeller (sellers: number[], yearMonthArr: string[], fgSituacao: number, dates: string[] = null): Promise<RAWRevenueMonthlySeller[]> {
    let query = this.manager.createQueryBuilder(VdPedidoEntity, 'pedido')
      .leftJoinAndMapOne('pedido.cdVendedor', 'CadVendedorEntity', 'vendedor', 'pedido.cdVendedor = vendedor.cd')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('vendedor.nmVendedor', 'sellerName')
      .addSelect('SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)', 'value')
      .where({
        idMesAno: In(yearMonthArr),
        fgSituacao: Equal(fgSituacao),
        cdVendedor: In(sellers),
      })

    if (dates && dates[0] && dates[1]) {
      query = query.andWhere(`pedido.dtEntrega >= '${dates[0]}' AND pedido.dtEntrega <= '${dates[1]}'`)
    } else if (dates && dates[0]) {
      query = query.andWhere(`pedido.dtEntrega = '${dates[0]}'`)
    }

    const raw = await query.groupBy('vendedor.cd')
      .addGroupBy('vendedor.nmVendedor')
      .orderBy('value', 'DESC')
      .getRawMany()

    this.normalizeValue(raw)
    return raw
  }

  async fromSellersAndTeamGroupBySeller (teams: number[], sellers: number[], yearMonth: string[], fgSituacao: number, dates: string[] = null): Promise<RAWRevenueSellerTeam[]> {
    const equipeEntities = await this.manager.find(CadEquipeEntity, { where: { cd: In(teams) } })
    let query = this.manager.createQueryBuilder(VdPedidoEntity, 'pedido')
      .leftJoinAndMapOne('pedido.cdVendedor', 'CadVendedorEntity', 'vendedor', 'pedido.cdVendedor = vendedor.cd')
      .leftJoinAndMapOne('vendedor.cdEquipe', 'CadEquipeEntity', 'equipe', 'vendedor.cdEquipe = equipe.cd')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('equipe.cd', 'teamCode')
      .addSelect('equipe.idEquipe', 'teamId')
      .addSelect('vendedor.nmVendedor', 'sellerName')
      .addSelect('equipe.nmEquipe', 'teamName')
      .addSelect('equipe.cdEquipePai', 'parentTeam')
      .addSelect('SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)', 'value')
      .where({
        idMesAno: In(yearMonth),
        fgSituacao: Equal(fgSituacao),
        cdVendedor: In(sellers),
      })

    if (dates && dates[0] && dates[1]) {
      query = query.andWhere(`pedido.dtEntrega >= '${dates[0]}' AND pedido.dtEntrega <= '${dates[1]}'`)
    } else if (dates && dates[0]) {
      query = query.andWhere(`pedido.dtEntrega = '${dates[0]}'`)
    }

    const raw = await query.groupBy('vendedor.cd')
      .addGroupBy('equipe.cd')
      .addGroupBy('equipe.idEquipe')
      .addGroupBy('vendedor.nmVendedor')
      .addGroupBy('equipe.nmEquipe')
      .addGroupBy('equipe.cdEquipePai')
      .orderBy('value', 'DESC')
      .getRawMany()
    this.normalizeValue(raw)

    for (let i = 0; i < raw.length; i++) {
      raw[i].parentTeamsCd = []
      for (const team of equipeEntities) {
        if (raw[i].teamId.startsWith(team.idEquipe)) {
          raw[i].parentTeamsCd.push(team.cd)
        }
      }
    }

    return raw
  }
}
