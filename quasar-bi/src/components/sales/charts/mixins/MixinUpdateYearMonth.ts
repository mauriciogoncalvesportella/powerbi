import { emitter } from 'src/events'
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    updateYearMonthHeader: null as any
    // unsubscribe: null as any
  }),

  created () {
    this.updateYearMonthHeader = (yearMonth: string) => {
      this.$emit('NextStateYearMonth', yearMonth)
    }
    emitter.on('updateYearMonthHeader', this.updateYearMonthHeader)
    /*
    this.unsubscribe = this.$store.subscribe(mutation => {
      if (mutation.type === 'sales/setYearMonth') {
        this.$emit('NextStateYearMonth', mutation.payload)
      }
    })
    */
  },

  unmounted () {
    // this.unsubscribe()
    emitter.off('updateYearMonthHeader', this.updateYearMonthHeader)
  }
})
