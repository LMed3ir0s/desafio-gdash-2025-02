import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../src/modules/health/controllers/health.controller';
import { HealthService, ApiHealth } from '../../../src/modules/health/services/health.service';

// Mock do HealthService
const mockHealthService: Partial<Record<keyof HealthService, jest.Mock>> = {
  checkAll: jest.fn(),
} as any;

// Testes do HealthController
describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  // Módulo de teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    // Instâncias do controller e service
    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // check
  // -------------------------------------------------------------------
  it('deve delegar para HealthService.checkAll e retornar o resultado', async () => {
    // Arrange:
    const fakeHealth: ApiHealth = {
      status: 'ok',
      timestamp: '2025-11-28T15:00:00.000Z',
      services: {
        app: {
          status: 'up',
          message: 'API backend está em execução.',
        },
        database: {
          status: 'up',
          message: 'Conexão com o MongoDB ativa.',
        },
      },
    };

    mockHealthService.checkAll!.mockResolvedValueOnce(fakeHealth);

    // Act:
    const result = await controller.check();

    // Assert:
    expect(healthService.checkAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeHealth);
  });
});
