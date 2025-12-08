import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// -----------------------------------------------------------------------
// DTO para criação de usuário
// -----------------------------------------------------------------------
export class CreateUserDto {
  @IsNotEmpty({ message: 'E-mail não pode ser vazio.' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Senha não pode ser vazia.' })
  @MinLength(6, { message: 'Senha deve ter ao menos 6 caracteres.' })
  password: string;
}
