import { getMonth, getYear } from "date-fns"
import { PeriodStructure, Period, GetYearMonthsReturn } from "./types"

const monthLabels: Record<0|1|2|3|4|5|6|7|8|9|10|11, string> = {
  0: 'jan',
  1: 'fev',
  2: 'mar',
  3: 'abr',
  4: 'mai',
  5: 'jun',
  6: 'jul',
  7: 'ago',
  8: 'set',
  9: 'out',
  10: 'nov',
  11: 'dez'
}

const periodsLabelsMap = {
  monthly: {
    0: 'jan',
    1: 'fev',
    2: 'mar',
    3: 'abr',
    4: 'mai',
    5: 'jun',
    6: 'jul',
    7: 'ago',
    8: 'set',
    9: 'out',
    10: 'nov',
    11: 'dez'
  },
  semester: {
    0: 'jan-jun',
    1: 'jul-dez'
  },
  quartely: {
    0: 'jan-mar',
    1: 'abr-jun',
    2: 'jul-set',
    3: 'out-dez'
  },
  anualy: {
    0: 'ano'
  }
}

export class GetYearMonths {
  public constructor (
    private frequency: 'semester' | 'quartely' | 'anualy' | 'monthly'
  ) { }

  private getPeriodFromDate (date: Date): Period {
    const year = getYear(date)
    const month = getMonth(date)
    const period = PeriodStructure.groups[this.frequency][month]
    return new Period(year, period)
  }

  private getYearMonthsFromPeriod (period: Period): string[] {
    const yearMonths: string[] = []
    const months = PeriodStructure.monthsByPeriod[this.frequency][period.period]
    for (const month of months) {
      const formatedMonth = (month + 1).toString().padStart(2, '0')
      yearMonths.push(`${period.year}-${formatedMonth}`)
    }
    return yearMonths
  }
  
  private getMonthsFromPeriod (period: Period): number[] {
    return PeriodStructure.monthsByPeriod[this.frequency][period.period]
  }

  public previous (iterations: number, currentYearMonth: string, byPeriods: boolean = false): GetYearMonthsReturn {
    const ret: GetYearMonthsReturn = { periods: {}, monthLabels, yearMonths: [], periodFromYearMonth: {}, periodsArr: [], periodsLabelsMap, periodsMonths: {} }
    const currentPeriod = this.getPeriodFromDate(new Date(`${currentYearMonth}-01`))
    
    for (let i = 0; i < iterations; i++) {
      ret.periodsArr.push(new Period(currentPeriod.year, currentPeriod.period))
      if (byPeriods) {
        currentPeriod.year--
      } else {
        currentPeriod.period--
        if (currentPeriod.period == -1) {
          currentPeriod.period = PeriodStructure.groupSize[this.frequency]
          currentPeriod.year--
        }
      }
    }

    for (let period of ret.periodsArr) {
      const currentMonths = this.getMonthsFromPeriod(period)
      const currentYearMonths = this.getYearMonthsFromPeriod(period)
      ret.periods[period.key] = currentYearMonths
      ret.periodsMonths[period.key] = currentMonths
      ret.yearMonths.push(...currentYearMonths)

      for (const yearMonth of currentYearMonths) {
        ret.periodFromYearMonth[yearMonth] = period
      }
    }

    return ret
  }
}