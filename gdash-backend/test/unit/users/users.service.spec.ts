import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/modules/users/services/users.service';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { BadRequestException, Logger } from '@nestjs/common';


// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Testes do UsersService
describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: UsersRepository;

   // Mock do repositório para simular consultas e inserção no DB
  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    // Instâncias dos providers
    service = module.get<UsersService>(UsersService);
    usersRepo = module.get<UsersRepository>(UsersRepository);

    // Removendo exibição de logs no console
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------
  // findByEmail
  // -----------------------------------------

  describe('findByEmail', () => {
    // Arrange:
    it('deve chamar usersRepo.findByEmail com o e-mail correto', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      // Act:
      await service.findByEmail('test@example.com');

      // Assert:
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  // -----------------------------------------
  // createUser
  // -----------------------------------------

  describe('createUser', () => {
    // Arrange:
    it('deve lançar BadRequestException caso o usuário já exista', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue({
        email: 'test@example.com',
      });

      // Act:
      const result = service.createUser ({
         email: 'test@example.com',
         password: '123456'
      });

      // Assert:
      await expect(result).rejects.toThrow(BadRequestException);
    });

    // Arrange:
    it('deve criar um usuário com senha criptografada e role padrão', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue({
        _id: 'mockid',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act:
      const result = await service.createUser({
        email: 'test@example.com',
        password: '123456',
      });

      
      // Assert:
      const bcrypt = require('bcryptjs');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'user',
        })
      );
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('role', 'user');
    });
  });

  // -----------------------------------------
  // seedAdminUser
  // -----------------------------------------

  describe('seedAdminUser', () => {
    // Arrange:
    it('deve emitir um aviso e ignorar caso ADMIN_EMAIL ou ADMIN_PASSWORD não estejam definidos', async () => {
      process.env.ADMIN_EMAIL = '';
      process.env.ADMIN_PASSWORD = '';

      // Act:
      await service.seedAdminUser();

      // Assert:
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('ADMIN_EMAIL ou ADMIN_PASSWORD não definido')
      );
    });

    // Arrange:
    it('não deve criar o admin caso ele já exista', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'senha';
      process.env.ADMIN_ROLE = 'admin';
      jest.spyOn(service, 'findByEmail').mockResolvedValue({
        _id: 'mockid',
        email: 'admin@example.com',
        password: 'hashedPassword',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act:
      await service.seedAdminUser();

      // Assert:
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Usuário ADMIN já existe')
      );
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });

    // Arrange:
    it('deve criar o admin caso ele não exista', async () => {
      process.env.ADMIN_EMAIL = 'admin@example.com';
      process.env.ADMIN_PASSWORD = 'senha';
      process.env.ADMIN_ROLE = 'admin';
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue({
        _id: 'adminid',
        email: 'admin@example.com',
        role: 'admin',
      });

      // Act:
      await service.seedAdminUser();

      // Assert:
      expect(mockUsersRepository.create).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Usuário ADMIN criado')
      );
    });
  });
});
