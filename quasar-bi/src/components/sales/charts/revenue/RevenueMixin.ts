import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    unsubscribe: null as any
  }),

  created () {
    this.unsubscribe = this.$store.subscribe(mutation => {
      if (mutation.type === 'sales/faturamento/setYearMonth') {
        this.$emit('NextStateYearMonth', mutation.payload)
      }
    })
  },

  unmounted () {
    this.unsubscribe()
  }
})
