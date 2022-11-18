<template>
  <q-page
    class="q-pb-lg"
  >
    <responsive-header>
      <sales-header />
    </responsive-header>
    <profit-loading
      v-if="teamHeaderStatus === 'loading'"
    />
    <transition
      appear
      enter-active-class="animated fadeIn"
    >
      <div
        v-show="teamHeaderStatus !== 'loading'"
        class="row justify-center q-mt-md q-col-gutter-sm"
      >
        <div
          class="col-12 col-md-5 col-lg-5"
        >
          <chart-manager
            ref="ProfitDailyBarsRef"
            startComponent="ProfitDailyBars"
            :startProps="{
              'extern-no-data': true
            }"
          />
        </div>
        <div
          class="col-12 col-md-5 col-lg-5"
          v-if="teamHeader?.type === 'team'"
        >
          <chart-manager
            ref="ProfitResumeBarsRef"
            startComponent="ProfitResumeBars"
            :startProps="{
              'extern-no-data': true
            }"
          />
        </div>
      </div>
    </transition>
  </q-page>
</template>

<script lang="ts">
import ProfitLoading from 'src/pages/Profit/ProfitLoading.vue'
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { defineComponent, computed, ref, Ref, nextTick, watch } from 'vue'

export default defineComponent({
  components: {
    ProfitLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader
  },

  setup () {
    const { yearMonth } = useYearMonthDropdown()
    const { team: teamHeader, updateSelected, status: teamHeaderStatus } = useTeamDropdown(false)
    const { user } = useAuth()

    /* Charts */
    const ProfitResumeBarsRef: Ref<any> = ref(null)
    const ProfitDailyBarsRef: Ref<any> = ref(null)

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          ProfitDailyBarsRef.value?.newState({
            component: 'ProfitDailyBars',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              yearMonth: yearMonth.value,
              cumulative: false
            }
          })
          ProfitResumeBarsRef.value?.newState({
            component: 'ProfitResumeBars',
            props: {
              teamCode: teamHeader.value?.code,
              yearMonth: yearMonth.value
            }
          })
        } else {
          ProfitDailyBarsRef.value?.newState({ component: 'ProfitDailyBars', props: { 'extern-no-data': true } })
          ProfitResumeBarsRef.value?.newState({ component: 'ProfitResumeBars', props: { 'extern-no-data': true } })
        }
      })
    }

    updateSelected.value = (status) => update(status)
    watch(yearMonth, () => {
      if (user.value?.fgFuncao === 1) {
        update('loaded')
      }
    })

    return {
      ProfitDailyBarsRef,
      ProfitResumeBarsRef,
      teamHeader,
      teamHeaderStatus,
      yearMonth,
      loading: computed(() => !teamHeader.value || !yearMonth.value)
    }
  }
})
</script>
