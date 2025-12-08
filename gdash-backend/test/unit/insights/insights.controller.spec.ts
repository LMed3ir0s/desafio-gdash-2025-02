import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from '../../../src/modules/insights/controllers/insights.controller';
import { InsightsService, CityClimateConfig } from '../../../src/modules/insights/services/insights.service';
import { DEFAULT_CITY_NAME, DEFAULT_CITY_QUERY_KEY, CITY_KEY_BY_NAME} from '../../../src/modules/weather/config/city.config';
import { BRASILIA_CLIMATE_CONFIG } from '../../../src/modules/weather/config/climate.config';

// Mock do InsightsService para simular a camada de domínio
const insightsServiceMock: any = {
  getWeatherInsights: jest.fn(),
};

describe('WeatherInsightsController', () => {
  let controller: InsightsController;

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: InsightsService,
          useValue: insightsServiceMock,
        },
      ],
    }).compile();

    // Instância do controller
    controller = module.get<InsightsController>(
      InsightsController,
    );

    // Reseta mocks antes de cada teste
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------
  // Cliente não envia cityName -> usa defaults
  // -------------------------------------------------------------
  it('deve usar DEFAULT_CITY_NAME e DEFAULT_CITY_QUERY_KEY quando cityName não for enviado', async () => {
    // Arrange
    const query = {}; // sem cityName
    const fakeResponse = { ok: true };

    insightsServiceMock.getWeatherInsights.mockResolvedValue(fakeResponse);

    // Act
    const result = await controller.getInsights(query as any);

    // Assert
    expect(insightsServiceMock.getWeatherInsights).toHaveBeenCalledTimes(1);

    // Verifica que o config passado para o service usa os defaults
    expect(insightsServiceMock.getWeatherInsights).toHaveBeenCalledWith(
      expect.objectContaining<Partial<CityClimateConfig>>({
        cityName: DEFAULT_CITY_NAME,
        cityQueryKey: DEFAULT_CITY_QUERY_KEY,
        comfortTempMin: BRASILIA_CLIMATE_CONFIG.comfortTempMin,
      }),
    );

    expect(result).toBe(fakeResponse);
  });

  // -------------------------------------------------------------
  // Cliente envia um cityName mapeado
  // -------------------------------------------------------------
  it('deve resolver cityQueryKey a partir do cityName enviado', async () => {
    // Arrange
    const cityName = DEFAULT_CITY_NAME;
    const query = { cityName };
    const expectedKey = CITY_KEY_BY_NAME[cityName];

    const fakeResponse = { ok: true };
    insightsServiceMock.getWeatherInsights.mockResolvedValue(fakeResponse);

    // Act
    const result = await controller.getInsights(query as any);

    // Assert
    expect(insightsServiceMock.getWeatherInsights).toHaveBeenCalledTimes(1);
    expect(insightsServiceMock.getWeatherInsights).toHaveBeenCalledWith(
      expect.objectContaining<Partial<CityClimateConfig>>({
        cityName,
        cityQueryKey: expectedKey,
      }),
    );
    expect(result).toBe(fakeResponse);
  });
});
