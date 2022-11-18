<template>
  <q-btn-dropdown
    split
    push
    color="primary"
    :label="labels[sortIndex]"
    :icon="icon"
    @click="toggleSortOption"
  >
    <q-list>
      <q-item
        v-for="(label, index) in labels"
        :key="index"
        v-close-popup
        clickable
        :active="index == sortIndex"
        @click="setSort(index)"
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
import { defineComponent, computed } from 'vue'
export default defineComponent({
  setup () {
    const {
      sortIndex,
      sortOptionIndex,
      toggleSortOption,
      setSort,
      sortOptions
    } = useLinearity()

    return {
      sortIndex,
      toggleSortOption,
      setSort,
      sortOptions,
      icon: computed(() => sortOptionIndex.value === 0 ? 'arrow_upward' : 'arrow_downward'),
      labels: computed(() => ['Cliente', 'Faturamento'])
    }
  }
})
</script>
