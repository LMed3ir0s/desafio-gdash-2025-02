import { Test, TestingModule } from '@nestjs/testing';
import { WeatherExportService } from '../../../src/modules/weather/services/weather-export.service';
import { WeatherRepository } from '../../../src/modules/weather/repositories/weather.repository';
import { WeatherEntity } from '../../../src/modules/weather/entities/weather.entity';
import { BadRequestException } from '@nestjs/common';
import { ExportWeatherQueryDto } from '../../../src/modules/weather/dtos/export-weather-query.dto';

// Mock do repositório
const mockWeatherRepository = {
  findAll: jest.fn(),
  findBetween: jest.fn(),
};

describe('WeatherExportService', () => {
  let service: WeatherExportService;
  let repository: WeatherRepository;
  let mockWeatherEntity: WeatherEntity;

  // Configuração do módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherExportService,
        { provide: WeatherRepository, useValue: mockWeatherRepository },
      ],
    }).compile();

    // Instâncias dos providers
    service = module.get<WeatherExportService>(WeatherExportService);
    repository = module.get<WeatherRepository>(WeatherRepository) as any;

    mockWeatherEntity = new WeatherEntity({
      cityName: 'Brasília',
      cityQueryKey: 'brasilia_df',
      temperature: 25,
      humidity: 60,
      windSpeed: 10,
      recordedAt: new Date('2025-11-26T10:00:00Z'),
    });
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------
  // generateCsv
  // -----------------------------------------
  describe('generateCsv', () => {
    it('deve usar findBetween quando start e end forem informados', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        start: '2025-11-01T00:00:00Z',
        end: '2025-11-02T00:00:00Z',
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };
      mockWeatherRepository.findBetween.mockResolvedValueOnce([mockWeatherEntity]);

      // Act:
      const csv = await service.generateCsv(query);

      // Assert:
      expect(mockWeatherRepository.findBetween).toHaveBeenCalledTimes(1);
      const [startArg, endArg, optionsArg, cityKeyArg] =
        mockWeatherRepository.findBetween.mock.calls[0];
      expect(startArg).toBeInstanceOf(Date);
      expect(endArg).toBeInstanceOf(Date);
      expect(optionsArg).toEqual({ skip: 0, limit: 1000 });
      expect(cityKeyArg).toBe('brasilia_df');
      expect(csv).toContain('recordedAt,cityName,cityQueryKey,temperature,humidity,windSpeed');
    });

    it('deve usar findAll quando start ou end não forem informados', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };
      mockWeatherRepository.findAll.mockResolvedValueOnce([mockWeatherEntity]);

      // Act:
      const csv = await service.generateCsv(query);

      // Assert:
      expect(mockWeatherRepository.findAll).toHaveBeenCalledWith(
        { skip: 0, limit: 1000 },
        'brasilia_df',
      );
      expect(csv).toContain('Brasília');
    });

    it('deve lançar BadRequestException quando datas inválidas forem informadas', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        start: 'data-invalida',
        end: 'outra-invalida',
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };

      // Act:
      const act = () => service.generateCsv(query);

      // Assert:
      await expect(act()).rejects.toThrow(BadRequestException);
      expect(mockWeatherRepository.findBetween).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando cityQueryKey não for informada', async () => {
      // Arrange – monta query inválida de propósito
      const query = {
        start: '2025-11-01T00:00:00Z',
        end: '2025-11-02T00:00:00Z',
        cityName: 'Brasília',
        // cityQueryKey ausente
      } as any;

      // Act:
      const act = () => service.generateCsv(query);

      // Assert:
      await expect(act()).rejects.toThrow(BadRequestException);
      expect(mockWeatherRepository.findBetween).not.toHaveBeenCalled();
      expect(mockWeatherRepository.findAll).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------
  // generateXlsx
  // -----------------------------------------
  describe('generateXlsx', () => {
    it('deve usar findBetween quando start e end forem informados', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        start: '2025-11-01T00:00:00Z',
        end: '2025-11-02T00:00:00Z',
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };
      mockWeatherRepository.findBetween.mockResolvedValueOnce([mockWeatherEntity]);

      // Act:
      const buffer = await service.generateXlsx(query);

      // Assert:
      expect(mockWeatherRepository.findBetween).toHaveBeenCalledTimes(1);
      const [startArg, endArg, optionsArg, cityKeyArg] =
        mockWeatherRepository.findBetween.mock.calls[0];
      expect(startArg).toBeInstanceOf(Date);
      expect(endArg).toBeInstanceOf(Date);
      expect(optionsArg).toEqual({ skip: 0, limit: 1000 });
      expect(cityKeyArg).toBe('brasilia_df');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('deve usar findAll quando start ou end não forem informados', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };
      mockWeatherRepository.findAll.mockResolvedValueOnce([mockWeatherEntity]);

      // Act:
      const buffer = await service.generateXlsx(query);

      // Assert:
      expect(mockWeatherRepository.findAll).toHaveBeenCalledWith(
        { skip: 0, limit: 1000 },
        'brasilia_df',
      );
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('deve lançar BadRequestException quando cityQueryKey não for informada', async () => {
      // Arrange:
      const query = {
        cityName: 'Brasília',
        // cityQueryKey ausente
      } as any;

      // Act:
      const act = () => service.generateXlsx(query);

      // Assert:
      await expect(act()).rejects.toThrow(BadRequestException);
      expect(mockWeatherRepository.findBetween).not.toHaveBeenCalled();
      expect(mockWeatherRepository.findAll).not.toHaveBeenCalled();
    });
  });
});
