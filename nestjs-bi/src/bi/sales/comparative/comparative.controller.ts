import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import { JwtGuard } from 'src/auth/jwt.guard'
import { UserDeactivatedGuard } from 'src/auth/user-status/user-status.guard'
import { ComparativeDTO } from './comparative.dto'
import { ComparativeUseCases } from './comparative.use-cases'
import { PeriodsUseCase } from './use-cases/periods.use-case'
import { PreviousExpandUseCase } from './use-cases/previous-expand.use-case'
import { PreviousUseCase } from './use-cases/previous.use-case'

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/sales/comparative')
export class ComparativeController {
  constructor (
    private periodsUseCase: PeriodsUseCase,
    private previousExpandUseCase: PreviousExpandUseCase,
    private previousUseCase: PreviousUseCase
  ) { }
  
  @Get('')
  async comparative (
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true
    })) query: ComparativeDTO
  ) {
    if (query.iteration_mode === 'previous') {
      if (query.expand_team) {
        return await this.previousExpandUseCase.execute(query)
      }
      return await this.previousUseCase.execute(query)
    }
    return await this.periodsUseCase.execute(query)
  }
}