import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService, CityClimateConfig } from '../../../src/modules/insights/services/insights.service';
import { WeatherRepository } from '../../../src/modules/weather/repositories/weather.repository';
import { BRASILIA_CLIMATE_CONFIG } from '../../../src/modules/weather/config/climate.config';

// Mock do WeatherRepository para simular operações no banco
const weatherRepositoryMock: any = {
  findLastHours: jest.fn(),
  getAverageForPreviousDayHour: jest.fn(),
};

describe('InsightsService', () => {
  let service: InsightsService;

  // Config de cidade base para os testes (Brasília)
  const CITY_CONFIG: CityClimateConfig = {
    cityName: 'Brasília-DF',
    cityQueryKey: 'brasilia_df',
    ...BRASILIA_CLIMATE_CONFIG,
  };

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: WeatherRepository,
          useValue: weatherRepositoryMock,
        },
      ],
    }).compile();

    // Instância do service
    service = module.get<InsightsService>(InsightsService);

    // Reseta mocks antes de cada teste
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------
  // Geração de insights com dados mínimos
  // -------------------------------------------------------------
  it('deve gerar insights básicos quando houver registros recentes', async () => {
    // Arrange:
    const now = new Date();

    // Docs simulados retornados pelo WeatherRepository
    const docs = [
      {
        cityName: 'Brasília-DF',
        cityQueryKey: 'brasilia_df',
        temperature: 25,
        humidity: 50,
        windSpeed: 5,
        recordedAt: now,
      },
      {
        cityName: 'Brasília-DF',
        cityQueryKey: 'brasilia_df',
        temperature: 26,
        humidity: 55,
        windSpeed: 6,
        recordedAt: now,
      },
    ];

    weatherRepositoryMock.findLastHours.mockResolvedValue(docs);
    weatherRepositoryMock.getAverageForPreviousDayHour.mockResolvedValue([]);

    // Act:
    const result = await service.getWeatherInsights(CITY_CONFIG);

    // Assert:
    // Garante que os blocos principais existem
    expect(result.conditions).toBeDefined();
    expect(result.calculations).toBeDefined();
    expect(result.history).toBeDefined();
    expect(result.trends).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.cityName).toBe('Brasília-DF');
    expect(result.cityQueryKey).toBe('brasilia_df');

    // Ajuda o TypeScript a entender que não são undefined
    const conditions = result.conditions!;
    const calculations = result.calculations!;
    const history = result.history!;
    const recommendations = result.recommendations!;

    // Estrutura principal presente
    expect(result).toHaveProperty('conditions');
    expect(result).toHaveProperty('calculations');
    expect(result).toHaveProperty('history');
    expect(result).toHaveProperty('trends');
    expect(result).toHaveProperty('recommendations');

    // Conditions mínimas
    expect(conditions.stats.temperature.avg).toBeDefined();
    expect(conditions.comfort.comfortableCount).toBeGreaterThanOrEqual(0);

    // Calculations dentro da faixa esperada
    expect(calculations.qualityScore).toBeGreaterThanOrEqual(0);
    expect(calculations.qualityScore).toBeLessThanOrEqual(100);

    // History sem dados do dia anterior
    expect(history.historicalComparison).toBeNull();

    // Recommendations como array de strings
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.every((r: any) => typeof r === 'string')).toBe(true);
  });
})
