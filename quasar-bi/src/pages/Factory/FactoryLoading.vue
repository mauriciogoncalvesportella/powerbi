<template>
  <div
    class="row justify-center q-mt-md q-col-gutter-sm"
  >
    <div
      class="col-12 col-md-5 col-lg-4"
    >
      <chart-skeleton-loading />
    </div>
    <div
      v-if="user.fgFuncao > 1"
      class="col-12 col-md-5 col-lg-4"
    >
      <chart-skeleton-loading />
    </div>
    <div
      :class="`col-12 col-md-7 col-lg-7 ${user.fgFuncao > 1 ? 'q-mt-xl' : ''}`"
    >
      <chart-skeleton-loading />
    </div>
  </div>
</template>

<script lang="ts">
import ChartSkeletonLoading from 'src/components/sales/charts/ChartSkeletonLoading.vue'
import { useAuth } from 'src/reactive/UseAuth'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    ChartSkeletonLoading
  },
  setup: () => ({
    teamHeader: useTeamDropdown().team,
    user: useAuth().user
  })
})
</script>
