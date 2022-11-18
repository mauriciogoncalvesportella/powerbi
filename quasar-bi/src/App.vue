<template>
  <router-view />
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import { setCssVar, colors, getCssVar } from 'quasar'

const { getPaletteColor } = colors
export default defineComponent({
  setup () {
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
  }
})
</script>
