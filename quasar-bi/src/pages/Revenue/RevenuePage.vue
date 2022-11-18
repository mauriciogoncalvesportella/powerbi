<template>
  <q-page
    class="collumn full-width q-pb-lg"
  >
    <responsive-header>
      <sales-header />
    </responsive-header>
    <revenue-loading
      v-if="teamHeaderStatus === 'loading'"
    />
    <transition
      appear
      enter-active-class="animated fadeIn"
    >
      <div
        v-show="teamHeaderStatus !== 'loading'"
        class="q-mt-sm"
      >
        <div
          class="row justify-center"
        >
          <div
            class="col-12 col-lg-10 q-px-xs"
          >
            <q-scroll-area
              style="height: 264px"
            >
              <div
                class="row justify-center q-gutter-x-sm no-wrap"
              >
                <gadget-manager
                  ref="RevenueTodayGadgetRef"
                  startComponent="RevenueTodayGadget"
                  :disable-gadget="yearMonth !== $store.getters['auth/currentYearMonth']"
                  :loading="teamHeaderStatus === 'loading'"
                  :no-data="teamHeaderStatus === 'no-data'"
                  :startProps="{
                    'extern-loading': true,
                    'exern-no-data': true
                  }"
                />
                <gadget-manager
                  ref="RevenueGadgetRef"
                  startComponent="RevenueGadget"
                  :loading="teamHeaderStatus === 'loading'"
                  :no-data="teamHeaderStatus === 'no-data'"
                  :startProps="{
                    'extern-loading': true,
                    'extern-no-data': true
                  }"
                />
                <gadget-manager
                  ref="RevenueMaxMinGadgetRef"
                  startComponent="RevenueMaxMinGadget"
                  :loading="teamHeaderStatus === 'loading'"
                  :no-data="teamHeaderStatus === 'no-data'"
                  :startProps="{
                    'extern-loading': true,
                    'extern-no-data': true
                  }"
                />
                <gadget-manager
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
        </div>

        <div
          class="row justify-center q-mt-xs"
        >
          <div
            class="col-12 col-md-6 col-lg-5 q-pa-xs"
          >
            <chart-manager
              startComponent="RevenueDailyChart"
              ref="RevenueDailyChartRef"
              :loading="teamHeaderStatus === 'loading'"
              :startProps="{
                'extern-loading': false,
                'extern-no-data': true
              }"
            />
          </div>
          <div
            v-if="teamHeader?.type === 'team'"
            class="col-12 col-md-6 col-lg-5 q-pa-xs"
          >
            <chart-manager
              startComponent="RevenueResumeChart"
              ref="RevenueResumeChartRef"
              :loading="teamHeaderStatus === 'loading'"
              :startProps="{
                'extern-loading': false,
                'extern-no-data': true
              }"
            />
          </div>
        </div>
      </div>
    </transition>
    <global-dialogs />
  </q-page>
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import { UseRevenuePage } from 'src/pages/Revenue/UseRevenuePage'
import GadgetManager from 'components/GadgetManager.vue'
import RevenueRankingGadget from 'src/components/sales/gadgets/RevenueRankingGadget.vue'
import ChartSkeletonLoading from 'src/components/sales/charts/ChartSkeletonLoading.vue'
import GadgetSkeletonLoading from 'src/components/sales/gadgets/GadgetSkeletonLoading.vue'
import RevenueLoading from 'src/pages/Revenue/RevenueLoading.vue'
import { emitter } from 'src/events'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import RevenueHeader from './RevenueHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import GlobalDialogs from 'src/components/GlobalDialogs.vue'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { nextTick, defineComponent, ref, Ref, watch, onMounted } from 'vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'

export default defineComponent({
  components: {
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
    const { yearMonth } = useYearMonthDropdown()
    const { team: teamHeader, status: teamHeaderStatus, updateSelected } = useTeamDropdown(false)
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
              'extern-loading': false
            }
          })
          if (teamHeader.value?.type === 'team') {
            RevenueResumeChartRef.value?.newState({
              component: 'RevenueResumeChart',
              props: {
                code: teamHeader.value?.code,
                yearMonth: yearMonth.value,
                type: teamHeader.value?.type
              }
            })
            RevenueRankingGadgetRef.value?.onNewState({
              code: teamHeader.value?.code,
              yearMonth: yearMonth.value
            })
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

    updateSelected.value = (status) => {
      update(status)
    }

    const updateIfSeller = () => user.value?.fgFuncao === 1 ? update('loaded') : false
    watch(yearMonth, () => updateIfSeller())
    onMounted(() => updateIfSeller())

    return {
      teamHeaderStatus,
      charts: useRevenuePage.charts,
      gadgets: useRevenuePage.gadgets,
      RevenueResumeChartRef,
      RevenueDailyChartRef,
      RevenueMaxMinGadgetRef,
      RevenueGadgetRef,
      RevenueRankingGadgetRef,
      RevenueTodayGadgetRef,
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
