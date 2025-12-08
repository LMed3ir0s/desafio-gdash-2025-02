import os
from dataclasses import dataclass
from .env_loader import load_environment

# Objeto imutável com todas as configurações tipadas do serviço.
@dataclass(frozen=True)
class Settings:
    # Cidade para coleta
    city_name: str
    city_query_key: str

    # Coordenadas usadas na chamada à Open-Meteo
    openmeteo_lat: float
    openmeteo_lon: float

    # Intervalo entre coletas em segundos
    collect_interval_seconds: int

    # Configuração de conexão com RabbitMQ
    rabbitmq_url: str
    rabbitmq_queue: str

    # Nível de log padrão da aplicação
    log_level: str = "INFO"

# Factory que carrega o .env/variáveis de ambiente e monta o Settings.
def get_settings() -> Settings:
    # Carrega o arquivo .env
    load_environment()

    # Lê nome e chave da cidade com defaults seguros.
    city_name = os.getenv("CITY_NAME", "Brasilia-DF")
    city_query_key = os.getenv("CITY_QUERY_KEY", "brasilia_df")

    # Converte coordenadas para float, com fallback de Brasília.
    openmeteo_lat = float(os.getenv("OPENMETEO_LAT", "-15.793889"))
    openmeteo_lon = float(os.getenv("OPENMETEO_LON", "-47.882778"))

    # Intervalo de coleta em segundos (default: 60s).
    collect_interval_seconds = int(os.getenv("COLLECT_INTERVAL_SECONDS", "60"))

    # URL e fila do RabbitMQ, alinhadas ao docker-compose.
    rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://etl_weather:etl_weather_pass@rabbitmq:5672/")
    rabbitmq_queue = os.getenv("RABBITMQ_QUEUE", "weather_logs")

    # Normaliza nível de log para caixa alta.
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    return Settings(
        city_name=city_name,
        city_query_key=city_query_key,
        openmeteo_lat=openmeteo_lat,
        openmeteo_lon=openmeteo_lon,
        collect_interval_seconds=collect_interval_seconds,
        rabbitmq_url=rabbitmq_url,
        rabbitmq_queue=rabbitmq_queue,
        log_level=log_level,
    )
