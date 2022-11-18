import {addDays, addMonths, getDate, getDay, lastDayOfMonth, set, format} from "date-fns"
import {IBaseDateValue} from "../sales.types"

export namespace DateValueUtils {
  export function yearMonthBound (yearMonth: string, closingDate?: number) {
    const base = new Date(`${yearMonth}-01`)
    if (closingDate) {
      return [
        addMonths(addDays(set(base, { date: closingDate }), 1), -1),
        set(base, { date: closingDate, hours: 23, minutes: 59, seconds: 59, milliseconds: 59 })
      ]
    } else {
      return [
        set(base, { date: 1 }),
        set(lastDayOfMonth(base), { hours: 23, minutes: 59, seconds: 59, milliseconds: 59 })
      ]
    }
  }

  export function arrangeDatesRAWRevenue (data: IBaseDateValue[], yearMonth: string, closingDate?: number) {
    if (data[0] != null) {
      const result: IBaseDateValue[] = []
      const yearMonthMap: Map<string, IBaseDateValue> = new Map()
      let [startDate, endDate] = yearMonthBound(yearMonth, closingDate)
      let iteratorDate = new Date(startDate)

      for (; iteratorDate <= endDate; iteratorDate = addDays(iteratorDate, 1)) {
        const formatDate = format(iteratorDate, 'yyyy-MM-dd')
        const obj: IBaseDateValue = {
          date: formatDate,
          value: 0
        }
        yearMonthMap.set(formatDate, obj)
        result.push(obj)
      }

      for (const item of data) {
        if (new Date(item.date) <= endDate && new Date(item.date) >= startDate ) {
          const key = format(new Date(item.date), 'yyyy-MM-dd')
          let obj = yearMonthMap.get(key)
          obj.date = item.date
          obj.value = item.value
        }
      }

      return result
    }
    return data
  }

  export function differenceInBusinessDays (init: Date, end: Date): number {
    let count = 0
    let date = init
    do {
      if (![0, 6].includes(getDay(date))) {
        ++count
      }
      date = addDays(date, 1) 
    } while (date <= end)
    return count
  }
}
