import { Injectable, BadRequestException } from '@nestjs/common';
import { WeatherRepository } from '../../weather/repositories/weather.repository';
import { WeatherEntity } from '../../weather/entities/weather.entity';
import { BRASILIA_CLIMATE_CONFIG } from '../../weather/config/climate.config';

// -------------------------------------------------------------
// Configuração da cidade (limiares de conforto climático)
// -------------------------------------------------------------
export interface CityClimateConfig {
  cityName: string;
  cityQueryKey: string;
  comfortTempMin: number;
  comfortTempMax: number;
  comfortHumMin: number;
  comfortHumMax: number;
  criticalLowHumidity: number;
  criticalHighHumidity: number;
  strongWindThreshold: number;
  analysisPeriodHours: number;
  maxRecords: number;
}

// Config padrão para Brasília-DF
const BRASILIA_CONFIG: CityClimateConfig = {
  cityName: 'Brasília-DF',
  cityQueryKey: 'brasilia_df',
  ...BRASILIA_CLIMATE_CONFIG,
};

interface WeatherQualityCalculations {
  heatIndex: number;
  windChill: number;
  qualityScore: number;
}

@Injectable()
export class InsightsService {
  constructor(private readonly weatherRepo: WeatherRepository) {}

  // -------------------------------------------------------------
  // Gera insights para uma cidade
  // -------------------------------------------------------------
  async getWeatherInsights(cityConfig: CityClimateConfig = BRASILIA_CONFIG) {
    const {
      analysisPeriodHours,
      maxRecords,
      cityName,
      cityQueryKey,
    } = cityConfig;

    if (!cityQueryKey) {
      throw new BadRequestException('cityQueryKey é obrigatório para gerar insights.');
    }

    const docs = await this.weatherRepo.findLastHours(
      analysisPeriodHours,
      { skip: 0, limit: maxRecords },
      cityQueryKey,
    );

    const data = docs.map((w) => new WeatherEntity(w));

    if (data.length === 0) {
      return {
        cityName,
        cityQueryKey,
        count: 0,
        periodHours: analysisPeriodHours,
        message: 'Nenhum dado climático disponível para gerar insights.',
      };
    }

    // Condições climáticas agregadas (quente/frio/úmido/seco/vento)
    const conditions = this.buildConditions(data, cityConfig);

    // Cálculos derivados (heat index, wind chill, quality score)
    const calculations = this.buildCalculations(cityConfig, conditions);

    // Histórico / comparação (média histórica mesma hora/dia + anomalias)
    const history = await this.buildHistoryAndAnomalies(cityConfig, conditions);

    // Tendências (subindo/descendo + médias diárias recentes)
    const trends = this.buildTrends(data);

    // Recomendações textuais
    const recommendations = this.buildRecommendations(
      cityConfig,
      conditions,
      calculations,
      history,
      trends,
    );

    return {
      cityName,
      cityQueryKey,
      periodHours: analysisPeriodHours,
      count: data.length,
      conditions,
      calculations,
      history,
      trends,
      recommendations,
    };
  }

  // -------------------------------------------------------------
  // Condições climáticas agregadas
  // -------------------------------------------------------------
  private buildConditions(data: WeatherEntity[], cfg: CityClimateConfig) {
    const temps = data.map((w) => w.temperature);
    const hums = data.map((w) => w.humidity);
    const winds = data.map((w) => w.windSpeed);

    const avg = (arr: number[]) =>
      arr.reduce((sum, n) => sum + n, 0) / arr.length;

    const stats = {
      temperature: {
        avg: Number(avg(temps).toFixed(1)),
        min: Math.min(...temps),
        max: Math.max(...temps),
      },
      humidity: {
        avg: Number(avg(hums).toFixed(1)),
        min: Math.min(...hums),
        max: Math.max(...hums),
      },
      windSpeed: {
        avg: Number(avg(winds).toFixed(1)),
        min: Math.min(...winds),
        max: Math.max(...winds),
      },
    };

    const temperatureBuckets = {
      cold: data.filter((w) => w.isCold()).length,
      warm: data.filter((w) => w.isWarm()).length,
      hot: data.filter((w) => w.isHot()).length,
      veryHot: data.filter((w) => w.isVeryHot()).length,
    };

    const humidityBuckets = {
      low: data.filter((w) => w.isLowHumidity()).length,
      ideal: data.filter((w) => w.isIdealHumidity()).length,
      high: data.filter((w) => w.isHighHumidity()).length,
    };

    const windBuckets = {
      strong: data.filter((w) => w.isWindStrong()).length,
      weakOrModerate: data.filter((w) => !w.isWindStrong()).length,
    };

    const isComfortable = (w: WeatherEntity) =>
      w.temperature >= cfg.comfortTempMin &&
      w.temperature <= cfg.comfortTempMax &&
      w.humidity >= cfg.comfortHumMin &&
      w.humidity <= cfg.comfortHumMax &&
      w.windSpeed <= cfg.strongWindThreshold;

    const comfortableCount = data.filter(isComfortable).length;
    const uncomfortableCount = data.length - comfortableCount;

    const alerts: string[] = [];
    const lowHumidityRatio = humidityBuckets.low / data.length;

    if (lowHumidityRatio > 0.3 || stats.humidity.min <= cfg.criticalLowHumidity) {
      alerts.push('Umidade muito baixa em grande parte das medições — hidrate-se.');
    }
    if (temperatureBuckets.veryHot > 0 || stats.temperature.max >= 35) {
      alerts.push('Períodos de calor intenso detectados — evite exposição prolongada ao sol.');
    }
    if (windBuckets.strong > 0 || stats.windSpeed.max > cfg.strongWindThreshold) {
      alerts.push('Ventos fortes registrados em parte das medições.');
    }

    return {
      stats,
      temperatureBuckets,
      humidityBuckets,
      windBuckets,
      comfort: {
        comfortableCount,
        uncomfortableCount,
      },
      alerts,
    };
  }

