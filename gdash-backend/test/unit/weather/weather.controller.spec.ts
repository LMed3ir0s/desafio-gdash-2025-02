import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from '../../../src/modules/weather/controllers/weather.controller';
import { WeatherService } from '../../../src/modules/weather/services/weather.service';
import { IngestWeatherDto } from '../../../src/modules/weather/dtos/ingest-weather.dto';
import { BadRequestException } from '@nestjs/common';

// Mock do serviço para simular a lógica de negócio
const mockWeatherService = {
  createWeather: jest.fn(),
  getAllWeather: jest.fn(),
  getLatestWeather: jest.fn(),
  getWeatherLastHours: jest.fn(),
  getBetweenDates: jest.fn(),
  getDailySummary: jest.fn(),
};

// Testes do WeatherController
describe('WeatherController', () => {
  let controller: WeatherController;
  let service: WeatherService;

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        { provide: WeatherService, useValue: mockWeatherService },
      ],
    }).compile();

    // Instâncias dos providers
    controller = module.get<WeatherController>(WeatherController);
    service = module.get<WeatherService>(WeatherService);
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------
  // ingestWeather
  // -----------------------------------------
  describe('ingestWeather', () => {
    it('deve delegar criação de clima para o service', async () => {
      // Arrange:
      const dto: IngestWeatherDto = {
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        recordedAt: new Date().toISOString(),
      };
      const created = { ...dto, id: '1' } as any;
      mockWeatherService.createWeather.mockResolvedValueOnce(created);

      // Act:
      const result = await controller.ingestWeather(dto);

      // Assert:
      expect(mockWeatherService.createWeather).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  // -----------------------------------------
  // getLogs
  // -----------------------------------------
  describe('getLogs', () => {
    it('deve chamar service.getAllWeather com cityQueryKey e page/limit parseados', async () => {
      // Arrange:
      const cityQueryKey = 'brasilia_df';
      const page = '2';
      const limit = '20';
      const expectedOptions = { page: 2, limit: 20 };
      const list = [{ id: '1' }];
      mockWeatherService.getAllWeather.mockResolvedValueOnce(list);

      // Act:
      const result = await controller.getLogs(cityQueryKey, page, limit);

      // Assert:
      expect(mockWeatherService.getAllWeather).toHaveBeenCalledWith(
        cityQueryKey,
        expectedOptions,
      );
      expect(result).toEqual(list);
    });

    it('deve lançar BadRequestException para cityQueryKey vazia', async () => {
      // Arrange:
      const cityQueryKey = '';
      const page = '1';
      const limit = '10';

      // Act & Assert:
      await expect(controller.getLogs(cityQueryKey, page, limit)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // -----------------------------------------
  // getLatest
  // -----------------------------------------
  describe('getLatest', () => {
    it('deve retornar o último registro via service', async () => {
      // Arrange:
      const cityQueryKey = 'brasilia_df';
      const latest = { id: '1' };
      mockWeatherService.getLatestWeather.mockResolvedValueOnce(latest);

      // Act:
      const result = await controller.getLatest(cityQueryKey);
    }
  )});
})
