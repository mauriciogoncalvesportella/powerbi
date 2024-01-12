<template>
  <responsive-header>
    <sales-header
      :show-year-month="false"
    >
      <div
        class="col-12 col-sm-3 col-md-2 col-lg-1"
      >
        <linearity-dropdown />
      </div>
    </sales-header>
  </responsive-header>

  <!--
  <linearity-loading
    v-if="teamHeaderStatus === 'loading'"
  />
  -->

  <!-- <q-inner-loading
    v-if="teamHeaderStatus === 'loading'"
  >
    <q-spinner-gears size="50px" color="primary" />
  </q-inner-loading> -->

  <div
    class="row justify-start"
    :class="{
      'q-pa-xs': $q.screen.gt.sm
    }"
    :style="`height: ${chartContainerHeight};`"
  >
    <div
      v-show="($q.screen.lt.md && mobileCurrentTab === 'graphs') || $q.screen.gt.sm"
      class="col-12 col-md-4 col-lg-3 col-xl-4 q-gutter-y-xs"
      style="height: 100%; display: flex; flex-direction: column; overflow: hidden;"
    >
      <chart-manager
        ref="LinearityQuantityChartRef"
        startComponent="LinearityQuantityChart"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-no-data': true,
          loading: true,
          flex: true
        }"
        style="height: 100%; flex-grow: 1;"
      />
      <chart-manager
        ref="LinearityPotentialChartRef"
        startComponent="LinearityPotentialChart"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-no-data': true,
          loading: true,
          flex: true
        }"
        style="height: 100%;flex-grow: 1;"
      />
    </div>
    <linearity-data
      v-if="($q.screen.lt.md && mobileCurrentTab === 'list') || $q.screen.gt.sm"
      :force-loading="teamHeaderStatus === 'loading'"
      class="col bg-gray-3"
      :class="{
        'q-ml-xs': $q.screen.gt.sm,
      }"
    />
  </div>
  <q-footer
    v-if="$q.screen.lt.md"
    elevated
  >
    <q-tabs
      v-model="mobileCurrentTab"
      dense
      indicator-color="white"
      active-color="white"
      class="bg-primary text-grey-5 shadow-2"
    >
      <q-tab name="graphs" icon="bar_chart" label="Indicadores" />
      <q-tab name="list" icon="list" label="Lista" />
    </q-tabs>
  </q-footer>
  <!--div class="row justify-start q-pt-sm">
    <div
      id="linearity-chart-container"
      v-show="teamHeaderStatus !== 'loading'"
      class="col-5 col-lg-3 col-xl-4 column justify-start q-pl-sm q-pr-sm custom-scroll"
    >
      <chart-manager
        ref="LinearityQuantityChartRef"
        startComponent="LinearityQuantityChart"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-no-data': true
        }"
      />
      <chart-manager
        class="q-pt-sm"
        ref="LinearityPotentialChartRef"
        startComponent="LinearityPotentialChart"
        :loading="teamHeaderStatus === 'loading'"
        :startProps="{
          'extern-no-data': true
        }"
        style="max-height: 100px;"
      />
    </div>
    <linearity-data class="col" />
  </div-->
  <global-dialogs />
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import LinearityList from 'src/components/sales/linearity/LinearityList.vue'
import LinearityLoading from 'src/pages/Linearity/LinearityLoading.vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { defineComponent, nextTick, ref, Ref, onMounted, computed } from 'vue'
import { format, addMonths } from 'date-fns'
import LinearityDropdown from 'src/components/sales/linearity/LinearityDropdown.vue'
import LinearityData from 'src/components/sales/linearity/LinearityData.vue'
import LinearitySortDropdown from 'src/components/sales/linearity/LinearitySortDropdown.vue'
import GlobalDialogs from 'src/components/GlobalDialogs.vue'
import { useQuasar } from 'quasar'
import { useLinearity } from 'src/reactive/UseLinearity'

export default defineComponent({
  components: {
    LinearityLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader,
    LinearityList,
    LinearityData,
    LinearityDropdown,
    LinearitySortDropdown,
    GlobalDialogs
  },

  setup () {
    const $q = useQuasar()
    const { mobileCurrentTab } = useLinearity()
    const { yearMonth } = useYearMonthDropdown()
    const { team: teamHeader, status: teamHeaderStatus, updateSelected, params, refresh } = useTeamDropdown(true)
    const { user } = useAuth()

    const endYearMonth = format(addMonths(new Date(), -1), 'yyyy-MM')
    const startYearMonth = format(addMonths(new Date(), -5), 'yyyy-MM')
    params.value = { teamCode: user.value?.cdEquipe as number, interval: [startYearMonth, endYearMonth] }
    refresh()

    /* Charts */
    const LinearityQuantityChartRef: Ref<any> = ref(null)
    const LinearityPotentialChartRef: Ref<any> = ref(null)

    const chartContainerHeight = computed(() => {
      if ($q.screen.lt.md) {
        return 'calc(100svh - 50px - 56px)'
      }
      return 'calc(100vh - 64px)'
    })

    const chartContainerOverflow = computed(() => {
      if ($q.screen.lt.md && mobileCurrentTab.value === 'charts') {
        return 'overflow-x: none; overflow-y: scroll'
      }
      return 'overflow-x: none; overflow-y: none'
    })

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          LinearityQuantityChartRef.value?.newState({
            component: 'LinearityQuantityChart',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type
            }
          })
          LinearityPotentialChartRef.value?.newState({
            component: 'LinearityPotentialChart',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type
            }
          })
        } else {
          LinearityQuantityChartRef.value?.newState({ component: 'LinearityQuantityChart', props: { 'extern-no-data': true } })
          LinearityPotentialChartRef.value?.newState({ component: 'LinearityQuantityChart', props: { 'extern-no-data': true } })
        }
      })
    }

    updateSelected.value = (status) => update(status)
    onMounted(() => {
      if (user.value?.fgFuncao === 1) {
        update('loaded')
      }
    })

    return {
      mobileCurrentTab,
      chartContainerHeight,
      chartContainerOverflow,
      LinearityQuantityChartRef,
      LinearityPotentialChartRef,
      teamHeader,
      teamHeaderStatus,
      yearMonth
    }
  }
})
</script>

<style>
#linearity-chart-container {
  overflow-x: hidden;
  height: calc(100vh - 83px);
}
</style>
