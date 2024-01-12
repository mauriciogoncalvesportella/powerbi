<template>
  <q-page
    class="column full-width q-pb-lg"
  >
    <responsive-header>
      <sales-header>
        <div
          class="col-12 col-md-4 col-lg-3"
        >
          <comparative-dropdown />
        </div>
      </sales-header>
    </responsive-header>

    <div
      class="row justify-center q-mt-md q-col-gutter-sm q-mx-md"
    >
      <div
        class="col-12 col-md-8 col-lg-6"
      >
        <chart-manager
          ref="ComparativePeriodsRef"
          startComponent="ComparativePeriods"
          :startProps="{
            'extern-no-data': false,
            'extern-loading': true,
            chartType: 'revenue'
          }"
          @custom-event="customEvent"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import MarkupLoading from 'src/pages/Markup/MarkupLoading.vue'
import ComparativeDropdown from 'src/components/sales/comparative/ComparativeDropdown.vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { defineComponent, nextTick, Ref, ref, onMounted, watch } from 'vue'
import { format, addMonths } from 'date-fns'
import { useComparative } from 'src/reactive/UseComparative'

export default defineComponent({
  components: {
    MarkupLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader,
    ComparativeDropdown
  },

  setup () {
    const { user } = useAuth()
    const { yearMonth } = useYearMonthDropdown()
    const { team: teamHeader, status: teamHeaderStatus, updateSelected, params, refresh } = useTeamDropdown(true)
    const { headerModels, getFavoriteProducts, favoriteProducts, removeFavoriteProductSelected, setFavoriteProduct, selectedFavoriteProduct } = useComparative()
    const endYearMonth = format(addMonths(new Date(), 0), 'yyyy-MM')
    const startYearMonth = format(addMonths(new Date(), -5), 'yyyy-MM')
    params.value = { teamCode: user.value?.cdEquipe as number, interval: [startYearMonth, endYearMonth] }

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

    const updateIfSeller = () => {
      if (user.value?.fgFuncao === 1) {
        update('loaded')
      }
    }

    onMounted(() => {
      Promise.all([getFavoriteProducts(), refresh()])
        .then(() => {
          updateIfSeller()
          watch(headerModels, () => update('loaded'), { deep: true })
          watch(yearMonth, () => update('loaded'))
          updateSelected.value = (status) => update(status)
          update('loaded')
        })
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
