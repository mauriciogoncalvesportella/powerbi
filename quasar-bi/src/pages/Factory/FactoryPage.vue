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
            :menu="menu"
            :code="FactoryResumeChartProps.code"
            :type="FactoryResumeChartProps.type"
            :yearMonth="FactoryResumeChartProps.yearMonth"
            :externNoData="FactoryResumeChartProps.externNoData"
            @data-select="onDataSelectResumeChart"
          />
        </div>
        <div
          v-if="teamHeader?.type === 'team'"
          class="col-12 col-md-5 col-lg-4"
        >
          <chart-manager
            ref="FactoryResumeTeamChartRef"
            startComponent="FactoryResumeTeamChart"
            :startProps="{
              externNoData: true
            }"
            @data-select="onDataSelectFactoryResumeTeamChart"
          />
        </div>
        <div
          class="col-12 col-md-7 col-lg-7"
        >
          <factory-product-resume-chart
            ref="FactoryProductResumeChartRef"
            :menu="menu"
            :code="FactoryProductResumeChartProps.code"
            :type="FactoryProductResumeChartProps.type"
            :year-month="FactoryProductResumeChartProps.yearMonth"
            :team-props="FactoryProductResumeChartProps.teamProps"
            :externNoData="FactoryProductResumeChartProps.externNoData"
            :factory-props="FactoryProductResumeChartProps.factoryProps"
          />
        </div>
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
import { defineComponent, computed, ref, Ref, nextTick, watch, onMounted, PropType } from 'vue'
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

  props: {
    menu: { type: String as PropType<'factory' | 'category'>, default: 'factory' }
  },

  setup (props) {
    const FactoryResumeTeamChartRef: Ref<any> = ref(null)
    const FactoryResumeChartRef: Ref<any> = ref(null)
    const FactoryResumeChartProps: Ref<any> = ref({
      menu: props.menu,
      code: undefined,
      type: undefined,
      externLoading: true,
      externNoData: false
    })
    const FactoryProductResumeChartRef: Ref<any> = ref(null)
    const FactoryProductResumeChartProps: Ref<any> = ref({
      menu: props.menu,
      code: undefined,
      type: undefined,
      yearMonth: undefined,
      teamProps: undefined,
      factoryProps: undefined,
      externLoading: true,
      externNoData: false
    })

    const refFactoryProduct: Ref<any> = ref(null)
    const { factoryProps, teamProps, setTeamProps, setFactoryProps } = useFactory()
    const { team: teamHeader, updateSelected, status: teamHeaderStatus } = useTeamDropdown(false)
    const { yearMonth } = useYearMonthDropdown()
    const { user } = useAuth()

    setTeamProps(-1, '', 'team')

    const update = (status: string) => {
      if (status === 'loaded') {
        if (teamHeader.value) {
          const { code, type, label } = teamHeader.value
          setTeamProps(code, label, type as 'seller' | 'team')
        }
        FactoryResumeChartProps.value = {
          menu: props.menu,
          code: teamHeader.value?.code,
          type: teamHeader.value?.type,
          yearMonth: yearMonth.value,
          externNoData: false,
          externLoading: false
        }
      } else {
        FactoryProductResumeChartProps.value = { externNoData: true }
        nextTick(() => FactoryProductResumeChartRef.value?.plot())
        FactoryResumeChartProps.value = { externNoData: true }
      }

      nextTick(() => {
        FactoryResumeChartRef.value?.updateProps()
      })
    }

    updateSelected.value = (status) => update(status)
    const updateIfSeller = () => user.value?.fgFuncao === 1 ? update('loaded') : 0
    onMounted(() => updateIfSeller())
    watch(yearMonth, () => updateIfSeller())

    const onDataSelectResumeChart = ({ code, label }: any) => {
      setFactoryProps(code, label)
      if (teamHeader.value) {
        setTeamProps(teamHeader.value.code, teamHeader.value?.label, teamHeader.value?.type as 'seller' | 'team')
      }
      if (teamHeader.value?.type === 'team') {
        FactoryResumeTeamChartRef.value.newState({
          component: 'FactoryResumeTeamChart',
          props: {
            menu: props.menu,
            code: teamHeader.value?.code,
            yearMonth: yearMonth.value,
            externLoading: false,
            externNoData: false,
            factoryProps: {
              code: factoryProps.value.code,
              label: factoryProps.value.label
            }
          }
        })
      }

      FactoryProductResumeChartProps.value = {
        menu: props.menu,
        code: teamHeader.value?.code,
        type: teamHeader.value?.type,
        teamProps: teamProps.value,
        factoryProps: factoryProps.value,
        yearMonth: yearMonth.value,
        externLoading: false,
        externNoData: false
      }
      nextTick(() => FactoryProductResumeChartRef.value.plot())
    }

    const onDataSelectFactoryResumeTeamChart = ({ code, label, type }: any) => {
      setTeamProps(code, label, type)
      FactoryProductResumeChartProps.value = {
        menu: props.menu,
        code,
        type,
        teamProps: teamProps.value,
        yearMonth: yearMonth.value,
        factoryProps: factoryProps.value,
        externLoading: false,
        externNoData: false
      }
      nextTick(() => FactoryProductResumeChartRef.value.plot())
    }

    watch(props, () => update('loaded'))

    return {
      FactoryProductResumeChartRef,
      FactoryProductResumeChartProps,
      FactoryResumeChartProps,
      FactoryResumeChartRef,
      FactoryResumeTeamChartRef,
      teamHeaderStatus,
      onDataSelectResumeChart,
      onDataSelectFactoryResumeTeamChart,
      teamProps,
      refFactoryProduct,
      teamHeader,
      yearMonth,
      factoryProps,
      loading: computed(() => !teamHeader.value || !yearMonth.value)
    }
  }
})
</script>
