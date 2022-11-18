<template>
  <q-card
    class="card"
    :style="`width: ${width}px`"
  >
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        class="text-weight-light text-subtitle2"
      >
        Carregando...
      </q-toolbar-title>
    </q-toolbar>
    <q-skeleton
      height="210px"
      square
    />
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    width: {
      type: Number,
      default: 300
    }
  }
})

</script>
