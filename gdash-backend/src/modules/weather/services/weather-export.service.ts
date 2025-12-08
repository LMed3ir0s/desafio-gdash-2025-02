import { Injectable, BadRequestException } from '@nestjs/common';
import { WeatherRepository } from '../repositories/weather.repository';
import { ExportWeatherQueryDto } from '../dtos/export-weather-query.dto';
import { WeatherEntity } from '../entities/weather.entity';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

// Define limite
const DEFAULT_EXPORT_LIMIT = 1000;

@Injectable()
export class WeatherExportService {
  constructor(private readonly weatherRepo: WeatherRepository) {}

  // -------------------------------------------------------------
  // Busca dados para exportação
  // -------------------------------------------------------------
  private async getDataForExport(query: ExportWeatherQueryDto): Promise<WeatherEntity[]> {
    const { start, end, cityQueryKey } = query;
    let list: WeatherEntity[] = [];

    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório para exportação');
    }

    if ((start && !end) || (!start && end)) {
      throw new BadRequestException('Para exportação por intervalo, informe start e end.');
    }

    // Com intervalo de datas
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Parâmetros de data inválidos para exportação');
      }

      list = await this.weatherRepo.findBetween(
        startDate,
        endDate,
        { skip: 0, limit: DEFAULT_EXPORT_LIMIT },
        cityQueryKey,
      );
    }

    // Sem intervalo de datas
    if (!start || !end) {
      list = await this.weatherRepo.findAll(
        { skip: 0, limit: DEFAULT_EXPORT_LIMIT },
        cityQueryKey,
      );
    }

    return list;
  }

  // -------------------------------------------------------------
  // Gera CSV em memória
  // -------------------------------------------------------------
  async generateCsv(query: ExportWeatherQueryDto): Promise<string> {
    const data = await this.getDataForExport(query);

    const header = 'recordedAt,cityName,cityQueryKey,temperature,humidity,windSpeed';
    const lines = data.map(w => {
      const recordedAt =
        w.recordedAt instanceof Date
          ? w.recordedAt.toISOString()
          : new Date(w.recordedAt).toISOString();

      return `${recordedAt},${w.cityName},${w.cityQueryKey},${w.temperature},${w.humidity},${w.windSpeed}`;
    });

    return [header, ...lines].join('\n');
  }

  // -------------------------------------------------------------
  // Gera XLSX em memória
  // -------------------------------------------------------------
  async generateXlsx(query: ExportWeatherQueryDto): Promise<Buffer> {
    const data = await this.getDataForExport(query);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weather');

    sheet.addRow(['recordedAt', 'cityName', 'cityQueryKey', 'temperature', 'humidity', 'windSpeed']);

    data.forEach(w => {
      sheet.addRow([
        w.recordedAt instanceof Date ? w.recordedAt : new Date(w.recordedAt),
        w.cityName,
        w.cityQueryKey,
        w.temperature,
        w.humidity,
        w.windSpeed,
      ]);
    });

    // Converte o ArrayBuffer gerado pelo ExcelJS em Buffer do Node.js
    // para envio binário na resposta HTTP.
    const xlsxArrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(xlsxArrayBuffer as ArrayBuffer);
  }
}
