import { Controller, Get, Query, UseGuards, BadRequestException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { InsightsService, CityClimateConfig } from '../services/insights.service';
import { GetInsightsQueryDto } from '../../weather/dtos/get-insights-query.dto';
import {DEFAULT_CITY_NAME, CITY_KEY_BY_NAME, DEFAULT_CITY_QUERY_KEY} from '../../weather/config/city.config';
import { BRASILIA_CLIMATE_CONFIG } from '../../weather/config/climate.config';

@Controller('weather/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  // Gera insights climáticos para uma cidade.
  // - Cliente envia apenas cityName
  // - Backend resolve cityQueryKey internamente a partir do nome.
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  async getInsights(
    @Query() query: GetInsightsQueryDto,
  ): Promise<any> {
    const finalCityName = query.cityName ?? DEFAULT_CITY_NAME;

    // Resolve a key interna a partir do nome amigável.
    const cityQueryKey =
      CITY_KEY_BY_NAME[finalCityName] ?? DEFAULT_CITY_QUERY_KEY;

    if (!cityQueryKey) {
      // Protege contra nomes inválidos e mantém o mapeamento fechado no backend.
      throw new BadRequestException(
        'Cidade inválida ou não suportada para insights.',
      );
    }

    // Config base da cidade: nome de exibição + chave interna + limiares climáticos.
    const cityConfig: CityClimateConfig = {
      cityName: finalCityName,
      cityQueryKey,
      ...BRASILIA_CLIMATE_CONFIG,
    };

    // Service de domínio cuida de toda a lógica de insights.
    return this.insightsService.getWeatherInsights(cityConfig);
  }
}
