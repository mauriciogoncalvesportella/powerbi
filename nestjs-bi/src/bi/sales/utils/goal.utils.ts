import {IBaseDateValue} from "../sales.types"
import { addDays, getDay } from 'date-fns'

export namespace GoalUtils {
  export function calculateAccumulate (raw: IBaseDateValue[], percentual: boolean = false) {
    let n = 1
    for (let i = 0, total = 0; i < raw.length; i++) {
      if (percentual && i > 0) {
        const dayOfWeek = getDay(new Date(raw[i].date))
        if (raw[i].value > 0 || !(dayOfWeek === 6 || dayOfWeek === 0)) {
          raw[i].value = ((raw[i - 1].value * n) + raw[i].value)/(n + 1)
          n++
        } else {
          raw[i].value = raw[i - 1].value
        }
      } else if (!percentual) {
        const value = raw[i].value
        raw[i].value += total
        total += value
      }
    }
    return raw
  }

  export function calculateGoalAccumulate (raw: IBaseDateValue[], dailyGoal: number, monthlyGoal: number) {
    const goalValues = []

    for (let i = 0, totalGoal = 0; i < raw.length; i++) {
      const dayOfWeek = getDay(new Date(raw[i].date))
      if (dayOfWeek !== 6 && dayOfWeek !== 0) {
        totalGoal += dailyGoal
        goalValues.push(totalGoal)
      } else {
        goalValues.push(totalGoal)
      }
    }

    goalValues[goalValues.length - 1] = monthlyGoal

    return goalValues
  }

  export function calculateGoal (raw: IBaseDateValue[], dailyGoal: number) {
    const goalValues = []
    for (let i = 0; i < raw.length; i++) {
      goalValues.push(dailyGoal)
    }
    return goalValues
  }

  export function calculateDailyGoal (raw: IBaseDateValue[], monthlyGoal: number) {
    const totalCommercialDays: number = calculateCommercialDays(raw)
    return monthlyGoal/totalCommercialDays
  }

  export function _calculateDailyGoal (dates: Date[], monthlyGoal: number) {
    let iteratorDate = new Date(dates[0])
    let commercialDays = 0
    for (; iteratorDate <= dates[1]; iteratorDate = addDays(iteratorDate, 1)) {
      if (![0, 6].includes(getDay(iteratorDate))) {
        ++commercialDays
      }
    }
    return monthlyGoal/commercialDays
  }

  export function calculateCommercialDays (data: IBaseDateValue[]) {
    return data.reduce((prev, curr, index) => {
      /*
      if (data[index].value > 0) {
        return ++prev
      }
      */
      return prev + ([0, 6].includes(getDay(new Date(curr.date))) ? 0 : 1)
    }, 0)
  }
}
