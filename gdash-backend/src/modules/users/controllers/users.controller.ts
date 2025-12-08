import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -----------------------------------------------------------------------
  // Cria usuário (rota pública)
  // -----------------------------------------------------------------------
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('E-mail e senha são obrigatórios');
    }
    return this.usersService.createUser(dto);
  }

  // -----------------------------------------------------------------------
  // Lista todos os usuários (apenas ADMIN)
  // -----------------------------------------------------------------------
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async listAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 50;
    if (isNaN(pageNum) || isNaN(limitNum)) {
      throw new BadRequestException('Parâmetros de paginação inválidos');
    }
    return this.usersService.listUsers({ page: pageNum, limit: limitNum });
  }

  // -----------------------------------------------------------------------
  // Busca usuário pelo ID (apenas ADMIN)
  // -----------------------------------------------------------------------
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  // -----------------------------------------------------------------------
  // Atualiza usuário parcialmente (PATCH — apenas ADMIN)
  // -----------------------------------------------------------------------
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  // -----------------------------------------------------------------------
  // Remove usuário (apenas ADMIN)
  // -----------------------------------------------------------------------
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.removeUser(id);
    return { message: 'Usuário removido com sucesso' };
  }

  // -----------------------------------------------------------------------
  // Busca usuário pelo email (apenas ADMIN)
  // -----------------------------------------------------------------------
  @Get('admin/email/:email')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findByEmailAdmin(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`Usuário com email ${email} não encontrado`);
    }
    return user;
  }
}
