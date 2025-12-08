import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { User } from '../../../src/modules/users/schemas/user.schema';

// Mock do Model do Mongoose para simular operações no banco
const userModelMock: any = jest.fn();

// Testes do UsersRepository
describe('UsersRepository', () => {
  let repository: UsersRepository;

  // Módulo de teste
  beforeEach(async () => {
    // Reseta implementação e métodos do mock antes de cada teste
    userModelMock.mockReset();
    userModelMock.findOne = jest.fn();
    userModelMock.findById = jest.fn();
    userModelMock.findByIdAndUpdate = jest.fn();
    userModelMock.findByIdAndDelete = jest.fn();
    userModelMock.find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
      ],
    }).compile();

    // Instância do repository
    repository = module.get<UsersRepository>(UsersRepository);
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------
  // findByEmail
  // -----------------------------------------
  describe('findByEmail', () => {
    it('deve buscar usuário pelo e-mail', async () => {
      // Arrange:
      const email = 'user@example.com';
      const doc = { _id: '1', email };
      const queryMock = {
        exec: jest.fn().mockResolvedValueOnce(doc),
      };
      userModelMock.findOne.mockReturnValue(queryMock);

      // Act:
      const result = await repository.findByEmail(email);

      // Assert:
      expect(userModelMock.findOne).toHaveBeenCalledWith({ email });
      expect(queryMock.exec).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });
  });

  // -----------------------------------------
  // findById
  // -----------------------------------------
  describe('findById', () => {
    it('deve buscar usuário pelo ID', async () => {
      // Arrange:
      const id = 'user-id';
      const doc = { _id: id, email: 'user@example.com' };
      const queryMock = {
        exec: jest.fn().mockResolvedValueOnce(doc),
      };
      userModelMock.findById.mockReturnValue(queryMock);

      // Act:
      const result = await repository.findById(id);

      // Assert:
      expect(userModelMock.findById).toHaveBeenCalledWith(id);
      expect(queryMock.exec).toHaveBeenCalled();
      expect(result).toEqual(doc);
    });
  });

  // -----------------------------------------
  // create
  // -----------------------------------------
  describe('create', () => {
    it('deve criar usuário com role padrão "user" quando não informada', async () => {
      // Arrange:
      const payload: any = { email: 'new@example.com', password: 'hashed' };
      const savedDoc = { _id: '1', ...payload, role: 'user' };
      const saveMock = jest.fn().mockResolvedValueOnce(savedDoc);

      // Mock do "new this.userModel(payload)"
      userModelMock.mockImplementationOnce((data: any) => ({
        ...data,
        save: saveMock,
      }));

      // Act:
      const result = await repository.create(payload);

      // Assert:
      expect(userModelMock).toHaveBeenCalledWith({
        ...payload,
        role: 'user',
      });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(savedDoc);
    });

    it('deve criar usuário mantendo role explícita quando informada', async () => {
      // Arrange:
      const payload: any = { email: 'admin@example.com', password: 'hashed', role: 'admin' };
      const savedDoc = { _id: '1', ...payload };
      const saveMock = jest.fn().mockResolvedValueOnce(savedDoc);

      userModelMock.mockImplementationOnce((data: any) => ({
        ...data,
        save: saveMock,
      }));

      // Act:
      const result = await repository.create(payload);

      // Assert:
      expect(userModelMock).toHaveBeenCalledWith(payload);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(savedDoc);
    });
  });

  // -----------------------------------------
  // update
  // -----------------------------------------
  describe('update', () => {
    it('deve atualizar usuário parcialmente via findByIdAndUpdate', async () => {
      // Arrange:
      const id = 'user-id';
      const patch = { email: 'updated@example.com' };
      const updatedDoc = { _id: id, ...patch };
      const queryMock = {
        exec: jest.fn().mockResolvedValueOnce(updatedDoc),
      };
      userModelMock.findByIdAndUpdate.mockReturnValue(queryMock);

      // Act:
      const result = await repository.update(id, patch);

      // Assert:
      expect(userModelMock.findByIdAndUpdate).toHaveBeenCalledWith(id, patch, { new: true });
      expect(queryMock.exec).toHaveBeenCalled();
      expect(result).toEqual(updatedDoc);
    });
  });

  // -----------------------------------------
  // remove
  // -----------------------------------------
  describe('remove', () => {
    it('deve remover usuário pelo ID via findByIdAndDelete', async () => {
      // Arrange:
      const id = 'user-id';
      const deletedDoc = { _id: id, email: 'deleted@example.com' };
      const queryMock = {
        exec: jest.fn().mockResolvedValueOnce(deletedDoc),
      };
      userModelMock.findByIdAndDelete.mockReturnValue(queryMock);

      // Act:
      const result = await repository.remove(id);

      // Assert:
      expect(userModelMock.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(queryMock.exec).toHaveBeenCalled();
      expect(result).toEqual(deletedDoc);
    });
  });

  // -----------------------------------------
  // findAll
  // -----------------------------------------
  describe('findAll', () => {
    it('deve buscar todos os usuários com paginação customizada', async () => {
      // Arrange:
      const docs = [
        { _id: '1', email: 'a@example.com' },
        { _id: '2', email: 'b@example.com' },
      ];
      const queryMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(docs),
      };
      userModelMock.find.mockReturnValue(queryMock);

      // Act:
      const result = await repository.findAll({ skip: 10, limit: 5 });

      // Assert:
      expect(userModelMock.find).toHaveBeenCalledWith();
      expect(queryMock.skip).toHaveBeenCalledWith(10);
      expect(queryMock.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(docs);
    });

    it('deve usar valores padrão quando skip/limit não forem passados', async () => {
      // Arrange:
      const docs = [{ _id: '1', email: 'default@example.com' }];
      const queryMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(docs),
      };
      userModelMock.find.mockReturnValue(queryMock);

      // Act:
      const result = await repository.findAll();

      // Assert:
      expect(userModelMock.find).toHaveBeenCalledWith();
      expect(queryMock.skip).toHaveBeenCalledWith(0);
      expect(queryMock.limit).toHaveBeenCalledWith(50);
      expect(result).toEqual(docs);
    });
  });
});
