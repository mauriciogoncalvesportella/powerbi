// import { getDaysInMonth } from 'date-fns'
import { apiProvider } from 'src/boot/axios'
import { DateUtils } from 'src/utils/date.utils'
import { ActionTree } from 'vuex'
import { StateInterface } from '../../index'
import { RevenueStateInterface } from './revenue.state'
import { RevenueTeam, RevenueDTO, RevenueMonthlySellers, RevenueSeller, ComparativeTeamDaily } from './revenue.types'

const actions: ActionTree<RevenueStateInterface, StateInterface> = {
  async daily (store, params) {
    const { data: response } = await apiProvider.axios.get<any>('bi/sales/faturamento/diario', {
      params
    })
    return {
      ...response,
      dates: DateUtils.dateToLocalDate(...response.dates)
    } as RevenueDTO
  },

  async dailyAccumulated (store, params) {
    const { data: response } = await apiProvider.axios.get<any>('bi/sales/faturamento/diario/acumulado', {
      params
    })
    return {
      ...response,
      dates: DateUtils.dateToLocalDate(...response.dates)
    } as RevenueDTO
  },

  async dailySellers (store, params) {
    const { data: response } = await apiProvider.axios.get<any>('bi/sales/faturamento/diario-vendedor', {
      params
    })
    return {
      ...response,
      dates: DateUtils.dateToLocalDate(...response.dates)
    } as RevenueDTO
  },

  async dailySellersAccumulated (store, params) {
    const { data: response } = await apiProvider.axios.get<any>('bi/sales/faturamento/diario-vendedor/acumulado', {
      params
    })
    return {
      ...response,
      dates: DateUtils.dateToLocalDate(...response.dates)
    } as RevenueDTO
  },

  async monthlyTeams (store, params) {
    const { data: response } = await apiProvider.axios.get<RevenueMonthlySellers>('bi/sales/faturamento/mensal', {
      params
    })
    return response
  },

  async monthlySellers (store, params) {
    const { data: response } = await apiProvider.axios.get<RevenueMonthlySellers>('bi/sales/faturamento/mensal-vendedor', {
      params
    })
    return response
  },

  async comparativeTeamDaily (store, params) {
    const { data: response } = await apiProvider.axios.get<ComparativeTeamDaily>('bi/sales/faturamento/comparativo', {
      params
    })
    return response
  },

  async team (store, params) {
    const { data: response } = await apiProvider.axios.get<RevenueTeam>('bi/sales/faturamento/times', {
      params
    })
    return response
  },

  async sellers (store, params) {
    const { data: response } = await apiProvider.axios.get<RevenueSeller>('bi/sales/faturamento/vendedores', {
      params
    })
    return response
  }
}

export default actions
