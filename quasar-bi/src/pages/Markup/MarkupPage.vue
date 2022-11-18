<template>
  <q-page
    class="collumn full-width q-pb-lg"
  >
    <responsive-header>
      <sales-header />
    </responsive-header>
    <markup-loading
      v-if="teamHeaderStatus === 'loading'"
    />
    <transition
      appear
      enter-active-class="animated fadeIn"
    >
      <div
        v-show="teamHeaderStatus !== 'loading'"
        class="row justify-center q-mt-md q-col-gutter-sm"
      >
        <div
          class="col-12 col-md-5 col-lg-5"
        >
          <chart-manager
            ref="MarkupDailyBarsRef"
            startComponent="MarkupDailyBars"
            :loading="teamHeaderStatus === 'loading'"
            :startProps="{
              'extern-no-data': true
            }"
          />
        </div>
        <div
          v-if="teamHeader?.type === 'team'"
          class="col-12 col-md-5 col-lg-5"
        >
          <chart-manager
            ref="MarkupResumeBarsRef"
            startComponent="MarkupResumeBars"
            :loading="teamHeaderStatus === 'loading'"
            :startProps="{
              'extern-no-data': true
            }"
          />
        </div>
      </div>
    </transition>
  </q-page>
</template>

<script lang="ts">
import ChartManager from 'components/ChartManager.vue'
import ResponsiveHeader from 'src/components/core/ResponsiveHeader.vue'
import SalesHeader from 'src/components/sales/SalesHeader.vue'
import MarkupLoading from 'src/pages/Markup/MarkupLoading.vue'
import { useAuth } from 'src/reactive/UseAuth'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
// import { useAuth } from 'src/reactive/UseAuth'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { watch, defineComponent, ref, Ref, nextTick, onMounted } from 'vue'

export default defineComponent({
  components: {
    MarkupLoading,
    ChartManager,
    ResponsiveHeader,
    SalesHeader
  },

  setup () {
    const { user } = useAuth()
    const { yearMonth } = useYearMonthDropdown()
    const { team: teamHeader, status: teamHeaderStatus, updateSelected } = useTeamDropdown(false)
    // const { user } = useAuth()

    /* Charts */
    const MarkupDailyBarsRef: Ref<any> = ref(null)
    const MarkupResumeBarsRef: Ref<any> = ref(null)

    const update = (status: string) => {
      nextTick(() => {
        if (status === 'loaded') {
          MarkupDailyBarsRef.value?.newState({
            component: 'MarkupDailyBars',
            props: {
              code: teamHeader.value?.code,
              type: teamHeader.value?.type,
              yearMonth: yearMonth.value,
              cumulative: false
            }
          })
          MarkupResumeBarsRef.value?.newState({
            component: 'MarkupResumeBars',
            props: {
              teamCode: teamHeader.value?.code,
              yearMonth: yearMonth.value
            }
          })
        } else {
          MarkupDailyBarsRef.value?.newState({ component: 'MarkupDailyBars', props: { 'extern-no-data': true } })
          MarkupResumeBarsRef.value?.newState({ component: 'MarkupResumeBars', props: { 'extern-no-data': true } })
        }
      })
    }

    const updateIfSeller = () => {
      if (user.value?.fgFuncao === 1) {
        update('loaded')
      }
    }

    updateSelected.value = (status) => update(status)
    watch(yearMonth, () => updateIfSeller())
    onMounted(() => updateIfSeller())

    return {
      MarkupDailyBarsRef,
      MarkupResumeBarsRef,
      teamHeader,
      yearMonth,
      teamHeaderStatus
    }
  }
})
/*
@Options({
  components: {
    ChartManager,
    ResponsiveHeader,
    SalesHeader
  }
})
export default class MarkupPage extends Vue {
  yearMonth?: string
  loading = true

  mounted () {
    this.yearMonth = this.$store.getters['auth/currentYearMonth']
    this.refresh()
  }

  async refresh () {
    try {
      this.loading = true
      await Promise.all([
        this.$store.dispatch('sales/getEquipeTree'),
        this.$store.dispatch('sales/getTeams'),
        this.$store.dispatch('sales/getSellers')
      ])
    } finally {
      this.loading = false
    }
  }
}
*/

</script>
