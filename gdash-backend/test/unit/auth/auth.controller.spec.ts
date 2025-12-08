import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/modules/auth/controllers/auth.controller';
import { AuthService, SafeUser } from '../../../src/modules/auth/services/auth.service';
import { LoginDTO } from '../../../src/modules/auth/dtos/login.dto';
import { UnauthorizedException, Logger  } from '@nestjs/common';

// Mock do AuthService
const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
};

// Testes do AuthController
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    // Instâncias dos providers e controllers
    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Removendo exibição de logs no console
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // login - sucesso
  // -------------------------------------------------------------------
  describe('login', () => {
    it('deve retornar o access_token ao fazer login', async () => {
      // Arrange:
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: '123456',
      };

      const safeUser: SafeUser = {
        id: '123',
        email: 'test@example.com',
        role: 'user',
      };

      const tokenResponse = { access_token: 'jwt.token.mock' };

      mockAuthService.validateUser.mockResolvedValue(safeUser);
      mockAuthService.login.mockResolvedValue(tokenResponse);

      // Act:
      const result = await controller.login(loginDto);

      // Assert:
      expect(result).toEqual(tokenResponse);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(safeUser);
    });

    // -------------------------------------------------------------------
    // login - falha
    // -------------------------------------------------------------------
    it('deve lançar UnauthorizedException caso validateUser falhe', async () => {
      // Arrange:
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: 'wrongpass',
      };

      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      // Act:
      const act = controller.login(loginDto);

      // Assert:
      await expect(act).rejects.toThrow(UnauthorizedException);
    });
});
})
