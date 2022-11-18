import { format, lastDayOfMonth, parseISO, differenceInBusinessDays, addDays, addMonths, differenceInDays, set, getDate } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

export namespace DateUtils {
  export const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

  export function toDate (date: string | number | Date) {
    if (date instanceof Date) {
      return date
    }
    return new Date(date)
  }

  export function dateToLocalDate (...dates: string[]): number | number[] {
    const ret: number[] = dates.map(date => (new Date(zonedTimeToUtc(date, localTZ))).getTime())
    if (ret.length === 1) {
      return ret[0]
    }
    return ret
  }

  export function datesToLocalDate (dates: string[]): number[] {
    return dates.map(date => (new Date(zonedTimeToUtc(date, localTZ))).getTime())
  }

  export function dateLimits2 (idMesAno: string, initDay?: number, endDay?: number) {
    let ret: { init: string, end: string }
    if (initDay && endDay) {
      ret = dateLimits1(idMesAno, initDay, endDay)
    } else {
      ret = dateLimits(idMesAno)
    }
    return ret
  }

  export function dateLimits1 (idMesAno: string, init: number, end: number) {
    const initDay = (init < 10) ? `0${init}` : init
    const endDay = (end < 10) ? `0${end}` : end
    return {
      init: `${idMesAno}-${initDay}`,
      end: `${idMesAno}-${endDay}`
    }
  }

  export function dateLimits (idMesAno: string) {
    const date = dateToLocalDate(`${idMesAno}-01`) as number
    const lastDay = format(lastDayOfMonth(date), 'dd')
    return {
      init: `${idMesAno}-01`,
      end: `${idMesAno}-${lastDay}`
    }
  }

  export function date2DayAndWeekday (value: string | number | Date) {
    if (value != null) {
      let date: Date
      if (typeof value === 'string') {
        date = parseISO(value)
      } else {
        date = new Date(value)
      }

      const weekDay = date.toLocaleString('pt-BR', { weekday: 'long' })
      return `${format(date, 'dd')} - ${weekDay}`
    }
    return 'Error'
  }

  export function date2format (param: Date | string | number, pattern: string) {
    let date: number | Date
    if (typeof param === 'string') {
      date = new Date(param)
    } else {
      date = param
    }

    return format(date, pattern, { locale: ptBR })
  }

  export function dateLabels (init: number | undefined, end: number | undefined, yearMonth?: string) {
    if (init && end) {
      if (init === end) {
        return format(init, 'dd/MM/yyyy')
      }
      const initFormat = format(init, 'dd/MM/yyyy')
      const endFormat = format(end, 'dd/MM/yyyy')
      return `de ${initFormat} até ${endFormat}`
    }
    return format(new Date(`${yearMonth}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  export function initEndDateFromYearMonth (yearMonth: string, closeDay: number = 0) {
    let init, end
    if (closeDay) {
      end = new Date(`${yearMonth}-${closeDay} 00:00`)
      init = addDays(addMonths(end, -1), 1)
    } else {
      init = new Date(`${yearMonth}-01 00:00`)
      end = lastDayOfMonth(init)
    }
    return [init, end]
  }

  export function currentDateInInterval (init?: number | string | Date, end?: number | string | Date, yearMonth?: string, closeDay: number = 0): boolean {
    if (yearMonth) {
      ([init, end] = initEndDateFromYearMonth(yearMonth, closeDay))
    }

    init = toDate(init as Date)
    end = set(toDate(end as Date), { hours: 23, minutes: 59, seconds: 59 })
    const today = new Date()
    return today >= init && today <= end
  }

  export function totalDaysInYearMonth (yearMonth: string, closeDay?: number, businessDays: boolean = false) {
    const [init, end] = initEndDateFromYearMonth(yearMonth, closeDay)
    return businessDays
      ? differenceInBusinessDays(addDays(end, 1), init)
      : differenceInDays(addDays(end, 1), init)
  }

  export function totalDaysInDate (date: number | string | Date, closeDay?: number, businessDays: boolean = false) {
    date = toDate(date)
    const yearMonth = format(date, 'yyyy-MM')
    return totalDaysInYearMonth(yearMonth, closeDay, businessDays)
  }

  export function getYearMonth (date: number | string | Date, closeDay?: number) {
    date = toDate(date)
    if (closeDay && getDate(date) > closeDay) {
      date = addMonths(date, 1)
    }
    return format(date, 'yyyy-MM')
  }

  export function monthRatio (init?: number | string | Date, end?: number | string | Date, yearMonth?: string, closeDay: number = 0): number {
    if (init && end) {
      yearMonth = getYearMonth(toDate(init), closeDay)
    } else {
      ([init, end] = initEndDateFromYearMonth(yearMonth as string, closeDay))
      const today = new Date()
      if (today >= init && today <= end) {
        end = new Date()
      }
    }

    init = toDate(init)
    end = set(toDate(end), { hours: 23, minutes: 59, seconds: 59 })

    const difference = Math.max(1, differenceInBusinessDays(addDays(end, 1), init))
    return difference / totalDaysInYearMonth(yearMonth as string, closeDay, true)
  }
}
