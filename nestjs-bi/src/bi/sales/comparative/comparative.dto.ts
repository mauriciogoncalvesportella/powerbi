import { IsBoolean, IsIn, IsNumber } from "class-validator"
import { Transform } from 'class-transformer'

export class ComparativeDTO {
  @IsIn(['revenue', 'markup', 'profit'])
  data_mode: 'revenue' | 'markup' | 'profit'

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  code: number

  @IsIn(['seller', 'team'])
  type: 'seller' | 'team'
  
  @IsIn(['monthly', 'quartely', 'semester', 'anualy'])
  frequency: 'monthly' | 'quartely' | 'semester' | 'anualy'

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  expand_team: boolean

  @IsIn(['previous', 'periods'])
  iteration_mode: 'previous' | 'periods'

  @Transform(({ value }) => parseInt(value))
  @IsIn([1,2,3,4,5,6])
  iterations: number

  get byPeriods (): boolean {
    return this.iteration_mode === 'periods'
  }
}

export interface ComparativeOutputDTO {
  labels: string[],
  series: {
    name: string,
    type: 'line' | 'bar',
    data: number[]
  }[]
}