import { addMonths, format, getDate } from 'date-fns'
import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { AuthStateInterface } from './auth.state'

const getters: GetterTree<AuthStateInterface, StateInterface> = {
  currentYearMonth (state) {
    if (state.user && state.user?.dtFechamento) {
      const dtFechamento = state.user.dtFechamento
      const currentDay = getDate(new Date())
      if (currentDay > dtFechamento) {
        return format(addMonths(new Date(), 1), 'yyyy-MM')
      }
    }

    return format(new Date(), 'yyyy-MM')
  }
}

export default getters
