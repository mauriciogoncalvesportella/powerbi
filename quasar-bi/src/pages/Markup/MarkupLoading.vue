<template>
  <div
    class="row justify-center q-mt-md q-col-gutter-sm"
  >
    <div
      class="col-12 col-md-5 col-lg-5"
    >
      <chart-skeleton-loading />
    </div>
    <div
      class="col-12 col-md-5 col-lg-5"
    >
      <chart-skeleton-loading />
    </div>
  </div>
</template>

<script lang="ts">
import ChartSkeletonLoading from 'components/sales/charts/ChartSkeletonLoading.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    ChartSkeletonLoading
  }
})
</script>
