import { boot } from 'quasar/wrappers'
import VueApexCharts from 'vue3-apexcharts'
import { setCssVar, getCssVar, colors } from 'quasar'

export const ChartColors = {
  markup_value: '',
  markup_goal: '',
  markup_billed: '',
  profit_value: '',
  profit_goal: '',
  profit_billed: '',
  revenue_goal: '',
  revenue_not_billed: '',
  revenue_value: ''
}

export default boot(({ app }) => {
  const primary = (getCssVar('primary') as string) ?? '#1976d2'
  const green = colors.getPaletteColor('green-13') ?? '#00e676'
  const orange = colors.getPaletteColor('orange-8') ?? '#f57c00'

  setCssVar('markup_goal', green)
  setCssVar('markup_billed', orange)

  setCssVar('profit_value', primary)
  setCssVar('profit_goal', green)
  setCssVar('profit_billed', orange)

  setCssVar('revenue_goal', green)
  setCssVar('revenue_not_billed', orange)

  ChartColors.markup_value = primary
  ChartColors.markup_goal = green
  ChartColors.markup_billed = orange
  ChartColors.profit_value = primary
  ChartColors.profit_goal = green
  ChartColors.profit_billed = orange
  ChartColors.revenue_goal = green
  ChartColors.revenue_not_billed = orange
  ChartColors.revenue_value = primary

  app.provide('ChartColors', ChartColors)
  app.use(VueApexCharts)
})
