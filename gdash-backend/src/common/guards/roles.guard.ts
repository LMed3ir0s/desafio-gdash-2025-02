import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Obtém os roles definidos pelo decorator @Roles() na rota ou controller
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Bloqueia rota se não houver roles definidos
    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException('Rota sem roles definida');
    }

    // Recupera o usuário autenticado pelo AuthGuard('jwt')
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Bloqueia se não houver usuário (JWT inválido ou ausente)
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Bloqueia se o role do usuário não estiver entre os roles exigidos
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado: role insuficiente');
    }

    // Tudo certo, libera o acesso
    return true;
  }
}
