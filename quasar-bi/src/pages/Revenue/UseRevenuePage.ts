import { ref, Ref } from 'vue'

const gadgetsComponents: Ref<Array<any>> = ref([])

const charts = ref([
  {
    component: null as any,
    ref: 'RevenueDailyChartRef',
    startComponent: 'RevenueDailyChart',
    props: {
      codes: [] as any[],
      accumulated: false,
      type: 'seller',
      yearMonth: '1998-07'
    }
  },
  {
    component: null as any,
    ref: 'RevenueResumeChartRef',
    startComponent: 'RevenueResumeChart',
    props: {
      code: undefined,
      type: 'seller',
      yearMonth: '1998-07'
    }
  }
])

const gadgets = ref([
  {
    component: null as any,
    ref: 'RevenueTodayGadgetRef',
    startComponent: 'RevenueTodayGadget',
    startProps: {
      code: null,
      type: 'seller'
    }
  },
  {
    component: null as any,
    ref: 'RevenueGadgetRef',
    startComponent: 'RevenueGadget',
    startProps: {
      code: null,
      type: 'seller',
      yearMonth: '1998-07'
    }
  },
  {
    component: null as any,
    ref: 'RevenueRankingGadgetRef',
    startComponent: 'RevenueRankingGadget',
    startProps: {
      code: null,
      yearMonth: '1998-07'
    }
  },
  {
    component: null as any,
    ref: 'RevenueMaxMinGadgetRef',
    startComponent: 'RevenueMaxMinGadget',
    startProps: {
      code: null,
      yearMonth: '1998-07',
      type: 'seller'
    }
  }
])

const chartStartPros = (teamHeader: any, yearMonth: string, components: any[]) => {
  for (let i = 0; i < components.length; i++) {
    charts.value[i].component = components[i]
    charts.value[i].props = {
      accumulated: false,
      codes: [teamHeader.code],
      type: teamHeader.type,
      yearMonth
    }
    charts.value[i].component?.newState({
      component: charts.value[i].startComponent,
      props: {
        ...charts.value[i].props
      }
    })
  }
}

const gadgetStartProps = (teamHeader: any, yearMonth: string, components: any[]) => {
  for (let i = 0; i < components.length; i++) {
    gadgets.value[i].component = components[i]
    gadgets.value[i].startProps = {
      code: teamHeader.code,
      type: teamHeader.type,
      yearMonth
    }
    gadgets.value[i].component?.onNewState(gadgets.value[i].startProps)
  }
}

const gadgetNewState = (teamHeader: any, yearMonth: string) => {
  for (const gadget of gadgets.value) {
    gadget.component?.onNewState({
      ...gadget.startProps,
      code: teamHeader.code,
      type: teamHeader.type,
      yearMonth
    })
  }
}

const chartNewState = (teamHeader: any, yearMonth: string) => {
  for (let i = 0; i < charts.value.length; i++) {
    charts.value[i].component?.newState({
      component: 'RevenueDailyChart',
      props: {
        ...charts.value[i].props,
        yearMonth: yearMonth,
        codes: [teamHeader.code],
        type: teamHeader.type
      }
    })
  }
}

export function UseRevenuePage () {
  return {
    charts,
    chartNewState,
    gadgetNewState,
    gadgetsComponents,
    gadgets,
    gadgetStartProps,
    chartStartPros
  }
}
