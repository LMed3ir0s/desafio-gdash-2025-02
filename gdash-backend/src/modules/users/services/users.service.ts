import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';
import { UserDocument } from '../schemas/user.schema';

// Interface para controle de paginação
export interface PaginationOptions {
  page: number;   // número da página (1, 2, 3…)
  limit: number;  // quantos registros por página
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepo: UsersRepository) { }

  // -----------------------------------------------------------------------
  // Busca um usuário pelo e-mail
  // -----------------------------------------------------------------------
  async findByEmail(email: string): Promise<UserEntity | null> {
    const userDoc = await this.usersRepo.findByEmail(email);

    if (!userDoc) return null; // retorna null caso não exista

    return new UserEntity({
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    });
  }

  // Busca usuário pelo e-mail com senha (apenas para autenticação).
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.usersRepo.findByEmail(email) // retorna o documento bruto com password
  }

  // -----------------------------------------------------------------------
  // Cria usuário com hash de senha
  // Se não for passado role, assume 'user'
  // -----------------------------------------------------------------------
  async createUser(dto: CreateUserDto, role = 'user'): Promise<UserEntity> {
    const exists = await this.usersRepo.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Cria o usuário no banco
    const userDoc = await this.usersRepo.create({ ...dto, password: hashedPassword, role });
    if (!userDoc) {
      throw new BadRequestException('Falha ao criar usuário');
    }

    // Retorna a entidade com tipagem consistente
    return new UserEntity({
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    });
  }

  // -----------------------------------------------------------------------
  // Cria usuário admin a partir do .env caso não exista
  // -----------------------------------------------------------------------
  async seedAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminRole = process.env.ADMIN_ROLE || 'admin';

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'ADMIN_EMAIL ou ADMIN_PASSWORD não definido — pulando criação do usuário admin',
      );
      return;
    }

    const existingAdmin = await this.findByEmail(adminEmail);
    if (existingAdmin) {
      this.logger.log('Usuário ADMIN já existe — criação ignorada');
      return;
    }

    await this.createUser({ email: adminEmail, password: adminPassword }, adminRole);
    this.logger.log('Usuário ADMIN criado a partir do arquivo .env');
  }

  // -----------------------------------------------------------------------
  // Busca usuário pelo ID
  // -----------------------------------------------------------------------
  async getById(id: string): Promise<UserEntity> {
    const userDoc = await this.usersRepo.findById(id);
    if (!userDoc) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }

    return new UserEntity({
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    });
  }

  // -----------------------------------------------------------------------
  // Atualiza usuário parcialmente (PATCH)
  // -----------------------------------------------------------------------
  async updateUser(id: string, patch: Partial<CreateUserDto>): Promise<UserEntity> {
    const updatedDoc = await this.usersRepo.update(id, patch);
    if (!updatedDoc) {
      throw new NotFoundException(`Não foi possível atualizar usuário com id ${id}`);
    }

    return new UserEntity({
      id: updatedDoc._id.toString(),
      email: updatedDoc.email,
      role: updatedDoc.role,
      createdAt: updatedDoc.createdAt,
      updatedAt: updatedDoc.updatedAt,
    });
  }

  // -----------------------------------------------------------------------
  // Remove usuário pelo ID
  // -----------------------------------------------------------------------
  async removeUser(id: string): Promise<void> {
    const deleted = await this.usersRepo.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
  }

  // -----------------------------------------------------------------------
  // Lista usuários paginados (apenas ADMIN)
  // -----------------------------------------------------------------------
  async listUsers({ page, limit }: PaginationOptions): Promise<UserEntity[]> {
    // Calcula quantos registros pular
    const skip = (page - 1) * limit;

    // Busca registros no banco
    const usersDocs = await this.usersRepo.findAll({ skip, limit });

    // Converte documentos do MongoDB em UserEntity (tipagem consistente)
    return usersDocs.map(userDoc => new UserEntity({
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    }));
  }
}
