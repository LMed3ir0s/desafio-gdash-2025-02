import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { UserEntity } from "src/modules/users/entities/user.entity"
import { UsersService } from "src/modules/users/services/users.service"

export interface SafeUser {
  id: string
  email: string
  role: string
  createdAt?: Date
  updatedAt?: Date
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Valida usuário e retorna SafeUser sem password.
  async validateUser(email: string, password: string): Promise<SafeUser> {
    // Busca documento com senha para comparar hash.
    const userDoc = await this.userService.findByEmailWithPassword(email)
    if (!userDoc) {
      throw new UnauthorizedException("Credenciais inválidas")
    }

    // Compara senha em texto com hash do banco.
    const match = await bcrypt.compare(password, userDoc.password)
    if (!match) {
      throw new UnauthorizedException("Credenciais inválidas")
    }

    // Monta UserEntity sem expor a senha.
    const userEntity = new UserEntity({
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    })

    const safeUser: SafeUser = {
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    }

    return safeUser
  }

  // Gera access token.
  async login(user: SafeUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }
    const token = this.jwtService.sign(payload)
    return { access_token: token }
  }
}
