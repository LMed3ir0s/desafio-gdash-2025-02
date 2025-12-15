# 🧭 GDASH – Sistema de Monitoramento Climático

## Visão Geral

O GDASH é um sistema full-stack para coleta, processamento e visualização de dados climáticos em tempo real.  
Ele integra múltiplos serviços e tecnologias:

Fluxo completo:  
Open-Meteo → `collector-python` → RabbitMQ → `worker-go` → API NestJS → MongoDB → Frontend Dashboard / Export CSV/XLSX  

Tecnologias utilizadas:  
- Backend: NestJS (TypeScript)  
- Frontend: React + Vite + TailwindCSS + shadcn/ui  
- Coleta de dados + Fila: Python (`collector-python`) + RabbitMQ  
- Worker: Go (`worker-go`)  
- Banco de dados: MongoDB  
- Orquestração: Docker Compose  

---

## 📦 Como rodar o projeto

### Rodando tudo via Docker Compose

git clone https://github.com/LMed3ir0s/gdash-sistema  
cd "local onde foi feito o git clone"  
docker-compose up --build

O Compose irá subir todos os serviços: backend, frontend, MongoDB, RabbitMQ, collector Python e worker Go.

---

## 🔗 URLs principais

Serviço | URL  
Frontend | http://localhost:5173  
API Swagger | http://localhost:3000/api  
Export CSV | http://localhost:3000/api/weather/export/csv  
Export XLSX | http://localhost:3000/api/weather/export/xlsx  

---

## 👤 Usuário padrão

Email: admin@gdash.com  
Senha: 123456

Permite acesso inicial ao sistema e testes de funcionalidades.

---

## 🧪 Serviços

### 1. Collector Python

- Coleta dados climáticos via Open-Meteo usando latitude/longitude configuradas.  
- Normaliza dados e publica mensagens JSON na fila `weather_logs` do RabbitMQ.  
- Não possui endpoints HTTP — atua como produtor de eventos.  
- Logging centralizado e módulo único de configuração.

Exemplo de mensagem enviada:

{
  "cityName": "Brasilia-DF",
  "cityQueryKey": "brasilia_df",
  "temperature": 25.3,
  "humidity": 65,
  "windSpeed": 12.4,
  "recordedAt": "2025-11-29T12:00:00Z"
}

---

### 2. Worker Go

- Consome mensagens JSON da fila RabbitMQ.  
- Valida o payload e envia para o endpoint POST /api/weather/logs da API.  
- Realiza Ack/Nack conforme sucesso ou falha.  

Arquivos principais:  
- api_client.go — comunicação HTTP com API NestJS  
- config.go — leitura e validação de variáveis de ambiente  
- models.go — modelo de dados compatível com DTO da API  
- consumer.go — consumo da fila RabbitMQ  
- service.go — validação e envio de dados  

---

### 3. Backend NestJS

**Endpoints principais:**

Weather  
- POST /api/weather/logs — ingere novos registros  
- GET /api/weather/logs — lista todos registros  
- GET /api/weather/logs/latest — último registro inserido  
- GET /api/weather/logs/last-hours — registros das últimas horas  
- GET /api/weather/logs/between — registros entre datas  
- GET /api/weather/logs/summary — resumo agregado  

Export  
- GET /api/weather/export/csv — exporta dados em CSV  
- GET /api/weather/export/xlsx — exporta dados em XLSX  

Insights  
- GET /api/weather/insights — métricas e análises do clima  

Users  
- CRUD de usuários (POST, GET, PATCH, DELETE)  
- Endpoint para buscar admin por email  

Módulos principais:  
- Auth (JWT e segurança)  
- Users Module (CRUD e regras de acesso)  
- Weather Module (ingestão, armazenamento e consultas)  
- Weather Export Module (CSV/XLSX)  
- Insights Module (métricas e análises)  
- Health Module (monitoramento da API)  

---

### 4. Frontend

- Dashboard interativo que consome dados do backend.  
- Componentes exibem métricas, gráficos, tabelas e cards informativos.  
- Atualização automática das métricas e gráficos.

---

### 5. Docker Compose

- Orquestra backend, frontend, MongoDB, RabbitMQ, collector Python e worker Go.  
- Permite rodar todos os serviços localmente com um único comando (docker-compose up --build).  

---

### 6. Vídeo explicativo

https://youtube.com/watch?v=vCM9yc2OwwA&feature=youtu.be
