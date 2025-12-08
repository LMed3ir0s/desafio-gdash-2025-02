import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DailySummary, WeatherRepository } from '../repositories/weather.repository';
import { IngestWeatherDto } from '../dtos/ingest-weather.dto';
import { WeatherEntity } from '../entities/weather.entity';
import { getPagination, PaginationOptions } from 'src/common/utils/pagination.utils';
import { DEFAULT_CITY_QUERY_KEY } from '../config/city.config';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherRepo: WeatherRepository) { }

  // -------------------------------------------------------------
  // Cria registro climático (Cidade Brasília como Default)
  // -------------------------------------------------------------
  async createWeather(data: IngestWeatherDto): Promise<WeatherEntity> {
    if (!data) {
      throw new BadRequestException('Entrada inválida para criação de clima.');
    }

    // Normaliza recordedAt (ISO string sempre)
    const payload: IngestWeatherDto = {
      ...data,
      cityQueryKey: data.cityQueryKey ?? DEFAULT_CITY_QUERY_KEY,
      recordedAt: data.recordedAt
        ? new Date(data.recordedAt).toISOString()
        : new Date().toISOString(),
    };

    const weather = await this.weatherRepo.create(payload);
    return new WeatherEntity(weather);
  }

  // -------------------------------------------------------------
  // Retorna todos os registros climáticos
  // -------------------------------------------------------------
  async getAllWeather(cityQueryKey: string, options?: PaginationOptions): Promise<WeatherEntity[]> {
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório.');
    }

    const { skip, limit } = getPagination(options);
    const weatherList = await this.weatherRepo.findAll({ skip, limit }, cityQueryKey);
    return weatherList.map(w => new WeatherEntity(w));
  }

  // -------------------------------------------------------------
  // Resumo climático de um dia específico
  // -------------------------------------------------------------
  async getDailySummary(date: Date, cityQueryKey: string): Promise<DailySummary | null> {
    if (!date) throw new BadRequestException('Data inválida.');
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório.');
    }

    const [summary] = await this.weatherRepo.dailySummary(date, cityQueryKey);
    return summary ?? null;
  }

  // -------------------------------------------------------------
  // Registros entre duas datas
  // -------------------------------------------------------------
  async getBetweenDates(
    start: Date, end: Date, cityQueryKey: string, options?: PaginationOptions): Promise<WeatherEntity[]> {
    if (!start || !end) throw new BadRequestException('Datas inválidas.');
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório.');
    }

    const { skip, limit } = getPagination(options);
    const list = await this.weatherRepo.findBetween(start, end, { skip, limit }, cityQueryKey);
    return list.map(w => new WeatherEntity(w));
  }

  // -------------------------------------------------------------
  // Registros das últimas X horas
  // -------------------------------------------------------------
  async getWeatherLastHours(hours: number, cityQueryKey: string, options?: PaginationOptions): Promise<WeatherEntity[]> {
    if (!hours || hours <= 0) throw new BadRequestException('Horas inválidas.');
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório.');
    }

    const { skip, limit } = getPagination(options);
    const list = await this.weatherRepo.findLastHours(hours, { skip, limit }, cityQueryKey);
    return list.map(w => new WeatherEntity(w));
  }

  // -------------------------------------------------------------
  // Último registro inserido
  // -------------------------------------------------------------
  async getLatestWeather(cityQueryKey: string): Promise<WeatherEntity> {
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório.');
    }

    const latest = await this.weatherRepo.findLatest(cityQueryKey);
    if (!latest) {
      throw new NotFoundException('Nenhum registro climático encontrado.');
    }

    return new WeatherEntity(latest);
  }
}
