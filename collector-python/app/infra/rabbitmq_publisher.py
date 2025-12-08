import json
import logging
import time
from typing import Any, Dict
import pika
from pika import BlockingConnection, URLParameters
from pika.adapters.blocking_connection import BlockingChannel
from pika.exceptions import AMQPError

# Número máximo de tentativas de conexão.
MAX_RETRIES = 10
# Intervalo em segundos entre as tentativas.
RETRY_DELAY_SECONDS = 5

# Publisher responsável por enviar mensagens JSON para uma fila RabbitMQ.
class RabbitMQPublisher:
    def __init__(self, amqp_url: str, queue_name: str) -> None:

        # Guarda URL e nome da fila usados nas conexões.
        if not amqp_url:
            raise ValueError("AMQP URL não pode ser vazia.")
        
        if not queue_name:
            raise ValueError("Nome da fila não pode ser vazio.")

        self._amqp_url = amqp_url
        self._queue_name = queue_name
        self._logger = logging.getLogger(__name__)

        # Abre conexão e canal na inicialização do publisher.
        self._connection: BlockingConnection = self._create_connection()
        self._channel: BlockingChannel = self._create_channel()

        # Garante que a fila existe e é durável.
        self._declare_queue()

    # Cria uma nova conexão com o broker a partir da URL. (com retry)
    def _create_connection(self) -> BlockingConnection:
        last_error: Exception | None = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                params = URLParameters(self._amqp_url)
                connection = BlockingConnection(params)
                print(f"[RabbitMQ] Conectado com sucesso na tentativa {attempt}.")

                return connection
            
            except pika.exceptions.AMQPConnectionError as e:
                last_error = e
                print(
                    f"[RabbitMQ] Tentativa {attempt}/{MAX_RETRIES} falhou: {e}. "
                    f"Repetindo em {RETRY_DELAY_SECONDS}s..."
                )
                time.sleep(RETRY_DELAY_SECONDS)

        # Se todas as tentativas falharem
        raise last_error or Exception("Falha ao conectar ao RabbitMQ após múltiplas tentativas.")

    # Cria um canal lógico para publicação de mensagens.
    def _create_channel(self) -> BlockingChannel:
        return self._connection.channel()

    # Declara a fila usada pelo coletor (durável para não perder mensagens).
    def _declare_queue(self) -> None:
        self._channel.queue_declare(
            queue=self._queue_name,
            durable=True,
        )

    # Publica um payload JSON na fila configurada.
    def publish(self, payload: Dict[str, Any]) -> None:

        if not isinstance(payload, dict):
            raise TypeError("Payload para publicação deve ser um dict.")
        
        if not payload:
            raise ValueError("Payload para publicação não pode ser vazio.")

        # Serializa o payload para JSON UTF-8.
        body = json.dumps(payload).encode("utf-8")

        try:
            # Envia mensagem persistente para a fila.
            self._channel.basic_publish(
                exchange="",                 # uso direto da fila (default exchange).
                routing_key=self._queue_name,
                body=body,
                properties=pika.BasicProperties(
                    content_type="application/json",
                    delivery_mode=2,        # 2 = mensagem persistente em disco.
                ),
            )

        except AMQPError as exc:
            # Registra erro e propaga exceção amigável para o chamador.
            self._logger.error("Falha ao publicar mensagem no RabbitMQ: %s", exc)

            raise RuntimeError("Erro ao publicar mensagem no RabbitMQ.") from exc

    # Fecha canal e conexão de forma explícita (para uso em shutdown limpo).
    def close(self) -> None:
        if self._channel.is_open:
            self._channel.close()
            
        if self._connection.is_open:
            self._connection.close()
