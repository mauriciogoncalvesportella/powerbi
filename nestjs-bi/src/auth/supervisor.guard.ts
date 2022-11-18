import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {UserAuth} from "./auth.interfaces";

@Injectable()
export class SupervisorGuard implements CanActivate {
  constructor (
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const user: UserAuth = context.switchToHttp().getRequest().user
    if (user.role === 'commerce') {
      return false
    }
    return user.fgFuncao > 1
  }
}

@Injectable()
export class DirectorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user: UserAuth = context.switchToHttp().getRequest().user
    if (user.role === 'commerce') {
      return false
    }
    return user.fgFuncao == 3
  }
}
