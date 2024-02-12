import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { UserRolesService } from "./user-roles.service";
import { UserAuth } from "../auth.interfaces";
import { Reflector } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class UserRolesGlobalGuard implements CanActivate {
  constructor (
    @Inject(UserRolesService)
    private userRolesService: UserRolesService,
    private reflector: Reflector
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const user: UserAuth | undefined = context.switchToHttp().getRequest().user
    const ignoreJwt = this.reflector.get<boolean>('ignore_jwt', context.getHandler());

    if (user?.role === 'user' && !ignoreJwt) {
      const verifiedRoles = await this.userRolesService.verifyProfileRoles(user)
      if (!verifiedRoles) {
        throw new UnauthorizedException('User roles changed')
      }
    }

    return true
  }
}
