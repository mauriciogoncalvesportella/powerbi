import { IsInt, IsString} from "class-validator";

export class RegistryDTO {
  @IsString()
  idFantasia: string;

  @IsString()
  nmRazao: string;

  @IsString()
  idCnpj: string;
}

export class RegistryUsuarioDTO {
  @IsInt()
  cdVendedor: number

  @IsString()
  idEmpresa: string

  @IsString()
  idEmail: string

  @IsString()
  idSenha: string
}
