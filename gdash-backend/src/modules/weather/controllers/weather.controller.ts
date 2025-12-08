import { Controller, Get, Post, Query, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { WeatherService } from '../services/weather.service';
import { IngestWeatherDto } from '../dtos/ingest-weather.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { parsePagination } from 'src/common/utils/pagination.utils';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  // -------------------------------------------------------------
  // Cria novo registro climático (rota pública - sensores/worker)
  // -------------------------------------------------------------
  @Post('logs')
  async ingestWeather(@Body() data: IngestWeatherDto) {
    return this.weatherService.createWeather(data);
  }

  // -------------------------------------------------------------
  // Lista registros climáticos com paginação
  // Apenas usuários autenticados
  // -------------------------------------------------------------
  @Get('logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async getLogs(
    @Query('cityQueryKey') cityQueryKey: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório');
    }

    const paginationOptions = parsePagination(page, limit);
    return this.weatherService.getAllWeather(cityQueryKey, paginationOptions);
  }

  // -------------------------------------------------------------
  // Último registro inserido
  // -------------------------------------------------------------
  @Get('logs/latest')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async getLatest(@Query('cityQueryKey') cityQueryKey: string) {
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório');
    }

    return this.weatherService.getLatestWeather(cityQueryKey);
  }

  // -------------------------------------------------------------
  // Busca últimas N horas
  // -------------------------------------------------------------
  @Get('logs/last-hours')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async getLastHours(
    @Query('hours') hours: string,
    @Query('cityQueryKey') cityQueryKey: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsed = Number(hours);
    if (isNaN(parsed) || parsed <= 0) {
      throw new BadRequestException('Parâmetro hours inválido');
    }
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório');
    }

    const paginationOptions = parsePagination(page, limit);
    return this.weatherService.getWeatherLastHours(parsed, cityQueryKey, paginationOptions);
  }

  // -------------------------------------------------------------
  // Busca entre datas
  // -------------------------------------------------------------
  @Get('logs/between')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async getBetween(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('cityQueryKey') cityQueryKey: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('start e end são obrigatórios');
    }
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório');
    }

    const paginationOptions = parsePagination(page, limit);
    return this.weatherService.getBetweenDates(
      new Date(start),
      new Date(end),
      cityQueryKey,
      paginationOptions,
    );
  }

  // -------------------------------------------------------------
  // Resumo diário agregado
  // -------------------------------------------------------------
  @Get('logs/summary')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async dailySummary(
    @Query('date') date: string,
    @Query('cityQueryKey') cityQueryKey: string,
  ) {
    if (!date) {
      throw new BadRequestException('date é obrigatório');
    }
    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório');
    }

    return this.weatherService.getDailySummary(new Date(date), cityQueryKey);
  }
}