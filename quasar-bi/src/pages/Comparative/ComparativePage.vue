<template>
  <q-page style="overflow-y: hidden;">
    <responsive-header>
      <div
        class="col col-md-3 col-lg-2 q-mr-xs"
      >
        <year-month-dropdown
          ref="yearMonthDropdownRef"
          id="yearMonthDropdownComponent"
        />
      </div>
      <div
        class="col col-md-3 col-lg-2 q-ml-xs q-mr-xs"
      >
        <team-dropdown
          ref="teamDropdownRef"
        />
      </div>
      <div
        class="col-12 col-md-4 col-lg-3 q-ml-xs"
      >
        <comparative-dropdown />
      </div>
    </responsive-header>

    <div
      style="display: flex; gap: 10px; max-width: 900px;"
      :style="`flex-direction: ${$q.screen.lt.md ? 'column' : 'row'}; height: 600px`"
      class="q-mt-sm q-mx-auto"
    >
      <chart-manager
        ref="ComparativePeriodsRef"
        startComponent="ComparativePeriods"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-loading': true,
          'extern-no-data': false,
          flex: true
        }"
        flex
        style="height: 100%; flex: 1"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import MarkupLoading from 'src/pages/Markup/MarkupLoading.vue'
import ComparativeDropdown from 'src/components/sales/comparative/ComparativeDropdown.vue'
import YearMonthDropdown from 'src/components/YearMonthDropdown.vue'
import TeamDropdown from 'src/components/sales/TeamDropdown.vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { defineComponent, nextTick, Ref, ref, onMounted } from 'vue'
import { format, addMonths } from 'date-fns'
import { useComparative } from 'src/reactive/UseComparative'
import UserRoles from 'src/utils/userRoles.utils'

export default defineComponent({
  components: {
    MarkupLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader,
    ComparativeDropdown,
    YearMonthDropdown,
    TeamDropdown
  },

  setup () {
    const { user } = useAuth()
    const { yearMonth, init: initYearMonth, YearMonthDropdownEmitter } = useYearMonthDropdown()
    const { team: teamHeader, status: teamHeaderStatus, params, init: initTeamDropdownw, TeamDropdownEmitter } = useTeamDropdown()
    const { headerModels, getFavoriteProducts, favoriteProducts, removeFavoriteProductSelected, setFavoriteProduct, selectedFavoriteProduct } = useComparative()

    const ComparativePeriodsRef: Ref<any> = ref(null)
    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          ComparativePeriodsRef.value?.newState({
            component: 'ComparativePeriods',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              dataMode: headerModels.value.dataMode,
              favoriteProductSelected: selectedFavoriteProduct,
              favoriteProducts: favoriteProducts.value,
              yearMonth: yearMonth.value,
              iterationMode: headerModels.value.iterationMode,
              expandTeam: true,
              frequency: headerModels.value.frequency,
              iterationsCount: headerModels.value.iterations
            }
          })
        } else {
          ComparativePeriodsRef.value?.newState({ component: 'ComparativePeriods', props: { 'extern-no-data': true } })
        }
      })
    }

    onMounted(async () => {
      initYearMonth()
      if (!yearMonth.value || !user.value) {
        return
      }
      const endYearMonth = format(addMonths(new Date(), 0), 'yyyy-MM')
      const startYearMonth = format(addMonths(new Date(), -5), 'yyyy-MM')
      params.value = { teamCode: user.value.cdEquipe, interval: [startYearMonth, endYearMonth] }
      await getFavoriteProducts()
      await initTeamDropdownw(UserRoles.verifyRole('sales.comparative.all'))
      update('loaded')

      YearMonthDropdownEmitter.on('updateYearMonthDropdown', () => update('loaded'))
      TeamDropdownEmitter.on('updateTeamDropdown', () => update('loaded'))
    })

    const customEvent = (event: { id: string, payload: any }) => {
      switch (event.id) {
        case 'COMPARATIVE_PERIODS_REMOVE_FAV': removeFavoriteProductSelected(); break
        case 'COMPARATIVE_PERIODS_ON_CLICK_FAV': setFavoriteProduct(event.payload); break
      }

      if (event.id.startsWith('COMPARATIVE_PERIODS')) {
        update('loaded')
      }
    }

    return {
      customEvent,
      ComparativePeriodsRef,
      update,
      user,
      yearMonth,
      teamHeader,
      teamHeaderStatus
    }
  }
})
</script>
