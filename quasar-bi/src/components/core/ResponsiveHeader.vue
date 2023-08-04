<template>
  <q-header
    class="bg-grey-4 text-black"
  >
    <div
      class="text-black"
    >
      <template v-if="!$q.screen.lt.md">
        <div
          class="row justify-center items-center q-mx-sm"
          style="height: 64px"
        >
          <q-btn
            v-show="$q.platform.is.mobile || $q.screen.lt.md"
            flat
            dense
            icon="menu"
            class="absolute-left q-pa-md"
            @click="toggleLeftDrawer()"
          />
          <slot />
        </div>
      </template>
      <template v-else>
        <q-toolbar
          class="transparent lt-md"
        >
          <q-btn
            flat
            round
            dense
            icon="menu"
            class="lt-md"
            @click="toggleLeftDrawer()"
          />
          <q-space />
          <q-btn
            round
            flat
            class="lt-md"
            :icon="toolbarInsetVisible ? 'expand_less' : 'expand_more'"
            @click="toolbarInsetVisible = !toolbarInsetVisible"
          />
        </q-toolbar>
        <q-slide-transition>
          <div
            v-show="toolbarInsetVisible"
            class="absolute row justify-center full-width bg-grey-4 lt-md"
          >
            <slot />
          </div>
        </q-slide-transition>
      </template>
    </div>
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
