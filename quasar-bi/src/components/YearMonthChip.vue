<template>
  <q-chip
    size="11.5px"
    icon="event"
    :label="label"
    @click="click"
  >
    <q-menu>
      <q-list
        dense
        style="min-width: 100px"
      >
        <template
          v-for="(dt, index) in dates"
          :key="`item-${index}`"
        >
          <div>
            <q-item
              clickable
              dense
              v-close-popup
              class="text-caption"
              :disable="format(dt) === format(this.date)"
              @click="click(dt)"
            >
              <q-item-section>
                {{ formatMonth(dt) }}
              </q-item-section>
              <q-item-section
                avatar
                class="q-pa-0"
              >
                {{ formatYear(dt) }}
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
      </q-list>
    </q-menu>
  </q-chip>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

class Props {
  readonly yearMonth= prop<string>({ default: () => format(new Date(), 'yyyy-MM') });
  readonly stateCount = prop<number>({ default: 0 })
  readonly commit = prop<string>({ default: null })
}

@Options({})
export default class YearMonthChip extends Vue.with(Props) {
  dates: Date[] = []

  get label () {
    return this.format(new Date(`${this.yearMonth}-01 00:00`))
  }

  get date () {
    return new Date(`${this.yearMonth}-01 00:00`)
  }

  format (date: Date) {
    return format(date, 'MMMM - yyyy', { locale: ptBR })
  }

  formatYear (date: Date) {
    return format(date, 'yyyy')
  }

  formatMonth (date: Date) {
    return format(date, 'MMMM', { locale: ptBR })
  }

  created () {
    const currentYearMonth = this.$store.getters['auth/currentYearMonth']
    let dateIterator = new Date(`${currentYearMonth}-01 00:00`)
    for (let i = 0; i < 6; i++) {
      this.dates.push(dateIterator)
      dateIterator = addMonths(dateIterator, -1)
    }
  }

  click (dt: Date) {
    if (this.format(dt) !== this.format(this.date)) {
      const yearMonth = format(dt, 'yyyy-MM')
      this.$emit('YearMonthClick', yearMonth)
      if (this.commit) {
        this.$store.commit(this.commit, yearMonth)
      }
    }
  }
}
</script>
