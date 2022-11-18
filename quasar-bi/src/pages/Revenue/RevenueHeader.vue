<template>
  <div
    class="row q-pa-sm full-width justify-center q-gutter-sm"
  >
    <div
      class="col-12 col-sm-5 col-md-3 col-lg-2"
    >
      <year-month-dropdown />
    </div>
    <div
      class="col-12 col-sm-5 col-md-3 col-lg-2"
    >
      <year-month-dropdown />
    </div>
  </div>
</template>

<script lang="ts">
import YearMonthDropdown from 'src/components/YearMonthDropdown.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { YearMonthDropdown },
  setup: () => ({
    onItemClick: () => {
      console.log('on item click')
    }
  })
})
</script>
