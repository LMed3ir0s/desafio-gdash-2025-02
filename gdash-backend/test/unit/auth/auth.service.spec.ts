import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, SafeUser } from '../../../src/modules/auth/services/auth.service';
import { UsersService } from '../../../src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Testes do AuthService
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock do UsersService e JwtService
  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    // Instâncias dos providers
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
});

  // -----------------------------
  // validateUser
  // -----------------------------
  describe('validateUser', () => {
      // Arrange:
    it('deve retornar SafeUser se credenciais corretas', async () => {
      const user = { 
        _id: '123', 
        email: 'test@example.com', 
        role: 'user', 
        password: 'hashedPassword',
        toObject: () => ({
          _id: '123',
          email: 'test@example.com',
          role: 'user',
          password: 'hashedPassword'
        })
      };
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act:
      const result = await service.validateUser('test@example.com', '123456');

      // Assert:
      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'user'
      });
    });

    it('deve lançar UnauthorizedException se usuário não existe', async () => {
      // Arrange:
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act:
      const act = service.validateUser('x@example.com', '123456');

      // Assert:
      await expect(act).rejects.toThrow(UnauthorizedException);

    });

    it('deve lançar UnauthorizedException se senha incorreta', async () => {
      // Arrange:
      const user = { _id: '123', email: 'test@example.com', role: 'user', password: 'hashedPassword' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act:
      const act = service.validateUser('test@example.com', 'wrongpassword');

      // Assert:
      await expect(act).rejects.toThrow(UnauthorizedException);
    });
  });

  // -----------------------------
  // login
  // -----------------------------
  describe('login', () => {
    it('deve retornar access_token com payload correto', async () => {
      // Arrange:
      const safeUser: SafeUser = { id: '123', email: 'test@example.com', role: 'user' };
      mockJwtService.sign.mockReturnValue('mockedToken');

      // Act:
      const result = await service.login(safeUser);

      // Assert:
      expect(result).toEqual({ access_token: 'mockedToken' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      });
    });
  });
})
