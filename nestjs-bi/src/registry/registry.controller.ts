import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {RegistryDTO} from './registry.dto';
import {RegistryGuard} from './registry.guard';
import {RegistryEmpresaService} from './registry-empresa.service';
import {UnitOfWorkInterceptor} from 'src/database/unit-of-work/uow.interceptor';
import { IgnoreJwt } from 'src/auth/ignore-jwt.decorator';

@UseInterceptors(UnitOfWorkInterceptor)
@UseGuards(RegistryGuard)
@Controller('cadastro-empresa')
export class RegistryController {
  constructor(private registryEmpresaService: RegistryEmpresaService) {}

  @IgnoreJwt()
  @Post()
  async registry (@Body() data: RegistryDTO) {
    return await this.registryEmpresaService.registry(data)
  }
}
