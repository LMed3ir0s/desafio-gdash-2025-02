import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";

export class LoginDTO {
    @IsEmail({}, { message: "E-mail inválido" })
    @IsNotEmpty({ message: "O campo e-mail é obrigatório" })
    email: string;

    @IsString({ message: "A senha deve ser uma string" })
    @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
    @IsNotEmpty({ message: "O campo senha é obrigatório" })
    password: string;
}
