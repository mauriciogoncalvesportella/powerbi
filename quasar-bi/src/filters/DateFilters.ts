import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default {
  date2format (date: Date, ff: string) {
    return format(date, ff)
  },

  date2monthyear (date: Date) {
    return format(date, 'MMMM - yyyy', { locale: ptBR })
  },

  date2monthname (date: Date) {
    return format(date, 'MMMM', { locale: ptBR })
  }
}
