export const PeriodStructure = {
  groupSize: {
    'anualy': 0,
    'semester': 1,
    'quartely': 3,
    'monthly': 11
  },
  monthsByPeriod: {
    'anualy': [[0,1,2,3,4,5,6,7,8,9,10,11]],
    'semester': [[0,1,2,3,4,5], [6,7,8,9,10,11]],
    'quartely': [[0,1,2], [3,4,5], [6,7,8], [9,10,11]],
    'monthly': [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11]]
  },
  groups: {
    'anualy': [0,0,0,0,0,0,0,0,0,0,0,0],
    'semester': [0,0,0,0,0,0,1,1,1,1,1,1],
    'quartely': [0,0,0,1,1,1,2,2,2,3,3,3],
    'monthly': [0,1,2,3,4,5,6,7,8,9,10,11]
  }
}

export class Period {
  constructor (
    public year: number,
    public period: number
  ) { }

  static factory (key: string): Period {
    const [year, period] = key.split('.')
    return new Period(parseInt(year), parseInt(period))
  }

  get key () {
    return `${this.year}.${this.period}`
  }

  static sort (comparativeKeys: string[]): void {
    comparativeKeys.sort((a, b) => {
      const [a_year, a_period] = a.split('.')
      const [b_year, b_period] = b.split('.')

      if (a_year != b_year) {
        return (parseInt(a_year) > parseInt(b_year)) ? 1 : -1
      }

      return parseInt(a_period) > parseInt(b_period) ? 1 : -1
    })
  }
}

export interface GetYearMonthsReturn {
  periodFromYearMonth: Record<string, Period>,
  monthLabels: Record<number, string>,
  periodsArr: Period[],
  periods: Record<string, string[]>,
  periodsMonths: Record<string, number[]>,
  yearMonths: string[],
  periodsLabelsMap: Record<string, Record<number, string>>
}
