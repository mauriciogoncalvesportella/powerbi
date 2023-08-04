import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from "class-validator"
import { Transform } from 'class-transformer'
import { IdMesAnoValidationPipe } from "src/shared/id-mes-ano.pipe"
import { ValidationPipe } from "@nestjs/common"

export class ComparativeDTO {
  @IsIn(['revenue', 'markup', 'profit', 'products_count'])
  data_mode: 'revenue' | 'markup' | 'profit' | 'products_count'

  @Transform(({ value }) => value == undefined ? null : parseInt(value))
  @IsNumber()
  @IsOptional()
  product_code: number | null

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  code: number

  @IsString()
  yearMonth: string

  @IsIn(['seller', 'team'])
  type: 'seller' | 'team'
  
  @IsIn(['monthly', 'quartely', 'semester', 'anualy'])
  frequency: 'monthly' | 'quartely' | 'semester' | 'anualy'

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  expand_team: boolean

  @IsIn(['previous', 'previous_years', 'yearly'])
  iteration_mode: 'previous' | 'previous_years' | 'yearly'

  @Transform(({ value }) => parseInt(value))
  @IsIn([1,2,3,4,5,6])
  iterations: number
}

export interface ComparativeOutputDTO {
  labels: string[],
  series: {
    name: string,
    type: 'line' | 'bar',
    data: number[]
  }[]
}