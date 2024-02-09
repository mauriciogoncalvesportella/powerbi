<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
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
    <!--revenue-loading
      v-if="teamHeaderStatus === 'loading'"
    /-->
    <div
      class="justify-center q-mt-sm"
    >
      <q-scroll-area
        style="height: 261px"
      >
        <div
          class="row justify-center q-gutter-x-sm no-wrap"
        >
          <gadget-manager
            ref="RevenueTodayGadgetRef"
            startComponent="RevenueTodayGadget"
            :disable-gadget="yearMonth !== $store.getters['auth/currentYearMonth']"
            :startProps="{
              'loading': true,
              'extern-loading': true,
              'exern-no-data': true
            }"
          />
          <gadget-manager
            ref="RevenueGadgetRef"
            startComponent="RevenueGadget"
            :startProps="{
              'extern-loading': true,
              'extern-no-data': true
            }"
          />
          <gadget-manager
            ref="RevenueMaxMinGadgetRef"
            startComponent="RevenueMaxMinGadget"
            :startProps="{
              'extern-loading': true,
              'extern-no-data': true
            }"
          />
          <gadget-manager
            v-if="verifyRole('sales.revenue.all')"
            ref="RevenueRankingGadgetRef"
            startComponent="RevenueRankingGadget"
            :disable-gadget="teamHeader?.type === 'seller'"
            :loading="teamHeaderStatus === 'loading'"
            :no-data="teamHeaderStatus === 'no-data'"
            :start-props="{
              'extern-loading': true,
              'extern-no-data': true
            }"
          />
        </div>
      </q-scroll-area>
    </div>

    <div
      style="display: flex; gap: 10px; max-width: 1400px;"
      :style="`flex-direction: ${$q.screen.lt.md ? 'column' : 'row'}; height: ${chartContainerHeight}`"
      class="q-mt-sm q-mx-auto"
    >
      <chart-manager
        startComponent="RevenueDailyChart"
        ref="RevenueDailyChartRef"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-loading': true,
          'extern-no-data': false,
          flex: true
        }"
        flex
        style="height: 100%; flex: 1;"
      />
      <chart-manager
        v-if="verifyRole('sales.revenue.all')"
        startComponent="RevenueResumeChart"
        ref="RevenueResumeChartRef"
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

    <global-dialogs />
  </q-page>
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import GadgetManager from 'components/GadgetManager.vue'
import RevenueRankingGadget from 'src/components/sales/gadgets/RevenueRankingGadget.vue'
import ChartSkeletonLoading from 'src/components/sales/charts/ChartSkeletonLoading.vue'
import GadgetSkeletonLoading from 'src/components/sales/gadgets/GadgetSkeletonLoading.vue'
import RevenueLoading from 'src/pages/Revenue/RevenueLoading.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import RevenueHeader from './RevenueHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import GlobalDialogs from 'src/components/GlobalDialogs.vue'
import YearMonthDropdown from 'src/components/YearMonthDropdown.vue'
import TeamDropdown from 'src/components/sales/TeamDropdown.vue'
import UserRoles from 'src/utils/userRoles.utils'
import { useQuasar } from 'quasar'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { emitter } from 'src/events'
import { UseRevenuePage } from 'src/pages/Revenue/UseRevenuePage'
import { nextTick, defineComponent, ref, Ref, onMounted, computed } from 'vue'

