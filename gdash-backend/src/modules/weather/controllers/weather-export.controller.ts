import { Controller, Get, Query, UseGuards, Res} from '@nestjs/common';
import type { Response } from 'express';
import { WeatherExportService } from '../services/weather-export.service';
import { ExportWeatherQueryDto } from '../dtos/export-weather-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('weather/export') // vira /api/weather/export com prefixo global
export class WeatherExportController {
  constructor(private readonly exportService: WeatherExportService) {}

  // -------------------------------------------------------------
  // Exporta registros climáticos em CSV
  // GET /api/weather/export/csv?start=...&end=...
  // -------------------------------------------------------------
  @Get('csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async exportCsv(
    @Query() query: ExportWeatherQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.generateCsv(query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather-logs.csv"',
    );
    res.send(csv); // browser / frontend baixa o arquivo
  }

  // -------------------------------------------------------------
  // Exporta registros climáticos em XLSX
  // GET /api/weather/export/xlsx?start=...&end=...
  // -------------------------------------------------------------
  @Get('xlsx')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async exportXlsx(
    @Query() query: ExportWeatherQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.generateXlsx(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather-logs.xlsx"',
    );
    res.send(buffer);
  }
}
