import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { RequestMetadata } from "src/shared/request-metadata.provider";
import { UserAuth } from "../auth.interfaces";
import { UserStatusService } from "./user-status.service";
import { Reflector } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class UserDeactivatedGuard implements CanActivate {
  constructor (
    @Inject(UserStatusService)
    private userStatusService: UserStatusService,
    @Inject(RequestMetadata)
    private metadata: RequestMetadata,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user: UserAuth = context.switchToHttp().getRequest().user
    const ignoreJwt = this.reflector.get<boolean>('ignore_jwt', context.getHandler());

    if (user?.role === 'user' && !ignoreJwt) {
      if (!user) {
        throw new UnauthorizedException('User is null')
      }

      if (user.role !== 'user') {
        throw new UnauthorizedException('Forbidden role')
      }

      if (!(await this.userStatusService.getStatus(user.cdVendedor))) {
        throw new UnauthorizedException('User is deactivated')
      }

      if (!user.expiresIn || user.expiresIn <= (new Date()).getTime()) {
        throw new UnauthorizedException('Token expired')
      }
    }

    return true
  }
}
