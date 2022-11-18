import { addDays, differenceInBusinessDays, format } from 'date-fns'
import { IBaseDailyChart } from 'src/dtos/sales/revenue.dto'

export namespace DailyBarsUtils {
  // Busca o índice do ultimo dia faturado do mês
  export function getMonthIndex (dto: IBaseDailyChart) {
    const todayDate = format(new Date(), 'yyyy-MM-dd')
    let index = dto.values?.length - 1
    let countDays = -1

    if (dto.values.length > 0) {
      index = (dto.dates as number[]).findIndex((value: number) => format(value, 'yyyy-MM-dd') === todayDate)
      countDays = differenceInBusinessDays(addDays(new Date(), 1), dto.dates[0] as number)
    }

    if (index === -1) {
      index = dto.dates.length - 1
      countDays = differenceInBusinessDays(addDays(dto.dates[index] as number, 1), dto.dates[0] as number)
    }

    return {
      index,
      countDays
    }
  }
}
