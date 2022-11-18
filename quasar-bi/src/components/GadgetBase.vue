<template>
  <q-card
    class="card"
    style="width: 300px"
  >
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        class="text-weight-light text-subtitle2"
      >
        {{ title }}
      </q-toolbar-title>
    </q-toolbar>

    <div
      style="position: relative; padding-top: 70%; overflow: hidden"
    >
      <div
        class="full-width full-height "
        style="position: absolute; top: 0;"
      >
        <q-inner-loading
          v-if="loading"
          showing
        >
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <div
          v-else-if="error"
          class="column error justify-center items-center"
        >
          <q-icon
            name="warning"
            color="negative"
            size="60px"
          />
          <span
            class="text-weight-light text-subtitle1 row items-center"
          >
            Erro
          </span>
        </div>

        <div
          v-else-if="noData"
          class="column no-data justify-center items-center full-width full-height"
        >
          <q-icon
            name="cloud_off"
            color="primary"
            size="60px"
          />
          <span
            class="text-weight-light text-subtitle1 row items-center"
          >
            Sem dados no intervalo
          </span>
        </div>

        <div
          v-else
          class="column q-pa-sm full-height"
        >
          <q-scroll-area
            v-if="$slots.header"
            style="height: 18px; position: absolute; top: 4px"
            class="full-width"
          >
            <div
              class="row q-gutter-x-sm no-wrap"
            >
              <slot name="header" />
            </div>
          </q-scroll-area>
          <slot />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: 'Faturamento mensal'
    },
    loading: {
      type: Boolean,
      required: true
    },
    noData: {
      type: Boolean,
      required: true
    },
    error: {
      type: Boolean,
      required: true
    }
  }
})
</script>

<style lang="sass">
.no-data
  background: linear-gradient(white 30%, $light-blue-1 65%)
  position: relative
  overflow: hidden

.error
  background: linear-gradient(white 30%, $red-1 65%)
  height: 248px
</style>