  // -------------------------------------------------------------
  // Cálculos: índice de calor, sensação térmica, índice de qualidade
  // -------------------------------------------------------------
  private buildCalculations(cfg: CityClimateConfig, conditions: any): WeatherQualityCalculations {
    const { temperature, humidity, windSpeed } = conditions.stats;

    // Índice de calor (Heat Index) em °C
    // Fórmula polinomial oficial da NOAA, em °F, convertida de/para °C. [web:200][web:234]
    const calcHeatIndex = (tempC: number, hum: number) => {
      const T = (tempC * 9) / 5 + 32;
      const R = hum;

      const HI =
        -42.379 +
        2.04901523 * T +
        10.14333127 * R -
        0.22475541 * T * R -
        0.00683783 * T * T -
        0.05481717 * R * R +
        0.00122874 * T * T * R +
        0.00085282 * T * R * R -
        0.00000199 * T * T * R * R;

      return Number(((HI - 32) * 5 / 9).toFixed(1));
    };

    // Sensação térmica de frio (Wind Chill) em °C
    // Fórmula padrão com T em °C e V em km/h. [web:189][web:192]
    const calcWindChill = (tempC: number, windKmH: number) => {
      if (tempC > 10 || windKmH < 4.8) {
        return tempC;
      }

      const V = windKmH;
      const WC =
        13.12 +
        0.6215 * tempC +
        (-11.37) * Math.pow(V, 0.16) +
        0.3965 * tempC * Math.pow(V, 0.16);

      return Number(WC.toFixed(1));
    };

    const heatIndex = calcHeatIndex(temperature.avg, humidity.avg);
    const windChill = calcWindChill(temperature.avg, windSpeed.avg);

    let score = 100;

    // Temperatura
    const applyTemperaturePenalty = () => {
      const temp = temperature.avg;

      const isVeryOutOfComfort =
        temp < cfg.comfortTempMin - 4 ||
        temp > cfg.comfortTempMax + 4;

      if (isVeryOutOfComfort) {
        score -= 25;
        return;
      }

      const isOutOfComfort =
        temp < cfg.comfortTempMin ||
        temp > cfg.comfortTempMax;

      if (isOutOfComfort) {
        score -= 10;
      }
    };

    // Umidade
    const applyHumidityPenalty = () => {
      const hum = humidity.avg;

      const isVeryOutOfComfort =
        hum < cfg.comfortHumMin - 10 ||
        hum > cfg.comfortHumMax + 10;

      if (isVeryOutOfComfort) {
        score -= 25;
        return;
      }

      const isOutOfComfort =
        hum < cfg.comfortHumMin ||
        hum > cfg.comfortHumMax;

      if (isOutOfComfort) {
        score -= 10;
      }
    };

    // Vento
    const applyWindPenalty = () => {
      const wind = windSpeed.avg;

      const isVeryStrong = wind > cfg.strongWindThreshold + 10;
      if (isVeryStrong) {
        score -= 15;
        return;
      }

      const isStrong = wind > cfg.strongWindThreshold;
      if (isStrong) {
        score -= 5;
      }
    };

    applyTemperaturePenalty();
    applyHumidityPenalty();
    applyWindPenalty();

    if (score < 0) {
      score = 0;
    }

    return {
      heatIndex,
      windChill,
      qualityScore: score,
    };
  }

