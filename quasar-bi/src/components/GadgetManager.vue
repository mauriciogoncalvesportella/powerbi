<template>
  <div>
    <component
      v-show="!loading && !disableGadget"
      ref="gadgetRef"
      :is="startComponent"
      v-bind="props"
      @next-state-year-month="onNextStateYearMonth($event)"
      @next-state-team="onNextStateTeam($event)"
    />
    <gadget-skeleton-loading
      v-show="loading"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick } from 'vue'
import RevenueGadget from 'src/components/sales/gadgets/RevenueGadget.vue'
import RevenueRankingGadget from 'src/components/sales/gadgets/RevenueRankingGadget.vue'
import RevenueMaxMinGadget from 'src/components/sales/gadgets/RevenueMaxMinGadget.vue'
import RevenueTodayGadget from 'src/components/sales/gadgets/RevenueTodayGadget.vue'
import GadgetSkeletonLoading from './sales/gadgets/GadgetSkeletonLoading.vue'

export default defineComponent({
  components: {
    GadgetSkeletonLoading,
    RevenueGadget,
    RevenueRankingGadget,
    RevenueMaxMinGadget,
    RevenueTodayGadget
  },

  props: {
    startComponent: {
      type: String,
      required: true
    },
    startProps: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    noData: {
      type: Boolean,
      default: false
    },
    disableGadget: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const componentProps = ref(props.startProps as any)
    const gadgetRef = ref(null as any)

    const onNextStateYearMonth = (yearMonth: string) => {
      componentProps.value.yearMonth = yearMonth
      nextTick(() => gadgetRef?.value?.updateProps())
    }

    const onNextStateTeam = (team: any) => {
      componentProps.value.type = team.type
      componentProps.value.cd = team.code
      nextTick(() => gadgetRef?.value?.updateProps())
    }

    const onNewState = (state: any) => {
      componentProps.value = state
      nextTick(() => gadgetRef?.value?.updateProps())
    }

    const setState = (state: any) => {
      componentProps.value = state
    }

    const setLoading = (value: boolean) => {
      gadgetRef.value.loading = value
    }

    return {
      gadgetRef,
      onNextStateTeam,
      onNextStateYearMonth,
      onNewState,
      setState,
      setLoading,
      props: computed(() => componentProps.value)
    }
  }
})
</script>
