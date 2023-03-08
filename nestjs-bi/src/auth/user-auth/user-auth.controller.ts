import {BadRequestException, Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors} from "@nestjs/common";
import {UnitOfWorkInterceptor} from "src/database/unit-of-work/uow.interceptor";
import {LoginDTO} from "./user-auth.dto";
import {UserAuthService} from "./user-auth.service";

@UseInterceptors(UnitOfWorkInterceptor)
@Controller('auth')
export class UserAuthController {
  constructor(
    private authService: UserAuthService
  ) {}

  @Post('login')
  async login(@Body() data: LoginDTO) {
    const [tenantId, loginId] = data.email.split('/')

    if (!tenantId || !loginId) {
      throw new BadRequestException()
    }

    try {
      return await this.authService.login({
        tenantId,
        loginId,
        password: data.password
      })
    } catch (err: any) {
      throw new UnauthorizedException('invalid login')
    }
  }
}
