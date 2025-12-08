import logging
from typing import Dict, Any
from app.config.settings import Settings
from app.models.value_objects import City
from app.infra.openmeteo_client import OpenMeteoClient
from app.infra.rabbitmq_publisher import RabbitMQPublisher
from app.services.message_builder import build_ingest_payload


# Orquestra: buscar leitura e publicar na fila.
class WeatherCollectorService:
    def __init__(
        self,
        settings: Settings,
        client: OpenMeteoClient,
        publisher: RabbitMQPublisher,
        logger: logging.Logger | None = None,
    ) -> None:
        if not settings:
            raise ValueError("Settings é obrigatório.")
        if not client:
            raise ValueError("OpenMeteoClient é obrigatório.")
        if not publisher:
            raise ValueError("RabbitMQPublisher é obrigatório.")

        self._settings = settings
        self._client = client
        self._publisher = publisher
        self._logger = logger or logging.getLogger(__name__)

    # Executa 1 ciclo: coleta -> monta payload -> publica.
    def collect_and_publish(self) -> Dict[str, Any]:
        self._validate_coords()
        city = self._build_city()

        reading = self._client.fetch_latest_reading(
            lat=self._settings.openmeteo_lat,
            lon=self._settings.openmeteo_lon,
            city=city,
        )

        payload = build_ingest_payload(reading)
        if not isinstance(payload, dict) or not payload:
            raise ValueError("Payload inválido gerado pelo message_builder.")

        self._publisher.publish(payload)
        self._logger.info("Mensagem publicada na fila com sucesso.")
        return payload

    # Garante latitude/longitude válidas.
    def _validate_coords(self) -> None:
        lat = self._settings.openmeteo_lat
        lon = self._settings.openmeteo_lon

        if lat is None or lon is None:
            raise ValueError("Coordenadas não configuradas.")
        if not (-90.0 <= float(lat) <= 90.0):
            raise ValueError("Latitude fora do intervalo [-90, 90].")
        if not (-180.0 <= float(lon) <= 180.0):
            raise ValueError("Longitude fora do intervalo [-180, 180].")

    # Monta o value object de Cidade a partir do Settings.
    def _build_city(self) -> City:
        name = (self._settings.city_name or "").strip()
        key = (self._settings.city_query_key or "").strip()

        if not name:
            raise ValueError("city_name não configurado.")
        if not key:
            raise ValueError("city_query_key não configurado.")

        return City(name=name, query_key=key)
