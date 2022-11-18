import {Inject, Injectable} from "@nestjs/common";
import {CadEquipeMetaMensalEntity} from "src/database/entity/tenant/cad_equipe_meta_mensal.entity";
import {CadVendedorMetaMensalEntity} from "src/database/entity/tenant/cad_vendedor_meta_mensal.entity";
import {DateUtils} from "src/utils/date.utils";
import {Connection, In} from "typeorm";

export type ResumeGoalFromInterval<T> = Record<number, Record<string, {
  days: number,
  total: number,
  entity: T
}>> 

@Injectable()
export class GoalService {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection
  ) {}


  async byTeamsFromInterval (teams: number[], dates: Date[]): Promise<ResumeGoalFromInterval<CadEquipeMetaMensalEntity>> {
    const { months, daysByMonth } = DateUtils.daysByMonth(dates[0], dates[1])
    let result: ResumeGoalFromInterval<CadEquipeMetaMensalEntity> = {}

    const metaEntities = await this.connection.manager.find(CadEquipeMetaMensalEntity, {
      where: {
        idMesAno: In(months),
        cdEquipe: In(teams)
      }
    })

    for (let i = 0; i < teams.length; i++) {
      result[teams[i]] = {}
      months.forEach(month => result[teams[i]][month] = { days: 0, total: 0, entity: null })
    }

    for (let i = 0; i < metaEntities.length; i++) {
      const cd = metaEntities[i].cdEquipe
      const yearMonth = metaEntities[i].idMesAno
      const { days, total } = daysByMonth[yearMonth]
      result[cd][yearMonth] = {
        days,
        total,
        entity: metaEntities[i]
      }
    }
    return result
  }

  async bySellersFromInterval (sellers: number[], dates: Date[]): Promise<ResumeGoalFromInterval<CadVendedorMetaMensalEntity>> {
    const { months, daysByMonth } = DateUtils.daysByMonth(dates[0], dates[1])
    let result: ResumeGoalFromInterval<CadVendedorMetaMensalEntity> = {}
    const goalEntities = await this.connection.manager.find(CadVendedorMetaMensalEntity, {
      where: {
        idMesAno: In(months),
        cdVendedor: In(sellers)
      }
    })

    for (let i = 0; i < sellers.length; i++) {
      result[sellers[i]] = {}
      months.forEach(month => result[sellers[i]][month] = { days: 0, total: 0, entity: null })
    }

    for (let i = 0; i < goalEntities.length; i++) {
      const cd = goalEntities[i].cdVendedor
      const yearMonth = goalEntities[i].idMesAno
      const { days, total } = daysByMonth[yearMonth]
      result[cd][yearMonth] = {
        days,
        total,
        entity: goalEntities[i]
      }
    }

    return result
  }
}
