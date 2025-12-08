import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // -----------------------------------------------------------------------
  // Busca usuário por e-mail (login, validações, etc)
  // -----------------------------------------------------------------------
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // -----------------------------------------------------------------------
  // Busca por ID (rotas protegidas, profile, etc.)
  // -----------------------------------------------------------------------
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // -----------------------------------------------------------------------
  // Criação de usuário (role padrão 'user')
  // -----------------------------------------------------------------------
  async create(payload: CreateUserDto & { role?: string }): Promise<UserDocument | null> {
    const created = new this.userModel({
      ...payload,
    role: payload.role ?? 'user',
  });
    return created.save();
  }

  // -----------------------------------------------------------------------
  // Atualização parcial via PATCH
  // -----------------------------------------------------------------------
  async update(id: string, patch: Partial<CreateUserDto>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, patch, { new: true }).exec();
  }

  // -----------------------------------------------------------------------
  // Remoção por ID
  // -----------------------------------------------------------------------
  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
  
  // -----------------------------------------------------------------------
  // Busca todos os usuários com paginação
  // skip → quantos registros ignorar
  // limit → quantos registros retornar
  // -----------------------------------------------------------------------
  async findAll({ skip = 0, limit = 50 } = {}): Promise<UserDocument[]> {
    return this.userModel.find().skip(skip).limit(limit).exec();
  }
}
