# worker-go

Serviço responsável por consumir mensagens da fila **RabbitMQ** geradas pelo collector-python, validar o payload e repassar os dados para a API Backend (`POST /api/weather/logs`). Funciona como processador assíncrono entre a fila e o backend.

Fluxo: RabbitMQ → worker-go → API NestJS → MongoDB.

---

## Visão geral

- Consome mensagens JSON da fila RabbitMQ.
- Valide e envia o payload para o endpoint de ingestão da API.
- Realiza Ack ou Nack dependendo do resultado.

---

## Arquivos principais

### api_client.go
Responsável por comunicar com a API NestJS via HTTP.
- Envia o WeatherPayload como JSON.
- Trata status code e erros de transporte.

### config.go
Lê e valida variáveis de ambiente:
- RABBITMQ_URL
- RABBITMQ_QUEUE
- API_BASE_URL
- WORKER_PREFETCH (opcional)
Expõe uma struct Config usada no restante do worker.

### models.go
Define o modelo WeatherPayload, compatível com o JSON recebido do collector e com o DTO da API NestJS.

### consumer.go
Responsável pelo consumo no RabbitMQ:
- Abre conexão e canal.
- Declara a fila.
- Consome mensagens.
- Converte delivery.Body (JSON) para WeatherPayload.
- Chama o service.
- Executa Ack em caso de sucesso.
- Executa Nack com requeue=false em caso de erro.

### service.go
Implementa a regra de aplicação:
- Valida WeatherPayload.
- Chama o WeatherAPIClient.
- Retorna erro ou nil, determinando Ack/Nack.

---