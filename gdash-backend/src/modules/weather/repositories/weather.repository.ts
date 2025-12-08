import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from '../schemas/weather.schema';
import { IngestWeatherDto } from '../dtos/ingest-weather.dto';
import { WeatherEntity } from '../entities/weather.entity';

// Interface para opções de paginação
interface PaginationParams {
  skip: number;
  limit: number;
}
// Interface para Resumo climático de um dia
export interface DailySummary {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  avgHum: number;
  minHum: number;
  maxHum: number;
  count: number;
}

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) { }

  // -------------------------------------------------------------
  // Converte um documento do MongoDB para a entidade de domínio.
  // -------------------------------------------------------------
  private toEntity(doc: WeatherDocument): WeatherEntity {
    return new WeatherEntity({
      cityName: doc.cityName,
      cityQueryKey: doc.cityQueryKey,
      temperature: doc.temperature,
      humidity: doc.humidity,
      windSpeed: doc.windSpeed,
      recordedAt: doc.recordedAt,
    });
  }
  // -------------------------------------------------------------
  // Converte vários documentos.
  // -------------------------------------------------------------
  private toEntities(docs: WeatherDocument[]): WeatherEntity[] {
    return docs
      .map(d => this.toEntity(d))
      .filter((e): e is WeatherEntity => e !== undefined);
  }

  // -------------------------------------------------------------
  // Cria um novo registro climático no banco.
  // -------------------------------------------------------------
  async create(data: IngestWeatherDto): Promise<WeatherEntity> {
    const created = new this.weatherModel(data);
    const saved = await created.save();

    return this.toEntity(saved);
  }

  // -------------------------------------------------------------
  // Retorna todos os registros climáticos de uma cidade, Ordenados do mais recente para o mais antigo.
  // -------------------------------------------------------------
  async findAll(
    { skip, limit }: PaginationParams, cityQueryKey: string): Promise<WeatherEntity[]> {
    const docs = await this.weatherModel
      .find({ cityQueryKey })
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return this.toEntities(docs);
  }
  // -------------------------------------------------------------
  // Busca registros por cidade.
  // -------------------------------------------------------------
  async findByCityKey(cityQueryKey: string, { skip, limit }: PaginationParams): Promise<WeatherEntity[]> {
    const docs = await this.weatherModel
      .find({ cityQueryKey })
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return this.toEntities(docs);
  }

  // -------------------------------------------------------------
  // Retorna o último registro inserido. (Usado para insights e dashboards real-time)
  // -------------------------------------------------------------
  async findLatest(cityQueryKey: string): Promise<WeatherEntity | null> {
    const doc = await this.weatherModel
      .findOne({ cityQueryKey })
      .sort({ recordedAt: -1 })
      .exec();

    return doc ? this.toEntity(doc) : null;
  }

  // -------------------------------------------------------------
  // Gera resumo de um dia:
  // - temperatura média/mín/máx
  // - umidade média/mín/máx
  // - total de registros
  // -------------------------------------------------------------
  async dailySummary(date: Date, cityQueryKey: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return this.weatherModel.aggregate([
      {
        $match: {
          recordedAt: { $gte: start, $lte: end },
          cityQueryKey,
        },
      },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          avgHum: { $avg: '$humidity' },
          minHum: { $min: '$humidity' },
          maxHum: { $max: '$humidity' },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  // -------------------------------------------------------------
  // Média histórica por hora
  // (ex.: qual a média às 14h considerando todos os dias?)
  // -------------------------------------------------------------
  async getAverageForHour(hour: number, cityQueryKey: string) {
    return this.weatherModel.aggregate([
      { $match: { cityQueryKey } },
      {
        $project: {
          hour: { $hour: '$recordedAt' },
          temperature: 1,
          humidity: 1,
          windSpeed: 1,
        },
      },
      { $match: { hour } },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          avgHum: { $avg: '$humidity' },
          avgWind: { $avg: '$windSpeed' },
        },
      },
    ]);
  }

  // -------------------------------------------------------------
  // Busca registros entre duas datas (intervalo) para uma cidade.
  // -------------------------------------------------------------
  async findBetween(start: Date, end: Date, options: PaginationParams, cityQueryKey: string): Promise<WeatherEntity[]> {
    const query = this.weatherModel
      .find({
        recordedAt: { $gte: start, $lte: end },
        cityQueryKey,
      })
      .sort({ recordedAt: -1 });

    if (options) query.skip(options.skip).limit(options.limit);

    const docs = await query.exec();
    return this.toEntities(docs);
  }

  // -------------------------------------------------------------
  // Busca registros das últimas X horas para uma cidade.
  // -------------------------------------------------------------
  async findLastHours(hours: number, options: PaginationParams, cityQueryKey: string): Promise<WeatherEntity[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const query = this.weatherModel
      .find({
        recordedAt: { $gte: since },
        cityQueryKey,
      })
      .sort({ recordedAt: -1 });

    if (options) query.skip(options.skip).limit(options.limit);

    const docs = await query.exec();
    return this.toEntities(docs);
  }

  // -------------------------------------------------------------
  // Média do mesmo horário do dia anterior para uma cidade
  // -------------------------------------------------------------
  async getAverageForPreviousDayHour(hour: number, cityQueryKey: string) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const start = new Date(yesterday);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(yesterday);
    end.setHours(hour, 59, 59, 999);

    return this.weatherModel.aggregate([
      {
        $match: {
          cityQueryKey,
          recordedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          avgHum: { $avg: '$humidity' },
          avgWind: { $avg: '$windSpeed' },
        },
      },
    ]);
  }
}