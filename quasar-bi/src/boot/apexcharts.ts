import { boot } from 'quasar/wrappers'
import VueApexCharts from 'vue3-apexcharts'
import { setCssVar, colors, getCssVar } from 'quasar'

const { getPaletteColor } = colors

export default boot(({ app }) => {
  setCssVar('apex0', getPaletteColor('primary'))
  setCssVar('apex1', getPaletteColor('green-13'))
  setCssVar('apex2', getPaletteColor('orange-8'))
  setCssVar('apex3', getPaletteColor('purple-6'))

  setCssVar('markup_value', getCssVar('apex0') as string)
  setCssVar('markup_goal', getCssVar('apex1') as string)
  setCssVar('markup_billed', getCssVar('apex2') as string)

  setCssVar('profit_value', getCssVar('apex0') as string)
  setCssVar('profit_goal', getCssVar('apex1') as string)
  setCssVar('profit_billed', getCssVar('apex2') as string)

  setCssVar('revenue_value', getCssVar('apex0') as string)
  setCssVar('revenue_goal', getCssVar('apex1') as string)
  setCssVar('revenue_not_billed', getCssVar('apex2') as string)
  app.use(VueApexCharts)
})
