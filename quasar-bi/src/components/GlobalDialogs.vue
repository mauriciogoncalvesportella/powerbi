<template>
  <div>
    <order-info-dialog
      ref="refOrderInfoDialog"
    />
  </div>
</template>

<script lang="ts">
import OrderInfoDialog from './sales/OrderInfoDialog.vue'
import { defineComponent, ref, watch, Ref } from 'vue'
import { GlobalOrderInfoDialog } from 'src/reactive/UseGlobalDialogs'

export default defineComponent({
  components: {
    OrderInfoDialog
  },

  setup () {
    const refOrderInfoDialog = ref(null) as Ref<any>

    watch(GlobalOrderInfoDialog.param, (param) => {
      refOrderInfoDialog.value?.open(param)
    })

    return {
      refOrderInfoDialog
    }
  }
})
</script>
