import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// -----------------------------------------------------------------------
// DTO para atualização de usuário
// Herda CreateUserDto, mas todos os campos são opcionais
// -----------------------------------------------------------------------
export class UpdateUserDto extends PartialType(CreateUserDto) {}
