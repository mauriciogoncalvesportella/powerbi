import {addDays, format, getDay, differenceInBusinessDays, lastDayOfMonth} from "date-fns"
import {formatToTimeZone} from "date-fns-timezone"
import {DateValueUtils} from "src/bi/sales/utils/date-value.utils"

export namespace DateUtils {
  export function yearMonthIterate (idMesAno: string, count: number) {
    const idMesAnoArr: string[] = [idMesAno]
    let [year, month] = idMesAno.split('-').map(it => parseInt(it))
    for (let i = 0; i < count; i++) {
      --month
      if (month === 0) {
        month = 12
        --year
      }
      idMesAnoArr.push(`${year}-${month < 10 ? `0${month}` : month}`)
    }
    return idMesAnoArr
  }

  export function initEndFormat (init: number, end: number): string[] {
    if (init && end) {
      const initFormat = formatToTimeZone(init, 'YYYY-MM-DD HH:mm', { timeZone: 'America/Sao_Paulo' })
      const endFormat = formatToTimeZone(end, 'YYYY-MM-DD HH:mm', { timeZone: 'America/Sao_Paulo' })
      return [initFormat, endFormat]
    }
    return null
  }

  export function getDates (yearMonth: string, closingDate: number, dates?: string[]): string[] {
    return dates ?? DateValueUtils.yearMonthBound(yearMonth, closingDate).map(date => format(date, 'yyyy-MM-dd'))
  }

  export function daysByMonth (init: Date, end: Date): {
    months: string[],
    daysByMonth: Record<string, { days: number, total: number }>
  } {
    let iteratorDate = new Date(init)
    const daysByMonth: Record<string, { days: number, total: number }> = {}
    const months: Set<string> = new Set()
    for (; iteratorDate <= new Date(end); iteratorDate = addDays(iteratorDate, 1)) {
      const yearMonth = format(iteratorDate, 'yyyy-MM')
      months.add(yearMonth)
      daysByMonth[yearMonth] = daysByMonth[yearMonth] ?? { days: 0, total: 0 }
      daysByMonth[yearMonth].days = daysByMonth[yearMonth].days ?? 0
      if (![0, 6].includes(getDay(iteratorDate))) {
        daysByMonth[yearMonth].days++
      }
      if (!daysByMonth[yearMonth].total) {
        daysByMonth[yearMonth].total = -differenceInBusinessDays(
          addDays(new Date(`${yearMonth}-01T00:00:00`), -1),
          lastDayOfMonth(new Date(`${yearMonth}-01T00:00:00`))
        )
      }
    }
    return {
      months: Array.from(months),
      daysByMonth
    }
  }
}
