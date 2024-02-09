import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { UserRolesService } from "./user-roles.service";
import { UserAuth } from "../auth.interfaces";

@Injectable({ scope: Scope.REQUEST })
export class UserRolesGlobalGuard implements CanActivate {
  constructor (
    @Inject(UserRolesService)
    private userRolesService: UserRolesService
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const user: UserAuth | undefined = context.switchToHttp().getRequest().user

    if (user?.role === 'user' && !(await this.userRolesService.verifyProfileRoles(user))) {
      throw new UnauthorizedException('User roles changed')
    }

    return true
  }
}
