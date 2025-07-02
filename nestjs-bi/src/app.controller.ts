import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';


// CONTROLLER PRINCIPAL DA APLICAÇÃO


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // pode adicionar mais rotas conforme o acesso ! Cria rotas
  getHello(): string {
    return this.appService.getHello();
  }
}
