<template>
  <q-page
    class="collumn full-width q-pb-lg q-mt-md"
  >
    <responsive-header>
      <sales-header
        :show-year-month="false"
      >
        <div
          class="col-12 col-sm-3 col-md-2 col-lg-1"
        >
          <linearity-dropdown />
        </div>
        <div
          class="col-12 col-sm-3 col-md-3 col-lg-1"
        >
          <linearity-sort-dropdown />
        </div>
      </sales-header>
    </responsive-header>
    <linearity-loading
      v-if="teamHeaderStatus === 'loading'"
    />
    <transition
      appear
      enter-active-class="animated fadeIn"
    >
      <div>
        <div
          v-show="teamHeaderStatus !== 'loading'"
          class="row justify-center"
        >
          <div
            class="col-12 col-md-5 q-pa-xs"
            style="max-width: 600px"
          >
            <chart-manager
              ref="LinearityQuantityChartRef"
              startComponent="LinearityQuantityChart"
              :loading="teamHeaderStatus === 'loading'"
              :startProps="{
                'extern-no-data': true
              }"
            />
          </div>
          <div
            class="col-12 col-md-5 q-pa-xs"
            style="max-width: 600px"
          >
            <chart-manager
              ref="LinearityPotentialChartRef"
              startComponent="LinearityPotentialChart"
              :loading="teamHeaderStatus === 'loading'"
              :startProps="{
                'extern-no-data': true
              }"
            />
          </div>
        </div>
        <div
          class="row justify-center"
        >
          <div
            class="col-12 col-lg-10 col-xl-8 q-pa-xs"
          >
            <linearity-data />
          </div>
        </div>
      </div>
    </transition>
    <global-dialogs />
  </q-page>
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
import { defineComponent, nextTick, ref, Ref, onMounted } from 'vue'
import { format, addMonths } from 'date-fns'
import LinearityDropdown from 'src/components/sales/linearity/LinearityDropdown.vue'
import LinearityData from 'src/components/sales/linearity/LinearityData.vue'
import LinearitySortDropdown from 'src/components/sales/linearity/LinearitySortDropdown.vue'
import GlobalDialogs from 'src/components/GlobalDialogs.vue'

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
      LinearityQuantityChartRef,
      LinearityPotentialChartRef,
      teamHeader,
      teamHeaderStatus,
      yearMonth
    }
  }
})
</script>
