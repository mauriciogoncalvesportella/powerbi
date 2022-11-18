<template>
  <q-btn-dropdown
    color="primary"
    class="full-width"
    push
  >
    <template v-slot:label>
      <div
        class="row full-width"
      >
        {{ getLabel(countFilter) }}
        <q-space />
      </div>
    </template>
    <q-list>
      <q-item
        v-for="(label, index) in labels"
        :key="index"
        v-close-popup
        clickable
        :active="index == countFilter"
        @click="onItemClick(index)"
      >
        <q-item-section>
          <q-item-label>
            {{ label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts">
import { useLinearity } from 'src/reactive/UseLinearity'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const { countFilter, setCountFilter, labels } = useLinearity()

    const getLabel = (count: number): string => {
      return labels.value[count] ?? 'Regularidade'
    }

    const onItemClick = (index: number) => {
      if (countFilter.value === index) {
        setCountFilter(-1)
      } else {
        setCountFilter(index)
      }
    }

    return {
      labels,
      countFilter,
      setCountFilter,
      getLabel,
      onItemClick
    }
  }
})
</script>
