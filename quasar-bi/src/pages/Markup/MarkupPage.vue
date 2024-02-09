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
        ref="MarkupDailyBarsRef"
        startComponent="MarkupDailyBars"
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
        ref="MarkupResumeBarsRef"
        startComponent="MarkupResumeBars"
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
import YearMonthDropdown from 'src/components/YearMonthDropdown.vue'
import TeamDropdown from 'src/components/sales/TeamDropdown.vue'
import { useAuth } from 'src/reactive/UseAuth'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import UserRoles from 'src/utils/userRoles.utils'
import { defineComponent, ref, Ref, nextTick, onMounted } from 'vue'

export default defineComponent({
  components: {
    MarkupLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader,
    YearMonthDropdown,
    TeamDropdown
  },

  setup () {
    const { user } = useAuth()
    const { yearMonth, init: initYearMonth, YearMonthDropdownEmitter } = useYearMonthDropdown()
    const { team: teamHeader, status: teamHeaderStatus, params, init: initTeamDropdownw, TeamDropdownEmitter } = useTeamDropdown()
    // const { user } = useAuth()

    /* Charts */
    const MarkupDailyBarsRef: Ref<any> = ref(null)
    const MarkupResumeBarsRef: Ref<any> = ref(null)

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          MarkupDailyBarsRef.value?.newState({
            component: 'MarkupDailyBars',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              yearMonth: yearMonth.value,
              cumulative: false
            }
          })
          if (teamHeader.value?.type === 'team') {
            MarkupResumeBarsRef.value?.newState({
              component: 'MarkupResumeBars',
              props: {
                teamCode: teamHeader.value?.code,
                yearMonth: yearMonth.value
              }
            })
          } else {
            MarkupResumeBarsRef.value?.newState({ component: 'MarkupResumeBars', props: { 'extern-no-data': true } })
          }
        } else {
          MarkupDailyBarsRef.value?.newState({ component: 'MarkupDailyBars', props: { 'extern-no-data': true } })
          MarkupResumeBarsRef.value?.newState({ component: 'MarkupResumeBars', props: { 'extern-no-data': true } })
        }
      })
    }

    onMounted(async () => {
      initYearMonth()
      if (!yearMonth.value || !user.value) {
        return
      }
      params.value = { interval: [yearMonth.value, yearMonth.value], teamCode: user.value?.cdEquipe }
      await initTeamDropdownw(UserRoles.verifyRole('sales.markup.all'))
      update('loaded')

      YearMonthDropdownEmitter.on('updateYearMonthDropdown', () => update('loaded'))
      TeamDropdownEmitter.on('updateTeamDropdown', () => update('loaded'))
    })

    return {
      verifyRole: UserRoles.verifyRole,
      MarkupDailyBarsRef,
      MarkupResumeBarsRef,
      teamHeader,
      yearMonth,
      teamHeaderStatus
    }
  }
})

</script>
