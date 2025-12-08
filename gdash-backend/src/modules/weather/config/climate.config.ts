// -------------------------------------------------------------
// Constantes baseadas em clima do DF:
// - Temperatura:
//      Frio < 18°C
//      Ameno 18–24°C
//      Quente 25–30°C
//      Muito quente > 30°C
//  
//  - Umidade:
//      Baixa < 30%
//      Ideal 30–60%
//      Alta > 60%
//  
//  - Vento:
//      Forte > 20 km/h
// -------------------------------------------------------------

// -------------------------------------------------------------
// Buckets usados na WeatherEntity (categorias de DF)
// -------------------------------------------------------------
export const BRASILIA_BUCKETS = {
  TEMP_COLD: 18,
  TEMP_WARM_MIN: 18,
  TEMP_WARM_MAX: 24,
  TEMP_HOT_MIN: 24,
  TEMP_HOT_MAX: 30,
  HUM_LOW: 30,
  HUM_IDEAL_MIN: 30,
  HUM_IDEAL_MAX: 60,
  WIND_STRONG: 20,
};


// -------------------------------------------------------------
// Faixas de conforto e limites climáticos para Brasília-DF
// Faixas de conforto térmico (°C)
// Faixas de umidade ideal (%)
// Limites de alerta de umidade baixa/alta
// Limites de vento forte (km/h)
// Janela de análise em horas (para insights atuais)
// Limite de registros para análise
// -------------------------------------------------------------
export const BRASILIA_CLIMATE_CONFIG = {
  comfortTempMin: 20,
  comfortTempMax: 27,
  comfortHumMin: 30,
  comfortHumMax: 60,
  criticalLowHumidity: 20,
  criticalHighHumidity: 80,
  strongWindThreshold: 20,
  analysisPeriodHours: 24,
  maxRecords: 1000,
};

