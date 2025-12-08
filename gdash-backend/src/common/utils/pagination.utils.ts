import { BadRequestException } from '@nestjs/common';

// Interface pública (usada por service/controller)
export interface PaginationOptions {
  page: number;   // número da página (1, 2, 3…)
  limit: number;  // quantos registros por página
}

// Interface interna para repository (skip/limit)
export interface PaginationParams {
  skip: number;
  limit: number;
}

// Converte PaginationOptions -> PaginationParams
//  * Pode ser usado no service antes de chamar o repository.
export function getPagination(options?: Partial<PaginationOptions>) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 50;

  if (!Number.isFinite(page) || !Number.isFinite(limit) || page < 1 || limit < 1) {
    throw new BadRequestException('Parâmetros de paginação inválidos.');
  }

  const skip = (page - 1) * limit;
  return { page, limit, skip } as { page: number; limit: number; skip: number };
}

// Parse query strings vindas do controller (page e limit)
// e retorna PaginationOptions tipado.
export function parsePagination(pageStr?: string, limitStr?: string): PaginationOptions {
  const page = pageStr ? Number(pageStr) : 1;
  const limit = limitStr ? Number(limitStr) : 50;

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new BadRequestException('Parâmetros de paginação inválidos');
  }

  return { page, limit };
}
