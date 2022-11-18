import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class RegistryGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean {
    let request = context.switchToHttp().getRequest()
    let token = process.env.REGISTRY_TOKEN
    let headerToken = request.headers.authorization
    return token === headerToken
  }
}