  // -------------------------------------------------------------
  // Histórico / média histórica / anomalias
  // -------------------------------------------------------------
  private async buildHistoryAndAnomalies(cfg: CityClimateConfig, conditions: any) {
    const now = new Date();
    const currentHour = now.getHours();

    const historical = await this.weatherRepo.getAverageForPreviousDayHour(
      currentHour,
      cfg.cityQueryKey,
    );

    const hist = Array.isArray(historical) && historical[0]
      ? {
          hour: currentHour,
          avgTemp: Number(historical[0].avgTemp?.toFixed?.(1) ?? historical[0].avgTemp),
          avgHum: Number(historical[0].avgHum?.toFixed?.(1) ?? historical[0].avgHum),
          avgWind: Number(historical[0].avgWind?.toFixed?.(1) ?? historical[0].avgWind),
        }
      : null;

    const anomalies: string[] = [];
    const { temperature, humidity } = conditions.stats;

    if (
      temperature.max > (hist?.avgTemp ?? temperature.avg) + 5 ||
      temperature.min < (hist?.avgTemp ?? temperature.avg) - 5
    ) {
      anomalies.push('Temperaturas atípicas em relação à média histórica da mesma hora.');
    }

    if (
      humidity.min < cfg.criticalLowHumidity ||
      humidity.max > cfg.criticalHighHumidity
    ) {
      anomalies.push('Umidade fora do padrão esperado em parte das medições.');
    }

    // Mensagem informando ausência de histórico de ontem
    const notes: string[] = [];
    if (!hist) {
      notes.push(`Sem dados históricos para o mesmo horário do dia anterior em ${cfg.cityName}`);
    }

    return {
      historicalComparison: hist,
      anomalies,
    };
  }

  // -------------------------------------------------------------
  // Tendências (temperatura subindo/descendo + médias diárias)
  // -------------------------------------------------------------
  private buildTrends(data: WeatherEntity[]) {
    if (data.length < 4) {
      return {
        temperatureTrend: 'indefinida',
        notes: ['Poucos dados para análise de tendência.'],
      };
    }

    const sorted = [...data].sort(
      (a, b) => +a.recordedAt - +b.recordedAt,
    );

    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half);
    const secondHalf = sorted.slice(half);

    const avg = (arr: number[]) =>
      arr.reduce((sum, n) => sum + n, 0) / arr.length;

    const avgFirst = avg(firstHalf.map((w) => w.temperature));
    const avgSecond = avg(secondHalf.map((w) => w.temperature));
    const diff = avgSecond - avgFirst;

    let trend = 'estável';
    if (diff > 1) {
      trend = 'aquecimento';
    }
    if (diff < -1) {
      trend = 'resfriamento';
    }

    const dailyAvgTemp = avg(sorted.map((w) => w.temperature));

    return {
      temperatureTrend: trend,
      deltaTemp: Number(diff.toFixed(1)),
      dailyAvgTemp: Number(dailyAvgTemp.toFixed(1)),
    };
  }

  // -------------------------------------------------------------
  // Recomendações textuais
  // -------------------------------------------------------------
  private buildRecommendations(
    cfg: CityClimateConfig,
    conditions: any,
    calculations: WeatherQualityCalculations,
    history: any,
    trends: any): string[] {
    const recs: string[] = [];

    const lowHumidity =
      conditions.humidityBuckets.low > 0 ||
      conditions.stats.humidity.min <= cfg.criticalLowHumidity;

    const veryHot =
      conditions.temperatureBuckets.veryHot > 0 ||
      conditions.stats.temperature.max >= 35 ||
      calculations.heatIndex >= 32;

    const strongWind =
      conditions.windBuckets.strong > 0 ||
      conditions.stats.windSpeed.max > cfg.strongWindThreshold;

    if (lowHumidity) {
      recs.push('Hidrate-se — umidade muito baixa em parte das medições.');
    }

    if (veryHot) {
      recs.push('Evite exercício intenso ao ar livre nos horários mais quentes.');
    }

    if (strongWind) {
      recs.push('Atenção a rajadas de vento — fixe objetos soltos em áreas externas.');
    }

    // Comparação com histórico (ex.: mesmo horário do dia anterior)
    const historicalComparison = history?.historicalComparison;

    if (historicalComparison) {
      const currentAvgTemp = conditions.stats.temperature.avg;
      const deltaFromHistory = currentAvgTemp - historicalComparison.avgTemp;

      if (deltaFromHistory >= 5) {
        recs.push(
          `Está significativamente mais quente em relação ao mesmo horário do dia anterior (${historicalComparison.hour}h).`,
        );
      }

      if (deltaFromHistory <= -5) {
        recs.push(
          `Está significativamente mais frio em relação ao mesmo horário do dia anterior (${historicalComparison.hour}h).`,
        );
      }
    }

    // Se não houver histórico
    if (!historicalComparison) {
      const now = new Date();
      const hour = now.getHours();

      recs.push(
        `Ainda não há dados suficientes do dia anterior para comparação no horário das ${hour}h.`,
      );
    }

    if (trends.temperatureTrend === 'aquecimento') {
      recs.push(
        'Tendência de aquecimento nas últimas horas — planeje atividades em horários mais frescos.',
      );
    }

    if (trends.temperatureTrend === 'resfriamento') {
      recs.push(
        'Temperatura em queda — considere roupas adicionais em ambientes externos.',
      );
    }

    if (recs.length === 0) {
      recs.push('Condições climáticas geralmente confortáveis nas últimas horas.');
    }

    return recs;
  }
}

