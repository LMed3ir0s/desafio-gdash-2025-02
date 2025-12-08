import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/modules/users/controllers/users.controller';
import { UsersService } from '../../../src/modules/users/services/users.service';
import { CreateUserDto } from '../../../src/modules/users/dtos/create-user.dto';

// Mock do RolesGuard e decorator
jest.mock('src/common/guards/roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true),
  })),
}));

jest.mock('src/common/decorators/roles.decorator', () => ({
  Roles: () => jest.fn(),
}));

// Mock do UsersService
const mockUsersService = {
  createUser: jest.fn(),
  findByEmail: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    // Limpa mocks antes de cada teste
    jest.clearAllMocks();
  });

  // -----------------------------------------
  // createUser
  // -----------------------------------------
  describe('createUser', () => {
    it('deve chamar usersService.createUser com o DTO correto', async () => {
      // Arrange:
      const dto: CreateUserDto = { email: 'test@example.com', password: '123456' };
      const userMock = { id: '1', email: dto.email, role: 'user' };
      mockUsersService.createUser.mockResolvedValue(userMock);

      // Act:
      const result = await controller.createUser(dto);

      // Assert:
      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(userMock);
    });
  });

  // -----------------------------------------
  // findByEmailAdmin
  // -----------------------------------------
  describe('findByEmailAdmin', () => {
    it('deve chamar usersService.findByEmail com email correto', async () => {
      // Arrange:
      const email = 'admin@example.com';
      const userMock = { id: '1', email, role: 'admin' };
      mockUsersService.findByEmail.mockResolvedValue(userMock);

      // Act:
      const result = await controller.findByEmailAdmin(email);

      // Assert:
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(userMock);
    });
  });
});
