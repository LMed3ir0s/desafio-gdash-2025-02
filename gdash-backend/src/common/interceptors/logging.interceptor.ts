import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { user?: any }>();

    const method = request.method;
    const url = request.url;

    // Se tiver usuário autenticado via JWT, pega algo de identificação (sem e-mail)
    const userId = (request as any).user?.id || (request as any).user?._id || 'anônimo';

    this.logger.log(`[REQ] ${method} ${url} - user=${userId}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        this.logger.log(`[RES] ${method} ${url} - user=${userId} - ${ms}ms`);
      }),
    );
  }
}
