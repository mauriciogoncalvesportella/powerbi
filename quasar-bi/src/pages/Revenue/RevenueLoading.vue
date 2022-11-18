<template>
  <div
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
            <gadget-skeleton-loading />
            <gadget-skeleton-loading />
            <gadget-skeleton-loading
              v-if="user.fgFuncao > 1"
            />
          </div>
        </q-scroll-area>
      </div>
    </div>

    <div
      class="row justify-center q-mt-xs"
    >
      <div
        class="col-12 col-md-5 col-lg-5 q-pa-xs"
      >
        <chart-skeleton-loading />
      </div>
      <div
        class="col-12 col-md-5 col-lg-5 q-pa-xs"
      >
        <chart-skeleton-loading />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ChartSkeletonLoading from 'src/components/sales/charts/ChartSkeletonLoading.vue'
import GadgetSkeletonLoading from 'src/components/sales/gadgets/GadgetSkeletonLoading.vue'
import { useAuth } from 'src/reactive/UseAuth'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    ChartSkeletonLoading,
    GadgetSkeletonLoading
  },

  setup () {
    const { user } = useAuth()
    return {
      user
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
