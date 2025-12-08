# collector-python

Serviço responsável por coletar dados reais de clima via **Open-Meteo** e publicar mensagens normalizadas em uma fila **RabbitMQ**.  
Essas mensagens são consumidas pelo worker em Go e enviadas ao backend NestJS (`POST /api/weather/logs`), onde são persistidas no MongoDB.

**Fluxo completo:**  
Open-Meteo → collector-python → RabbitMQ → Worker Go → API Backend → MongoDB → Dashboard / Export CSV/XLSX.

---

## O que o serviço faz

- Consulta periodicamente a Open-Meteo usando latitude/longitude configuradas.
- Normaliza o resultado para o formato esperado pelo backend (`IngestWeatherDto`).
- Publica mensagens JSON na fila **weather_logs**.
- Não possui endpoints HTTP — atua somente como produtor de eventos.

---

## Integração com Open-Meteo

- **Método:** GET  
- **Base URL:** https://api.open-meteo.com/v1/forecast  
- Utiliza **user-agent próprio**, **timeout configurado** e **retries com backoff** para garantir resiliência.

---

## RabbitMQ — Publicação

- **Fila:** `weather_logs`  
- **Payload:** JSON normalizado  
- Cada coleta gera uma mensagem enviada ao worker em Go.

---

## Estrutura da mensagem enviada

```json
{
  "cityName": "Brasilia-DF",
  "cityQueryKey": "brasilia_df",
  "temperature": 25.3,
  "humidity": 65,
  "windSpeed": 12.4,
  "recordedAt": "2025-11-29T12:00:00Z"
}
```

Essa mensagem é repassada pelo worker ao backend:

- **POST /api/weather/logs**

---

## City como Value Object

A cidade é representada pelo par **(nome de exibição + chave de query)**.  
Isso mantém consistência entre o coletor Python, worker Go e backend NestJS.

---

## Logging centralizado

O serviço utiliza um módulo único de configuração de logs (`logging_config`), que:

- Define formato padrão (data | nível | módulo | mensagem).
- Configura o logging uma única vez no bootstrap.
- Expõe `get_logger(__name__)` para uso consistente em todos os módulos.

---


