<template>
  <div
    :style="`position: relative; padding-top: ${paddingTop}%`"
  >
    <div
      class="full-width full-height"
      style="position: absolute; top: 0;"
    >
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title
          class="text-weight-light text-subtitle2"
        >
          Carregando...
        </q-toolbar-title>
      </q-toolbar>
      <q-skeleton
        class="full-height"
        square
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    paddingTop: {
      type: Number,
      default: 64
    }
  }
})

</script>
