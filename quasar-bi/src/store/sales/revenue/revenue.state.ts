export interface RevenueStateInterface {
  loading: { [id: string]: boolean },
  yearMonth: string
}

function state (): RevenueStateInterface {
  return {
    loading: {
      faturamento: false
    },
    yearMonth: '2021-08'
  }
}

export default state
