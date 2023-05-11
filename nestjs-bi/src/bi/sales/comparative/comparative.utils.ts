interface BaseOrder {
  cost_value: number,
  revenue: number,
  profit_value: number
}

const ComparativeUtils = {
  getValue (data_mode: 'revenue' | 'profit' | 'markup', data: Record<'revenue'|'profit_value'|'cost_value', number>) {
    switch (data_mode) {
      case 'markup': return data.cost_value === 0
        ? 0
        : ((data.revenue / data.cost_value) - 1) * 100
      case 'profit': return data.cost_value === 0
        ? 0
        : (data.profit_value / data.revenue) * 100
      default: return data.revenue
    }
  },

  initialize () {
    return {
      cost_value: 0,
      profit_value: 0,
      revenue: 0
    }
  },

  add (data: Record<'revenue'|'profit_value'|'cost_value', number>, order: BaseOrder) {
    data.cost_value += order.cost_value
    data.profit_value += order.profit_value
    data.revenue += order.revenue
  }
}

export default ComparativeUtils
