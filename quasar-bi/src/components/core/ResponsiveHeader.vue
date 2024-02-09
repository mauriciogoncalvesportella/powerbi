<template>
  <q-header
    v-if="$q.screen.gt.sm"
  >
    <div
      class="bg-grey-4 full-width row items-center justify-center"
      style="height: 64px"
    >
      <q-btn
        v-show="$q.screen.lt.md"
        flat
        dense
        icon="menu"
        class="absolute-left q-pa-md"
        @click="toggleLeftDrawer()"
      />
      <slot />
    </div>
  </q-header>

  <q-header v-else>
    <q-toolbar
      class="bg-primary"
    >
      <q-btn
        flat
        round
        dense
        icon="menu"
        @click="toggleLeftDrawer()"
      />
      <q-space />
      <q-btn
        round
        flat
        :icon="toolbarInsetVisible ? 'expand_less' : 'expand_more'"
        @click="toolbarInsetVisible = !toolbarInsetVisible"
      />
    </q-toolbar>
    <q-slide-transition>
      <div
        v-show="toolbarInsetVisible"
        class="collumn bg-grey-4 q-gutter-sm q-pa-sm"
      >
        <slot />
      </div>
    </q-slide-transition>
  </q-header>
</template>

<script lang="ts">
import { emitter } from 'src/events'
import { useTeamDropdown } from 'src/reactive/TeamDropdown'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  setup () {
    const toolbarInsetVisible = ref(false)
    const { yearMonth } = useYearMonthDropdown()
    const { teamHeader } = useTeamDropdown()

    watch(yearMonth, () => { toolbarInsetVisible.value = false })
    watch(teamHeader, () => { toolbarInsetVisible.value = false })

    function toggleLeftDrawer () {
      emitter.emit('toggleLeftDrawer')
    }

    return {
      toolbarInsetVisible,
      toggleLeftDrawer
    }
  }
})
</script>
