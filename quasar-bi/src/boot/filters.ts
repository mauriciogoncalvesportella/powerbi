import { boot } from 'quasar/wrappers'
import { DateUtils } from 'src/utils/date.utils'
import { NumberUtils } from 'src/utils/number.utils'
import DateFilters from 'src/filters/DateFilters'

export default boot(({ app }) => {
  app.config.globalProperties.$filters = {
    ...DateFilters
  }

  app.mixin({
    methods: {
      number2thousand: (value: string | number) => {
        return NumberUtils.number2thousand(value)
      },

      number2currency: (value: string | number, simple: boolean = false) => {
        return NumberUtils.number2currency(value, simple)
      },

      date2format: (param: string | number | Date, pattern: string) => {
        return DateUtils.date2format(param, pattern)
      },

      yearMonth2format: (param: string, pattern: string) => {
        const date = new Date(`${param}-01 00:00`)
        return DateUtils.date2format(date, pattern)
      }
    }
  })
})
