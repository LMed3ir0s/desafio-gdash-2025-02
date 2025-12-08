from datetime import datetime
from unittest.mock import MagicMock
from app.config.settings import Settings
from app.models.models import WeatherReading
from app.models.value_objects import City
from app.services.weather_collector_service import WeatherCollectorService
import pytest
from dataclasses import replace

def make_settings() -> Settings:

    # helper: Settings
    return Settings(
        city_name="Brasilia-DF",
        city_query_key="brasilia_df",
        openmeteo_lat=-15.793889,
        openmeteo_lon=-47.882778,
        collect_interval_seconds=33,
        rabbitmq_url="amqp://etl_weather:etl_weather_pass@rabbitmq:5672/",
        rabbitmq_queue="weather_logs",
        log_level="INFO",
    )

# -----------------------------------------------------------
# Teste de sucesso do collect_and_publish
# -----------------------------------------------------------
def test_collect_and_publish_sucesso():

    # Arrange
    settings = make_settings()

    city = City(name=settings.city_name, query_key=settings.city_query_key)
    fake_reading = WeatherReading(
        city=city,
        temperature=25.0,
        humidity=50.0,
        wind_speed=10.0,
        recorded_at=datetime.utcnow(),
    )

    client = MagicMock()
    client.fetch_latest_reading.return_value = fake_reading

    publisher = MagicMock()

    service = WeatherCollectorService(
        settings=settings,
        client=client,
        publisher=publisher,
    )

    # Act
    payload = service.collect_and_publish()

    # Assert
    client.fetch_latest_reading.assert_called_once_with(
        lat=settings.openmeteo_lat,
        lon=settings.openmeteo_lon,
        city=city,
    )
    publisher.publish.assert_called_once_with(payload)

    assert payload["cityName"] == "Brasilia-DF"
    assert payload["cityQueryKey"] == "brasilia_df"
    assert "temperature" in payload
    assert "humidity" in payload
    assert "windSpeed" in payload

# -----------------------------------------------------------
# Teste de erro de coordenadas inválidas
# -----------------------------------------------------------    
def test_collect_and_publish_latitude_invalida():

    # Arrange
    settings = make_settings()
    bad_settings = replace(settings, openmeteo_lat=999.0)  # fora do intervalo [-90, 90]

    client = MagicMock()
    publisher = MagicMock()

    service = WeatherCollectorService(
        settings=bad_settings,
        client=client,
        publisher=publisher,
    )

    # Act + Assert
    with pytest.raises(ValueError, match="Latitude fora do intervalo"):
        service.collect_and_publish()

    client.fetch_latest_reading.assert_not_called()
    publisher.publish.assert_not_called()
    