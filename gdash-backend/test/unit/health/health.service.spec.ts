import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthService, ApiHealth } from '../../../src/modules/health/services/health.service';
import { Logger } from '@nestjs/common';

// Factory de mock da conexão Mongoose
const createConnectionMock = () => {
  const pingMock = jest.fn();
  const adminMock = jest.fn(() => ({ ping: pingMock }));

  return {
    db: {
      admin: adminMock,
    },
    __pingMock: pingMock,
    __adminMock: adminMock,
  };
};

// Testes do HealthService
describe('HealthService', () => {
  let service: HealthService;
  let connectionMock: ReturnType<typeof createConnectionMock>;

  // Módulo de teste
  beforeEach(async () => {
    connectionMock = createConnectionMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: connectionMock,
        },
      ],
    }).compile();

    // Instância do service
    service = module.get<HealthService>(HealthService);

    // Removendo logs no console durante os testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  // Limpa os mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // checkApp
  // -------------------------------------------------------------------
  it('deve retornar status "up" e mensagem correta em checkApp', async () => {
    // Act:
    const result = await service.checkApp();

    // Assert:
    expect(result).toEqual({
      status: 'up',
      message: 'API backend está em execução.',
    });
  });

  // -------------------------------------------------------------------
  // checkDatabase - sucesso
  // -------------------------------------------------------------------
  it('deve retornar status "up" em checkDatabase quando o ping for bem-sucedido', async () => {
    // Arrange:
    connectionMock.__pingMock.mockResolvedValueOnce(undefined);

    // Act:
    const result = await service.checkDatabase();

    // Assert:
    expect(connectionMock.__adminMock).toHaveBeenCalledTimes(1);
    expect(connectionMock.__pingMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'up',
      message: 'Conexão com o MongoDB ativa.',
    });
  });

  // -------------------------------------------------------------------
  // checkDatabase - falha
  // -------------------------------------------------------------------
  it('deve retornar status "down" em checkDatabase quando o ping falhar', async () => {
    // Arrange:
    connectionMock.__pingMock.mockRejectedValueOnce(
      new Error('Erro de conexão simulado'),
    );

    // Act:
    const result = await service.checkDatabase();

    // Assert:
    expect(result.status).toBe('down');
    expect(result.message).toContain('Falha ao conectar no MongoDB.');
    expect(result.message).toContain('Erro de conexão simulado');
  });

  // -------------------------------------------------------------------
  // checkAll - status ok
  // -------------------------------------------------------------------
  it('deve retornar status "ok" em checkAll quando o database estiver "up"', async () => {
    // Arrange:
    connectionMock.__pingMock.mockResolvedValueOnce(undefined);

    // Act:
    const result: ApiHealth = await service.checkAll();

    // Assert:
    expect(result.status).toBe('ok');
    expect(result.services.app.status).toBe('up');
    expect(result.services.database.status).toBe('up');
    expect(typeof result.timestamp).toBe('string');
  });

  // -------------------------------------------------------------------
  // checkAll - status degraded
  // -------------------------------------------------------------------
  it('deve retornar status "degraded" em checkAll quando o database estiver "down"', async () => {
    // Arrange:
    connectionMock.__pingMock.mockRejectedValueOnce(
      new Error('Erro de conexão simulado'),
    );

    // Act:
    const result: ApiHealth = await service.checkAll();

    // Assert:
    expect(result.status).toBe('degraded');
    expect(result.services.app.status).toBe('up');
    expect(result.services.database.status).toBe('down');
  });
});
