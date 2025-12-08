from datetime import datetime
from typing import Any, Dict
from app.models.models import WeatherReading

# Converte WeatherReading em JSON compatível com IngestWeatherDto do backend.
def build_ingest_payload(reading: WeatherReading) -> Dict[str, Any]:
    # Garante recorded_at como string ISO 8601 (UTC/offset).
    if isinstance(reading.recorded_at, datetime):
        recorded_at_str = reading.recorded_at.isoformat()
    else:
        recorded_at_str = str(reading.recorded_at)

    # Monta o dicionário com os mesmos nomes de campos da API Backend.
    return {
        "cityName": reading.city.name,
        "cityQueryKey": reading.city.query_key,
        "temperature": reading.temperature,
        "humidity": reading.humidity,
        "windSpeed": reading.wind_speed,
        "recordedAt": recorded_at_str,
    }
