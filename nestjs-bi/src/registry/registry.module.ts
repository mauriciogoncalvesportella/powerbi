import { Module } from '@nestjs/common';
import { RegistryEmpresaService } from './registry-empresa.service';
import {RegistryUsuarioService} from './registry-usuario.service';
import { RegistryController } from './registry.controller';

@Module({
  providers: [RegistryEmpresaService, RegistryUsuarioService],
  controllers: [RegistryController],
  exports: [RegistryUsuarioService],

})
export class RegistryModule {}
