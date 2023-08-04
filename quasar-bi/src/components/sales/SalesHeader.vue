<template>
  <div
    :class="`row q-pa-sm full-width q-gutter-sm ${$q.screen.lt.sm ? 'justify-end' : 'justify-center'}`"
  >
    <div
      v-show="showYearMonth"
      class="col-12 col-md-3 col-lg-2"
    >
      <year-month-dropdown
        id="yearMonthDropdownComponent"
      />
    </div>
    <div
      v-show="showTeam"
      class="col-12 col-md-3 col-lg-2"
    >
      <team-dropdown />
    </div>
    <slot />
    <!--div
      class="col-shrink"
    >
      <q-btn
        push
        color="primary"
        icon="search"
        style="max-width: 70px"
      />
    </div-->
  </div>
</template>

<script lang="ts">
import YearMonthDropdown from 'src/components/YearMonthDropdown.vue'
import { useTeamDropdown } from 'src/reactive/TeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import { defineComponent, ref } from 'vue'
import TeamDropdown from 'src/components/sales/TeamDropdown.vue'

export default defineComponent({
  components: { YearMonthDropdown, TeamDropdown },
  props: {
    showYearMonth: {
      type: Boolean,
      default: true
    },
    showTeam: {
      type: Boolean,
      default: true
    }
  },

  setup () {
    const yearMonthDropdownComponent = ref(null as any)
    const yearMonth = ref('' as string)
    const { selected: teamDropdownSelected } = useTeamDropdown()
    const dropdownValue = ref({} as any)
    const { user } = useAuth()

    return {
      user,
      yearMonthDropdownComponent,
      teamDropdownSelected,
      dropdownValue,
      yearMonth,
      onDropdownReady: () => {
        //
      }
    }
  }
})
</script>
