<template>
  <div>
    <div
      class="row justify-center"
    >
      <div
        class="col-12 col-md-5 q-pa-xs"
        style="max-width: 600px"
      >
        <chart-skeleton-loading />
      </div>
      <div
        class="col-12 col-md-5 q-pa-xs"
        style="max-width: 600px"
      >
        <chart-skeleton-loading />
      </div>
    </div>
    <div
      class="row justify-center q-mt-xl"
    >
      <div
        class="col-12 col-lg-10 col-xl-8 q-pa-xs"
      >
        <chart-skeleton-loading />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChartSkeletonLoading from 'src/components/sales/charts/ChartSkeletonLoading.vue'

export default defineComponent({
  components: {
    ChartSkeletonLoading
  }
})
</script>
