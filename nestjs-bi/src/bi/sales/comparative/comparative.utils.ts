interface BaseOrder {
  cost_value: number,
  revenue: number,
  profit_value: number,
  products_count: number
}

const ComparativeUtils = {
  getValue (data_mode: 'revenue' | 'profit' | 'markup' | 'products_count', data: Record<'revenue'|'profit_value'|'cost_value'|'products_count', number>) {
    switch (data_mode) {
      case 'markup': return data.cost_value === 0
        ? 0
        : ((data.revenue / data.cost_value) - 1) * 100
      case 'profit': return data.cost_value === 0
        ? 0
        : (data.profit_value / data.revenue) * 100
      case 'products_count': return data.products_count
      default: return data.revenue
    }
  },

  initialize () {
    return {
      cost_value: 0,
      profit_value: 0,
      revenue: 0,
      products_count: 0
    }
  },

  add (data: Record<'revenue'|'profit_value'|'cost_value'|'products_count', number>, order: BaseOrder) {
    data.cost_value += order.cost_value
    data.profit_value += order.profit_value
    data.revenue += order.revenue
    data.products_count += order.products_count
  }
}

export default ComparativeUtils
