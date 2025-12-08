// Cidade/clima padrão do sistema (Brasília-DF).
// Usado por WeatherService (fallback de ingest) e InsightsService (config base de insights).
export const DEFAULT_CITY_NAME = 'Brasília-DF';
export const DEFAULT_CITY_QUERY_KEY = 'brasilia_df';

// Mapa de nomes exibidos -> keys internas
export const CITY_KEY_BY_NAME: Record<string, string> = {
  'Brasília-DF': 'brasilia_df',
  // Futuras cidades:
  // 'São Paulo-SP': 'sao_paulo_sp',
};