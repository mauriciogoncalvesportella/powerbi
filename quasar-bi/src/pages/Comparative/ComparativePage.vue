<template>
  <q-page
    class="column full-width q-pb-lg"
  >
    <responsive-header>
      <sales-header
        :show-year-month="false"
      >
        <comparative-dropdown />
      </sales-header>
    </responsive-header>

    <transition
      appear
      enter-active-class="animated fadeIn"
    >
      <div
        v-show="teamHeaderStatus !== 'loading'"
        class="row justify-center q-mt-md q-col-gutter-sm q-mx-md"
      >
        <div
          class="col-12 col-md-8 col-lg-6"
        >
          <chart-manager
            ref="ComparativePeriodsRef"
            startComponent="ComparativePerids"
            :startProps="{
              'extern-no-data': true,
              chartType: 'revenue'
            }"
          />
        </div>
        <!--div
          class="col-12 col-md-5 col-lg-4"
        >
          <chart-manager
            ref="ComparativeBarsRevenueRef"
            startComponent="ComparativeBars"
            :startProps="{
              'extern-no-data': true,
              chartType: 'revenue'
            }"
          />
        </div>
        <div
          class="col-12 col-md-5 col-lg-4"
        >
          <chart-manager
            ref="ComparativeBarsMarkupRef"
            startComponent="ComparativeBars"
            :startProps="{
              'extern-no-data': true,
              chartType: 'markup'
            }"
          />
        </div>
        <div
          v-if="user?.fgFuncao === 3"
          class="col-12 col-md-5 col-lg-4"
        >
          <chart-manager
            ref="ComparativeBarsProfitRef"
            startComponent="ComparativeBars"
            :startProps="{
              'extern-no-data': true,
              chartType: 'profit'
            }"
          />
        </div-->
      </div>
    </transition>
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
    const { headerModels } = useComparative()
    const endYearMonth = format(addMonths(new Date(), 0), 'yyyy-MM')
    const startYearMonth = format(addMonths(new Date(), -5), 'yyyy-MM')
    params.value = { teamCode: user.value?.cdEquipe as number, interval: [startYearMonth, endYearMonth] }
    refresh()

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
              iterationMode: headerModels.value.iterationMode,
              expandTeam: false,
              frequency: headerModels.value.frequency,
              iterationsCount: headerModels.value.iterations
            }
          })
        } else {
          ComparativePeriodsRef.value?.newState({ component: 'ComparativePeriods', props: { 'extern-no-data': true } })
        }
      })
    }

    watch(headerModels, () => update('loaded'), { deep: true })

    /*
    const ComparativeBarsProfitRef: Ref<any> = ref(null)
    const ComparativeBarsMarkupRef: Ref<any> = ref(null)
    const ComparativeBarsRevenueRef: Ref<any> = ref(null)

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          ComparativeBarsProfitRef.value?.newState({
            component: 'ComparativeBars',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              chartType: 'profit'
            }
          })
          ComparativeBarsMarkupRef.value?.newState({
            component: 'ComparativeBars',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              chartType: 'markup'
            }
          })
          ComparativeBarsRevenueRef.value?.newState({
            component: 'ComparativeBars',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              chartType: 'revenue'
            }
          })
        } else {
          ComparativeBarsProfitRef.value?.newState({ component: 'ComparativeBars', props: { chartType: 'profit', 'extern-no-data': true } })
          ComparativeBarsMarkupRef.value?.newState({ component: 'ComparativeBars', props: { chartType: 'markup', 'extern-no-data': true } })
          ComparativeBarsRevenueRef.value?.newState({ component: 'ComparativeBars', props: { chartType: 'revenue', 'extern-no-data': true } })
        }
      })
    }
    */

    const updateIfSeller = () => {
      if (user.value?.fgFuncao === 1) {
        update('loaded')
      }
    }

    onMounted(() => updateIfSeller())
    updateSelected.value = (status) => update(status)

    return {
      ComparativePeriodsRef,
      // ComparativeBarsProfitRef,
      // ComparativeBarsMarkupRef,
      // ComparativeBarsRevenueRef,
      update,
      user,
      yearMonth,
      teamHeader,
      teamHeaderStatus
    }
  }
})
</script>
