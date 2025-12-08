import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export type OverallStatus = 'ok' | 'degraded';
export type ComponentStatus = 'up' | 'down';

export interface ComponentHealth {
  status: ComponentStatus;
  message: string;
}

export interface ApiHealth {
  status: OverallStatus;
  timestamp: string;
  services: {
    app: ComponentHealth;
    database: ComponentHealth;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  // -----------------------------------------------------------
  // Check API-Backend
  // -----------------------------------------------------------
  async checkApp(): Promise<ComponentHealth> {
    return { 
        status: 'up',
        message: 'API backend está em execução.'
    };
  }

  // -----------------------------------------------------------
  // Check MongoDB (ping leve)
  // -----------------------------------------------------------
  async checkDatabase(): Promise<ComponentHealth> {
    try {
        const db = this.connection.db;

        if (!db) {
            throw new Error('Falha ao conectar no MongoDB.');
        }

        await db.admin().ping();

        return {
            status: 'up',
            message: 'Conexão com o MongoDB ativa.',
        };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);

      this.logger.error(
        'Database health check falhou.',
        error,
      );

      return {
        status: 'down',
        message: `Falha ao conectar no MongoDB. Detalhes: ${error}`
      };
    }
  }

  // -----------------------------------------------------------
  // Agregador de saúde da API (usado pelo health.controller)
  // -----------------------------------------------------------
  async checkAll(): Promise<ApiHealth> {
    const [app, database] = await Promise.all([
      this.checkApp(),
      this.checkDatabase(),
    ]);

    const degraded = database.status === 'down';

    return {
      status: degraded ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      services: {
        app,
        database,
      },
    };
  }
}
