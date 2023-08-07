import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import { JwtGuard } from 'src/auth/jwt.guard'
import { UserDeactivatedGuard } from 'src/auth/user-status/user-status.guard'
import { ComparativeDTO } from './comparative.dto'
import { YearlyUseCase } from './use-cases/yearly.use-case'
import { PreviousExpandUseCase } from './use-cases/previous-expand.use-case'
import { PreviousUseCase } from './use-cases/previous.use-case'
import { PreviousExpandProductsUseCase } from './use-cases/previous-expand-products.use-case'

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/sales/comparative')
export class ComparativeController {
  constructor (
    private yearlyUseCase: YearlyUseCase,
    private previousExpandUseCase: PreviousExpandUseCase,
    private previousUseCase: PreviousUseCase,
    private previousExpandProductsUseCase: PreviousExpandProductsUseCase
  ) { }
  
  @Get('')
  async comparative (
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true
    })) query: ComparativeDTO
  ) {

    switch (query.iteration_mode) {
      case 'previous':
      case 'previous_years':
        if (query.expand_team && query.data_mode === 'products_count') {
          return await this.previousExpandProductsUseCase.execute(query)
        }
        if (query.expand_team && query.type === 'team') {
          return await this.previousExpandUseCase.execute(query)
        }
        return await this.previousUseCase.execute(query)

      case 'yearly':
        return await this.yearlyUseCase.execute(query)
    }
  }
}