export default defineComponent({
  components: {
    YearMonthDropdown,
    TeamDropdown,
    GlobalDialogs,
    RevenueLoading,
    ChartSkeletonLoading,
    GadgetSkeletonLoading,
    ChartManager,
    RevenueRankingGadget,
    ResponsiveHeader,
    RevenueHeader,
    SalesHeader,
    GadgetManager
  },

  setup () {
    const $q = useQuasar()
    const { init: initYearMonth, yearMonth, YearMonthDropdownEmitter } = useYearMonthDropdown()
    const { init: initTeamDropdownw, team: teamHeader, status: teamHeaderStatus, params, TeamDropdownEmitter } = useTeamDropdown()
    const { user } = useAuth()

    const toggleLeftDrawer = () => emitter.emit('toggleLeftDrawer')
    const useRevenuePage = UseRevenuePage()

    /* Charts */
    const RevenueDailyChartRef: Ref<any> = ref(null)
    const RevenueResumeChartRef: Ref<any> = ref(null)

    /* Gadgets */
    const RevenueTodayGadgetRef: Ref<any> = ref(null)
    const RevenueRankingGadgetRef: Ref<any> = ref(null)
    const RevenueMaxMinGadgetRef: Ref<any> = ref(null)
    const RevenueGadgetRef: Ref<any> = ref(null)

    const chartContainerHeight = computed(() => {
      if (UserRoles.verifyRole('sales.revenue.all')) {
        return $q.screen.lt.md ? '1000px' : '500px'
      }
      return '500px'
    })

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          RevenueGadgetRef.value?.onNewState({
            code: teamHeader.value?.code,
            type: teamHeader.value?.type,
            yearMonth: yearMonth.value
          })
          RevenueMaxMinGadgetRef.value?.onNewState({
            code: teamHeader.value?.code,
            type: teamHeader.value?.type,
            yearMonth: yearMonth.value
          })
          RevenueTodayGadgetRef.value?.onNewState({
            code: teamHeader.value?.code,
            type: teamHeader.value?.type
          })
          RevenueDailyChartRef.value?.newState({
            component: 'RevenueDailyChart',
            props: {
              code: teamHeader.value?.code,
              yearMonth: yearMonth.value,
              type: teamHeader.value?.type,
              accumulated: false,
              'extern-no-data': false,
              'extern-loading': false,
              flex: true
            }
          })
          if (teamHeader.value?.type === 'team') {
            RevenueResumeChartRef.value?.newState({
              component: 'RevenueResumeChart',
              props: {
                code: teamHeader.value?.code,
                yearMonth: yearMonth.value,
                type: teamHeader.value?.type,
                flex: true
              }
            })
            RevenueRankingGadgetRef.value?.onNewState({
              code: teamHeader.value?.code,
              yearMonth: yearMonth.value
            })
          } else {
            RevenueRankingGadgetRef.value?.onNewState({ 'extern-no-data': true })
            RevenueResumeChartRef.value?.newState({ component: 'RevenueResumeChart', props: { 'extern-no-data': true } })
          }
        } else {
          RevenueGadgetRef.value?.onNewState({ 'extern-no-data': true })
          RevenueMaxMinGadgetRef.value?.onNewState({ 'extern-no-data': true })
          RevenueRankingGadgetRef.value?.onNewState({ 'extern-no-data': true })
          RevenueTodayGadgetRef.value?.onNewState({ 'extern-no-data': true })
          RevenueDailyChartRef.value?.newState({ component: 'RevenueDailyChart', props: { 'extern-no-data': true } })
          RevenueResumeChartRef.value?.newState({ component: 'RevenueResumeChart', props: { 'extern-no-data': true } })
        }
      })
    }

    onMounted(async () => {
      initYearMonth()
      if (yearMonth.value && user.value) {
        params.value = { interval: [yearMonth.value, yearMonth.value], teamCode: user.value.cdEquipe }
        await initTeamDropdownw(UserRoles.verifyRole('sales.revenue.all'))
        update('loaded')

        YearMonthDropdownEmitter.on('updateYearMonthDropdown', () => update('loaded'))
        TeamDropdownEmitter.on('updateTeamDropdown', () => update('loaded'))
      }
    })

    return {
      verifyRole: UserRoles.verifyRole,
      teamHeaderStatus,
      charts: useRevenuePage.charts,
      gadgets: useRevenuePage.gadgets,
      RevenueResumeChartRef,
      RevenueDailyChartRef,
      RevenueMaxMinGadgetRef,
      RevenueGadgetRef,
      RevenueRankingGadgetRef,
      RevenueTodayGadgetRef,
      chartContainerHeight,
      user,
      yearMonth,
      teamHeader,
      toggleLeftDrawer
    }
  }
})
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active em versões anteriores a 2.1.8 */ {
  opacity: 0;
}
</style>
