import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherRepository } from '../../../src/modules/weather/repositories/weather.repository';
import { Weather } from '../../../src/modules/weather/schemas/weather.schema';
import { WeatherEntity } from '../../../src/modules/weather/entities/weather.entity';

// Mock do Model do Mongoose
describe('WeatherRepository', () => {
  let repository: WeatherRepository;
  let weatherModelMock: any;
  let queryMock: any;

  // Configuração do módulo de teste
  beforeEach(async () => {
    // Mock da query do Mongoose (chainable)
    queryMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // Mock do Model
    weatherModelMock = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue(queryMock),
      findOne: jest.fn().mockReturnValue(queryMock),
      aggregate: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherRepository,
        {
          provide: getModelToken(Weather.name),
          useValue: weatherModelMock,
        },
      ],
    }).compile();

    // Instância do repository
    repository = module.get<WeatherRepository>(WeatherRepository);
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------
  // create
  // -------------------------------------------------------------
  describe('create', () => {
    it('deve criar e salvar um novo registro climático', async () => {
      // Arrange
      const dto: any = {
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        recordedAt: new Date(),
      };

      const saveMock = jest.fn().mockResolvedValue(dto);
      const modelConstructorMock = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));

      (repository as any).weatherModel = modelConstructorMock;

      // Act:
      const result = await repository.create(dto);

      // Assert:
      expect(modelConstructorMock).toHaveBeenCalledWith(dto);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeInstanceOf(WeatherEntity);
      expect(result.temperature).toBe(dto.temperature);
      expect(result.cityName).toBe(dto.cityName);
      expect(result.cityQueryKey).toBe(dto.cityQueryKey);
    });
  });

  // -------------------------------------------------------------
  // findAll
  // -------------------------------------------------------------
  describe('findAll', () => {
    it('deve retornar registros paginados ordenados por recordedAt desc', async () => {
      // Arrange:
      const docs = [
        {
          cityName: 'Brasília',
          cityQueryKey: 'brasilia_df',
          temperature: 25,
          humidity: 60,
          windSpeed: 10,
          recordedAt: new Date('2025-11-26T10:00:00Z'),
        },
      ];
      queryMock.exec.mockResolvedValueOnce(docs);

      // Act:
      const result = await repository.findAll(
        { skip: 10, limit: 5 },
        'brasilia_df',
      );

      // Assert:
      expect(weatherModelMock.find).toHaveBeenCalledWith({ cityQueryKey: 'brasilia_df' });
      expect(queryMock.sort).toHaveBeenCalledWith({ recordedAt: -1 });
      expect(queryMock.skip).toHaveBeenCalledWith(10);
      expect(queryMock.limit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(WeatherEntity);
    });
  });

  // -------------------------------------------------------------
  // findByCityKey
  // -------------------------------------------------------------
  describe('findByCityKey', () => {
    it('deve buscar registros pela cityQueryKey, ordenados por recordedAt desc', async () => {
      // Arrange:
      const docs = [
        {
          cityName: 'Brasília',
          cityQueryKey: 'brasilia_df',
          temperature: 25,
          humidity: 60,
          windSpeed: 10,
          recordedAt: new Date('2025-11-26T10:00:00Z'),
        },
      ];
      queryMock.exec.mockResolvedValueOnce(docs);

      // Act:
      const result = await repository.findByCityKey('brasilia_df', { skip: 0, limit: 10 });

      // Assert:
      expect(weatherModelMock.find).toHaveBeenCalledWith({ cityQueryKey: 'brasilia_df' });
      expect(queryMock.sort).toHaveBeenCalledWith({ recordedAt: -1 });
      expect(queryMock.skip).toHaveBeenCalledWith(0);
      expect(queryMock.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(WeatherEntity);
    });
  });

  // -------------------------------------------------------------
  // findLatest
  // -------------------------------------------------------------
  describe('findLatest', () => {
    it('deve retornar o último registro inserido para uma cidade', async () => {
      // Arrange:
      const doc = {
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        recordedAt: new Date('2025-11-26T10:00:00Z'),
      };
      queryMock.exec.mockResolvedValueOnce(doc);

      // Act:
      const result = await repository.findLatest('brasilia_df');

      // Assert:
      expect(weatherModelMock.findOne).toHaveBeenCalledWith({ cityQueryKey: 'brasilia_df' });
      expect(queryMock.sort).toHaveBeenCalledWith({ recordedAt: -1 });
      expect(queryMock.exec).toHaveBeenCalled();
      expect(result).toBeInstanceOf(WeatherEntity);
    });
  });
});
