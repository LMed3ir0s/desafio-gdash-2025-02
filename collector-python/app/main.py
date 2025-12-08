import logging
from app.config.settings import get_settings
from app.infra.openmeteo_client import OpenMeteoClient
from app.infra.rabbitmq_publisher import RabbitMQPublisher
from app.services.weather_collector_service import WeatherCollectorService
from app.services.scheduler_service import run_scheduler

def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    settings = get_settings()

    client = OpenMeteoClient()
    publisher = RabbitMQPublisher(
        amqp_url=settings.rabbitmq_url,
        queue_name=settings.rabbitmq_queue,
    )

    service = WeatherCollectorService(
        settings=settings,
        client=client,
        publisher=publisher,
    )

    run_scheduler(settings, service)


if __name__ == "__main__":
    main()