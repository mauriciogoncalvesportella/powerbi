import {IsEmail, IsString} from "class-validator";

export class LoginDTO {
  @IsString()
  email: string

  @IsString()
  password: string
}

export class Login {
  @IsString()
  loginId: string

  @IsString()
  tenantId: string

  @IsString()
  password: string
}
