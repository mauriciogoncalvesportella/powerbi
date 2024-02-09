import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class UpdateRolesDTO {
  @IsInt()
  cdPerfilAcesso: number

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  roles: string[]
}