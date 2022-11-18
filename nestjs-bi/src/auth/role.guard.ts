import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {BaseAuth, RolesAuth, UserAuth} from "./auth.interfaces";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const user: BaseAuth = context.switchToHttp().getRequest().user
    const role: RolesAuth = this.reflector.get<RolesAuth>('role', context.getHandler())

    if (user.role === 'commerce') {
      return true
    }

    return user.role === role
  }
}
