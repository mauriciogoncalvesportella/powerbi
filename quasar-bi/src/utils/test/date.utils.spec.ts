import { DateUtils } from '../date.utils'

describe('Date Utils', () => {
  it("getYearMonth (date = '2022-06-26', closeDay = 25)", () => {
    const todayDate = new Date('2022-06-26 00:00')
    const yearMonth = DateUtils.getYearMonth(todayDate, 25)
    expect(yearMonth).toBe('2022-07')
  })

  it("getYearMonth (date = '2022-07-25', closeDay = 25)", () => {
    const todayDate = new Date('2022-07-25 00:00')
    const yearMonth = DateUtils.getYearMonth(todayDate, 25)
    expect(yearMonth).toBe('2022-07')
  })

  it("getYearMonth (date = '2022-07-26', closeDay = 25)", () => {
    const todayDate = new Date('2022-07-26 00:00')
    const yearMonth = DateUtils.getYearMonth(todayDate, 25)
    expect(yearMonth).toBe('2022-08')
  })

  it("monthRatio (init = undefined, end = undefined, yearMonth = '2022-07', closeDay = 25)", () => {
    const ratio = DateUtils.monthRatio(undefined, undefined, '2022-07', 25)
    expect(ratio).toBe(20 / 21)
  })

  it("monthRatio (init = '2022-06-26', end = '2022-07-22', closeDay = 25)", () => {
    const ratio = DateUtils.monthRatio('2022-06-26 00:00', '2022-07-22 00:00', undefined, 25)
    expect(ratio).toBe(20 / 21)
  })

  it("monthRatio (init = undefined, end = undefined, yearMonth = '2022-07')", () => {
    const ratio = DateUtils.monthRatio(undefined, undefined, '2022-07')
    expect(ratio).toBe(16 / 21)
  })

  it("monthRatio (init = '2022-07-01', end = '2022-07-22')", () => {
    const ratio = DateUtils.monthRatio('2022-07-01 00:00', '2022-07-22 00:00')
    expect(ratio).toBe(16 / 21)
  })

  it("monthRatio (init = undefined, end = undefined, yearMonth = '2022-06')", () => {
    const ratio = DateUtils.monthRatio(undefined, undefined, '2022-06')
    expect(ratio).toBe(21 / 21)
  })

  it("monthRatio (init = '2022-06-01', end = '2022-06-30')", () => {
    const ratio = DateUtils.monthRatio('2022-06-01 00:00', '2022-06-30 00:00')
    expect(ratio).toBe(21 / 21)
  })

  it("monthRatio (init = undefined, end = undefined, yearMonth = '2022-06', closeDay = 25)", () => {
    const ratio = DateUtils.monthRatio(undefined, undefined, '2022-06')
    expect(ratio).toBe(21 / 21)
  })

  it("monthRatio (init = '2022-05-26', end = '2022-06-25', closeDay = 25)", () => {
    const ratio = DateUtils.monthRatio('2022-05-26 00:00', '2022-06-25 00:00', undefined, 25)
    expect(ratio).toBe(21 / 21)
  })

  /*
  it("getYearMonth (date = '2022-06-26', closeDay = undefined)", () => {
    const todayDate = new Date(2022, 6, 26)
    const yearMonth = DateUtils.getYearMonth(todayDate)
    expect(yearMonth).toBe('2022-06')
  })
  */
  /*
  it("monthRatio (undefined, undefined, '2022-07', 25)", () => {
    const todayDate = new Date(2022, 7, 22)
    DateUtils.monthRatio()
    expect(1).toBe(1)
  })
  */
})
