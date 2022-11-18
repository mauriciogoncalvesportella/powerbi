<template>
  <q-card
    square
  >
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        class="text-weight-light text-subtitle2"
      >
        {{ title }}
      </q-toolbar-title>

      <div
        class="q-gutter-sm"
      >
        <q-btn
          dense
          round
          icon="arrow_back"
          :flat="stateCount <= 0"
          :disable="stateCount <= 0"
          @click="$emit('back-state')"
        />

        <q-btn
          round
          dense
          icon="more_vert"
          :flat="filterDisabled"
          :disable="filterDisabled"
        >
          <q-menu
            transition-show="jump-down"
            transition-hide="jump-up"
            auto-close
          >
            <q-list
              style="min-width: 100px"
            >
              <slot
                name="filter"
              />
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
    <div
      style="position: relative; padding-top: 64%"
    >
      <div
        class="full-width full-height "
        style="position: absolute; top: 0"
      >
        <q-inner-loading
          v-if="loading"
          :showing="true"
        >
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <div
          v-else-if="error"
          class="error full-width full-height"
        >
          <div
            class="row full-width full-height justify-center items-center no-data-inside"
          >
            <q-icon
              name="error"
              size="xl"
              color="negative"
            />
            <span
              class="text-weight-thin text-h6"
            >
              {{ error }}
            </span>
          </div>
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

        <apexchart
          v-else-if="loaded"
          ref="apexchart"
          :options="apexOptions"
          :series="apexSeries"
          @mounted="apexChartMounted"
          @click="click"
        />
      </div>
      <div
        v-show="!loading"
        style="position: absolute; top: -15px"
        class="q-px-sm full-width"
      >
        <slot
          name="header"
        />
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component'

class Props {
  readonly title!: string;
  readonly subTitle?: string;
  readonly apexOptions!: any;
  readonly apexSeries!: any;
  readonly loading = prop<boolean>({ default: false })
  readonly noData = prop<boolean>({ default: false })
  readonly error = prop<string>({ default: '' })
  readonly stateCount = prop<number>({ default: 0 })
  readonly filterDisabled = prop<boolean>({ default: false })
  readonly height = prop<number>({ default: -1 })
}

export default class BaseChart extends Vue.with(Props) {
  nextMenu = false
  loaded = false

  get ApexComponent () {
    return this.$refs?.apexchart
  }

  apexChartMounted () {
    this.$emit('apexchart-mounted')
  }

  click (event: any, chartContext: any, config: any) {
    if (config.dataPointIndex > -1) {
      this.$emit('data-point-selection', event, chartContext, config)
    }
  }

  mounted () {
    this.loaded = true
  }
}
</script>

<style lang="sass">
.no-data
  position: relative
  overflow: hidden
  background: linear-gradient(white 30%, $light-blue-1 65%)

.error
  position: relative
  overflow: hidden
  background: linear-gradient(white 30%, $red-1 65%)

.no-data-inside
  position: absolute
  top: 0
  left: 0
</style>
