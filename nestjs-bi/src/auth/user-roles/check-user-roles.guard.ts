import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { UserRolesService } from "./user-roles.service";
import { UserAuth } from "../auth.interfaces";
import { Reflector } from "@nestjs/core";
import UserRoles from "./user-roles.enum";

@Injectable({ scope: Scope.REQUEST })
export class CheckUserRolesGuard implements CanActivate {
  constructor (
    @Inject(UserRolesService)
    private userRolesService: UserRolesService,
    private reflector: Reflector
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const user: UserAuth | undefined = context.switchToHttp().getRequest().user
    const userRoles = this.reflector.get<UserRoles[]>('userRole', context.getHandler())

    if (user?.role === 'user' && userRoles != null) {
      const roleVerified = await this.userRolesService.verifySpecificRoles(user, userRoles)
      if (!roleVerified) {
        throw new UnauthorizedException()
      }
    }

    return true
  }
}
