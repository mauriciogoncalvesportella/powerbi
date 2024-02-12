import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ignoreJwt = this.reflector.get<boolean>('ignore_jwt', context.getHandler());
    if (ignoreJwt) {
      // Ignora a validação se a rota for marcada como pública
      return true;
    }

    // Se não for uma rota pública, executa a lógica padrão do JwtGuard
    return await (super.canActivate(context) as Promise<boolean>);
  }
}
