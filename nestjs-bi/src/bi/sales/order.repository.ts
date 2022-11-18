import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {VdPedidoEntity} from "src/database/entity/tenant/vd_pedido.entity";
import {Connection, EntityManager, Equal, In, SelectQueryBuilder} from "typeorm";

export interface IOrderGroupByDate {
  value: number
  date: string 
}

export interface IOrderResumeTeam {
  // sellerCode: number,
  teamCode: number,
  teamId: string,
  // sellerName: string,
  teamName: string,
  value: number,
  parentTeam: number,
  parentTeamsCd: number[]
}

export interface IOrderResumeSeller {
  sellerCode: number,
  sellerName: string,
  value: number
}

export class OrderRepository {
  protected manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    connection: Connection
  ) {
    this.manager = connection.manager
  }

  protected normalizeValue (arr: any[], key: string = 'value') {
    for (let i = 0; i < arr.length; i++) {
      arr[i][key] = parseFloat(arr[i][key])
    }
  }

  protected normalizeDate (arr: any[], key: string = 'date') {
    for (let i = 0; i < arr.length; i++) {
      arr[i][key] = format(new Date(arr[i][key]), 'yyyy-MM-dd')
    }
  }

  async groupByDate (
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    valueSelect: string,
    dateQuery: 'dtEntrega' | 'dtEmissao' = 'dtEntrega'
  ): Promise<IOrderGroupByDate[]> {
    let queryBuilder: SelectQueryBuilder<IOrderGroupByDate> = this.manager.createQueryBuilder<IOrderGroupByDate>(VdPedidoEntity, 'pedido')
      .select(`pedido.${dateQuery}`, 'date')
      .addSelect(valueSelect, 'value')

    const entities: IOrderGroupByDate[] = await queryBuilder.where({
        idMesAno: In(yearMonth),
        fgSituacao: Equal(fgSituacao),
        cdVendedor: In(sellers)
      })
      .groupBy(`pedido.${dateQuery}`)
      .orderBy(`pedido.${dateQuery}`)
      .getRawMany()

    this.normalizeValue(entities)
    this.normalizeDate(entities)
    return entities
  }

  async groupBySellers (
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    selectValue: string,
    dates: string[] = null,
    dateQuery: 'dtEntrega' | 'dtEmissao' = 'dtEntrega'
  ): Promise<IOrderResumeSeller[]> {
    let query = this.manager.createQueryBuilder(VdPedidoEntity, 'pedido')
      .leftJoinAndMapOne('pedido.cdVendedor', 'CadVendedorEntity', 'vendedor', 'pedido.cdVendedor = vendedor.cd')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('vendedor.nmVendedor', 'sellerName')
      .addSelect(selectValue, 'value')
      .where({
        idMesAno: In(yearMonth),
        fgSituacao: Equal(fgSituacao),
        cdVendedor: In(sellers),
      })

      if (dates && dates[0] && dates[1]) {
        query = query.andWhere(`pedido.${dateQuery} >= '${dates[0]}' AND pedido.${dateQuery} <= '${dates[1]}'`)
    } else if (dates && dates[0]) {
      query = query.andWhere(`pedido.${dateQuery} = '${dates[0]}'`)
    }

    const orderResume = await query.groupBy('vendedor.cd')
      .addGroupBy('vendedor.nmVendedor')
      .orderBy('value', 'DESC')
      .getRawMany()

    this.normalizeValue(orderResume)
    return orderResume
  }

  async groupByTeams (
    teams: number[],
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    selectValue: string,
    averageStrategy: boolean = false,
    dates: string[] = null,
    dateQuery: 'dtEntrega' | 'dtEmissao' = 'dtEntrega'
  ): Promise<IOrderResumeTeam[]> {
    const equipeEntities = await this.manager.find(CadEquipeEntity, { where: { cd: In(teams) } })
    let queryBuilder = this.manager.createQueryBuilder(VdPedidoEntity, 'pedido')
      .leftJoinAndMapOne('pedido.cdVendedor', 'CadVendedorEntity', 'vendedor', 'pedido.cdVendedor = vendedor.cd')
      .leftJoinAndMapOne('vendedor.cdEquipe', 'CadEquipeEntity', 'equipe', 'vendedor.cdEquipe = equipe.cd')
      .select('equipe.cd', 'teamCode')
      .addSelect('equipe.idEquipe', 'teamId')
      .addSelect('equipe.nmEquipe', 'teamName')
      .addSelect('equipe.cdEquipePai', 'parentTeam')
      .addSelect(selectValue, 'value')
      .where({
        idMesAno: In(yearMonth),
        fgSituacao: Equal(fgSituacao),
        cdVendedor: In(sellers),
      })

    if (dates && dates[0] && dates[1]) {
      queryBuilder = queryBuilder.andWhere(`pedido.${dateQuery} >= '${dates[0]}' AND pedido.${dateQuery} <= '${dates[1]}'`)
    } else if (dates && dates[0]) {
      queryBuilder = queryBuilder.andWhere(`pedido.${dateQuery} = '${dates[0]}'`)
    }

    const orderResume: IOrderResumeTeam[] = await queryBuilder
      .groupBy('equipe.cd')
      .addGroupBy('equipe.idEquipe')
      .addGroupBy('equipe.nmEquipe')
      .addGroupBy('equipe.cdEquipePai')
      .orderBy('value', 'DESC')
      .getRawMany()

    for (let i = 0; i < orderResume.length; i++) {
      orderResume[i].parentTeamsCd = []
      for (const team of equipeEntities) {
        if (orderResume[i].teamId.startsWith(team.idEquipe)) {
          orderResume[i].parentTeamsCd.push(team.cd)
        }
      }
    }

    this.normalizeValue(orderResume)
    const accumulator: { [cd: number]: number } = {}
    const cont: { [cd: number]: number } = {}
    for (const item of orderResume) {
      item.parentTeamsCd.forEach(cd => {
        accumulator[cd] = (accumulator[cd] ?? 0) + item.value
        cont[cd] = (cont[cd] ?? 0) + 1
      })
    }

    return orderResume
      .filter(order => order.teamCode in accumulator)
      .map(order => ({
        ...order,
        value: accumulator[order.teamCode] / (averageStrategy ? cont[order.teamCode] : 1)
      }))
  }
}
