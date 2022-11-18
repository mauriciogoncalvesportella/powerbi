<template>
  <q-page
    class="q-pb-lg"
  >
    <responsive-header>
      <sales-header />
    </responsive-header>

    <factory-loading
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
          class="col-12 col-md-5 col-lg-4"
        >
          <factory-resume-chart
            ref="FactoryResumeChartRef"
            :code="factoryResumeChartProps.code"
            :type="factoryResumeChartProsp.type"
            :externNoData="true"
            @data-select="onDataSelectResumeChart"
          />
        </div>
        <!--div
          v-if="teamHeader.type === 'team'"
          class="col-12 col-md-5 col-lg-4"
        >
          <chart-manager
            ref="refChartManager"
            startComponent="FactoryResumeTeamChart"
            :startProps="{
              cd: teamHeader.cd,
              factoryProps: factoryProps,
              yearMonth: yearMonth,
            }"
            @data-select="onDataSelectResumeTeamChart"
          />
        </div>
        <div
          class="col-12 col-md-7 col-lg-7"
        >
          <factory-product-resume-chart
            ref="refFactoryProduct"
            :cd="teamProps.code"
            :type="teamProps.type"
            :team-props="teamProps"
            :factory-props="factoryProps"
          />
        </div-->
      </div>
    </transition>
  </q-page>
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import FactoryResumeChart from 'src/components/sales/charts/factory/FactoryResumeChart.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import FactoryLoading from 'src/pages/Factory/FactoryLoading.vue'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { useFactory } from 'src/reactive/UseFactory'
import { defineComponent, computed, ref, Ref, nextTick, watch } from 'vue'
import FactoryProductResumeChart from 'src/components/sales/charts/factory/FactoryProductResumeChart.vue'

export default defineComponent({
  components: {
    FactoryLoading,
    ResponsiveHeader,
    SalesHeader,
    ChartManager,
    FactoryProductResumeChart,
    FactoryResumeChart
  },

  setup () {
    const FactoryResumeChartRef: Ref<any> = ref(null)
    const FactoryResumeChartProps: Ref<any> = ref({
      code: undefined,
      type: undefined,
      externLoading: undefined,
      externNoData: true
    })

    const refFactoryProduct: Ref<any> = ref(null)
    const refChartManager: Ref<any> = ref(null)
    const { factoryProps, teamProps, setTeamProps, setFactoryProps } = useFactory()
    const { team: teamHeader, updateSelected, status: teamHeaderStatus } = useTeamDropdown(false)
    const { yearMonth } = useYearMonthDropdown()
    const { user } = useAuth()

    setTeamProps(-1, '', 'team')

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          FactoryResumeChartProps.value = {
            code: teamHeader.value?.code,
            type: teamHeader.value?.type,
            externNoData: false,
            externLoading: false
          }
          FactoryResumeChartRef.value?.updateProps()
        } else {
          FactoryResumeChartProps.value = { externNoData: true }
          FactoryResumeChartRef.value?.updateProps()
        }
      })
    }

    updateSelected.value = (status) => update(status)
    watch(yearMonth, () => {
      if (user.value?.fgFuncao === 1) {
        update('loaded')
      }
    })

    /*
    if (user.value?.fgResponsavel) {
      onMounted(() => {
        Promise.all([
          $store.dispatch('sales/getEquipeTree'),
          $store.dispatch('sales/getTeams'),
          $store.dispatch('sales/getSellers')
        ]).then(() => {
          if (teamHeader.value) {
            const { code, label, type } = teamHeader.value
            setTeamProps(code, label, type as 'seller' | 'team')
          }
        })
      })
    }
    */

    const onDataSelectResumeChart = ({ code, label }: any) => {
      setFactoryProps(code, label)
      if (teamHeader.value) {
        setTeamProps(teamHeader.value.code, teamHeader.value?.label, teamHeader.value?.type as 'seller' | 'team')
      }
      /*
      if (teamHeader.value?.type === 'team') {
        refChartManager.value.newState({
          component: 'FactoryResumeTeamChart',
          props: {
            code: teamHeader.value?.code,
            factoryProps: {
              code: factoryProps.value.code,
              label: factoryProps.value.label
            }
          }
        })
      }
      nextTick(() => refFactoryProduct.value.plot())
      */
    }

    const onDataSelectResumeTeamChart = ({ code, label, type }: any) => {
      setTeamProps(code, label, type)
      // nextTick(() => refFactoryProduct.value.plot())
    }

    watch(teamHeader, () => {
      if (teamHeader.value) {
        const { code, type, label } = teamHeader.value
        setTeamProps(code, label, type as 'seller' | 'team')
        // nextTick(() => refFactoryProduct.value.plot())
      }
    })

    return {
      FactoryResumeChartRef,
      teamHeaderStatus,
      onDataSelectResumeChart,
      onDataSelectResumeTeamChart,
      teamProps,
      refChartManager,
      refFactoryProduct,
      teamHeader,
      yearMonth,
      factoryProps,
      loading: computed(() => !teamHeader.value || !yearMonth.value)
    }
  }
})
</script>
