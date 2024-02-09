<template>
  <q-btn-dropdown
    color="primary"
    class="full-width"
  >
    <template
      v-slot:label
    >
      <q-chip outline color="white" dense square>
        {{ labels.dataMode }}
      </q-chip>

      <q-chip outline color="white" dense square>
        {{ labels.iterationMode }}
      </q-chip>

      <q-chip outline color="white" dense square>
        {{ labels.frequency }}
      </q-chip>

      <q-chip outline color="white" dense square>
        {{ labels.iterations }}
      </q-chip>
    </template>
    <div
      class="column q-pa-sm q-gutter-sm"
    >
      <div
        v-if="user?.fgFuncao != 1"
        class="column bg-grey-2 rounded-borders"
      >
        <span class="q-ml-sm q-mt-xs"> Informação </span>
        <q-btn-toggle
          v-model="headerModels.dataMode"
          toggle-color="primary"
          class="q-pa-xs"
          dense
          spread
          flat
          :options="dataModeOptions"
        />
      </div>

      <div class="column bg-grey-2 rounded-borders">
        <span class="q-ml-sm q-mt-xs"> Iteração </span>
        <q-btn-toggle
          v-model="headerModels.iterationMode"
          toggle-color="primary"
          class="q-pa-xs"
          dense
          spread
          flat
          :options="iterationModeOptions"
        />
      </div>

      <div class="column bg-grey-2 rounded-borders">
        <span class="q-ml-sm q-mt-xs"> Base </span>
        <q-btn-toggle
          v-model="headerModels.frequency"
          toggle-color="primary"
          class="q-pa-xs text-caption "
          flat
          dense
          spread
          :options="frequencyOptions"
        />
      </div>

      <div class="column bg-grey-2 rounded-borders">
        <span class="q-ml-sm q-mt-xs"> Comparações </span>
        <q-btn-toggle
          v-model="headerModels.iterations"
          toggle-color="primary"
          class="q-pa-xs"
          flat
          dense
          spread
          :options="iterationOptions"
        />
      </div>
    </div>
  </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useComparative } from 'src/reactive/UseComparative'
import { useAuth } from 'src/reactive/UseAuth'

export default defineComponent({
  setup () {
    const { user } = useAuth()
    const { labels, headerModels, dataModeOptions, frequencyOptions, iterationModeOptions, iterationOptions } = useComparative()

    return {
      labels,
      headerModels,
      dataModeOptions,
      frequencyOptions,
      iterationModeOptions,
      iterationOptions,
      user
    }
  }
})
</script>
