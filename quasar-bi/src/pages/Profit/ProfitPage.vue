<template>
  <q-page
    style="overflow-y: hidden;"
  >
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
        class="col col-md-3 col-lg-2 q-ml-xs"
      >
        <team-dropdown
          ref="teamDropdownRef"
        />
      </div>
    </responsive-header>

    <div
      style="display: flex; gap: 10px; max-width: 1400px;"
      :style="`flex-direction: ${$q.screen.lt.md ? 'column' : 'row'}; height: ${$q.screen.lt.md ? '1000px' : '500px'}`"
      class="q-mt-sm q-mx-auto"
    >
      <chart-manager
        ref="ProfitDailyBarsRef"
        startComponent="ProfitDailyBars"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-loading': true,
          'extern-no-data': false,
          flex: true
        }"
        flex
        style="height: 100%; flex: 1"
      />
      <chart-manager
        v-if="verifyRole('sales.revenue.all')"
        ref="ProfitResumeBarsRef"
        startComponent="ProfitResumeBars"
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
import ProfitLoading from 'src/pages/Profit/ProfitLoading.vue'
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import YearMonthDropdown from 'src/components/YearMonthDropdown.vue'
import TeamDropdown from 'src/components/sales/TeamDropdown.vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { defineComponent, computed, ref, Ref, nextTick, onMounted } from 'vue'
import UserRoles from 'src/utils/userRoles.utils'

export default defineComponent({
  components: {
    ProfitLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader,
    YearMonthDropdown,
    TeamDropdown
  },

  setup () {
    const { init: initYearMonth, yearMonth, YearMonthDropdownEmitter } = useYearMonthDropdown()
    const { init: initTeamDropdownw, team: teamHeader, status: teamHeaderStatus, params, TeamDropdownEmitter } = useTeamDropdown()
    const { user } = useAuth()

    /* Charts */
    const ProfitResumeBarsRef: Ref<any> = ref(null)
    const ProfitDailyBarsRef: Ref<any> = ref(null)

    const update = (status: string) => {
      console.log('UPDATE!!')
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
          if (teamHeader.value?.type === 'team') {
            ProfitResumeBarsRef.value?.newState({
              component: 'ProfitResumeBars',
              props: {
                teamCode: teamHeader.value?.code,
                yearMonth: yearMonth.value
              }
            })
          } else {
            ProfitResumeBarsRef.value?.newState({ component: 'ProfitResumeBars', props: { 'extern-no-data': true } })
          }
        } else {
          ProfitDailyBarsRef.value?.newState({ component: 'ProfitDailyBars', props: { 'extern-no-data': true } })
          ProfitResumeBarsRef.value?.newState({ component: 'ProfitResumeBars', props: { 'extern-no-data': true } })
        }
      })
    }

    onMounted(async () => {
      initYearMonth()
      if (!yearMonth.value || !user.value) {
        return
      }
      params.value = { interval: [yearMonth.value, yearMonth.value], teamCode: user.value?.cdEquipe }
      await initTeamDropdownw(UserRoles.verifyRole('sales.profit.all'))
      update('loaded')

      YearMonthDropdownEmitter.on('updateYearMonthDropdown', () => update('loaded'))
      TeamDropdownEmitter.on('updateTeamDropdown', () => update('loaded'))
    })

    return {
      verifyRole: UserRoles.verifyRole,
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
