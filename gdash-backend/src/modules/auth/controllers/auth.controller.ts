import { Body, Controller, Post } from "@nestjs/common";
import { AuthService, SafeUser } from "../services/auth.service";
import { LoginDTO } from "../dtos/login.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() dto: LoginDTO) {
        const validateUser: SafeUser = await this.authService.validateUser(dto.email, dto.password);
        const tokenResponse = await this.authService.login(validateUser);
        return tokenResponse;
    }
}
