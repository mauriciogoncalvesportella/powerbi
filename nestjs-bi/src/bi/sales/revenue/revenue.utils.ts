import {isInstance} from "class-validator";
import {addDays, addMonths, format, getDate, getDay, getDaysInMonth, lastDayOfMonth, set, setDate} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {DateValueUtils} from "../utils/date-value.utils";
import {RAWRevenue, RAWRevenueSellerTeam} from "./revenue.types";

export namespace RevenueUtils {
  export function adjustYearMonth (_date: Date | string | number, closingDate?: number) {
    let date: Date

    if (!isInstance(_date, Date)) {
      date = new Date(_date)
    } else {
      date = _date as Date
    }

    if (closingDate && getDate(date) > closingDate) {
      date = addMonths(date, 1)
    }

    return format(date, 'yyyy-MM')
  }

  export function calculateCommercialDays (data: RAWRevenue[]) {
    return data.reduce((prev, curr, index) => {
      if (data[index].value > 0) {
        return ++prev
      }
      return prev + ([0, 6].includes(getDay(new Date(curr.date))) ? 0 : 1)
    }, 0)
  } 

  export function aggregateYearMonthRAWRevenue (idMesAnoArr: string[], data: RAWRevenue[], closingDate?: number) {
    const revenueArr: RAWRevenue[][] = []
    const revenueMap: Record<string, RAWRevenue[]> = {}

    for (const idMesAno of idMesAnoArr) {
      revenueArr.push([])
      revenueMap[idMesAno] = revenueArr[revenueArr.length - 1]
    }

    for (const revenue of data) {
      const yearMonth = adjustYearMonth(revenue.date, closingDate)
      if (revenueMap[yearMonth] != null) {
        revenueMap[yearMonth].push(revenue)
      }
    }

    for (const [index, value] of revenueArr.entries()) {
      revenueArr[index] = arrangeDatesRAWRevenue(value, idMesAnoArr[index], closingDate)
    }

    return revenueArr
  }

  export function arrangeDatesRAWRevenue (data: RAWRevenue[], yearMonth: string, closingDate?: number) {
    if (data[0] != null) {
      const result: RAWRevenue[] = []
      const yearMonthMap: Map<string, RAWRevenue> = new Map()

      let [iteratorDate, endDate] = DateValueUtils.yearMonthBound(yearMonth, closingDate)

      for (; iteratorDate <= endDate; iteratorDate = addDays(iteratorDate, 1)) {
        const formatDate = format(iteratorDate, 'yyyy-MM-dd')
        const obj: RAWRevenue = {
          date: formatDate,
          value: 0
        }
        yearMonthMap.set(formatDate, obj)
        result.push(obj)
      }

      for (const item of data) {
        let obj = yearMonthMap.get(format(new Date(item.date), 'yyyy-MM-dd'))
        if (obj) {
          obj.date = item.date
          obj.value = item.value
        }
      }

      return result
    }
    return data
  }

  export function calculateDailyGoal (raw: RAWRevenue[], monthlyGoal: number) {
    const totalCommercialDays: number = calculateCommercialDays(raw)
    return monthlyGoal/totalCommercialDays
  }

  export function calculateGoalAccumulate (raw: RAWRevenue[], monthlyGoal: number) {
    const dailyGoal = calculateDailyGoal(raw, monthlyGoal)
    const goalValues = []

    for (let i = 0, totalGoal = 0; i < raw.length; i++) {
      const dayOfWeek = getDay(new Date(raw[i].date))
      if (raw[i].value > 0 || !(dayOfWeek === 6 || dayOfWeek === 0)) {
        totalGoal += dailyGoal
        goalValues.push(totalGoal)
      } else {
        goalValues.push(totalGoal)
      }
    }

    return goalValues
  }

  export function calculateGoal (raw: RAWRevenue[], dailyGoal: number) {
    const goalValues = []
    for (let i = 0; i < raw.length; i++) {
      goalValues.push(dailyGoal)
      /*
      const dayOfWeek = getDay(new Date(raw[i].date))
      if (raw[i].value > 0 || !(dayOfWeek === 6 || dayOfWeek === 0)) {
        goalValues.push(dailyGoal)
      } else {
        goalValues.push(0)
      }
      */
    }

    return goalValues
  }

  export function calculateAccumulatedRevenue (raw: RAWRevenue[]) {
    for (let i = 0, total = 0; i < raw.length; i++) {
      const value = raw[i].value
      raw[i].value += total
      total += value
    }

    return raw
  }

  export function assignRevenueToParentTeam (parentTeams: CadEquipeEntity[], raw: RAWRevenueSellerTeam[]) {
    for (let i = 0; i < raw.length; i++) {
      raw[i].parentTeamsCd = []
      for (const team of parentTeams) {
        if (raw[i].teamId.startsWith(team.idEquipe)) {
          raw[i].parentTeamsCd.push(team.cd)
        }
      }
    }
  }

  export function accumulatedTeams (teams: CadEquipeEntity[], raw: RAWRevenueSellerTeam[]) {
    const accumulator: { [id: string]: number } = {}
    for (const item of raw) {
      item.parentTeamsCd.forEach(cd => {
        accumulator[cd] = accumulator[cd] ?? 0
        accumulator[cd] += item.value
      })
    }
    return accumulator
  }
}
