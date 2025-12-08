import logging
import time
from app.config.settings import Settings
from app.services.weather_collector_service import WeatherCollectorService

# -----------------------------------------------------------
# Executa o ciclo de coleta em intervalo fixo, até o processo ser interrompido.
# -----------------------------------------------------------
def run_scheduler(setting: Settings, collector: WeatherCollectorService) -> None:
    logger = logging.getLogger(__name__)
    # Lê o intervalo de coleta definido na configuração.
    interval = setting.collect_interval_seconds

    if interval <= 0:
        raise ValueError("collect_interval_seconds deve ser maior que zero.")
    
    logger.info("Scheduler iniciando com intervalo de %s segundos.", interval)

    try:
        # Loop principal: coleta + publicação + espera.
        while True:
            try:
                payload = collector.collect_and_publish()
                logger.debug("Payload coletado e publicado: %s", payload)
            
            except KeyboardInterrupt:
                logger.info("Scheduler interrompido por KeyboardInterrupt.")
                break

            # Registra qualquer falha de ciclo sem derrubar o processo.
            except Exception as exc:
                logger.error("Erro ao executar ciclo de coleta: %s", exc)

            # Aguarda o próximo ciclo respeitando o intervalo configurado.
            time.sleep(interval)

    finally:
        logger.info("Scheduler finalizado.")
        