backend/
├─ .env.example
├─ .eslintrc.js
├─ .prettierrc
├─ Dockerfile
├─ dockerignore
├─ docker-compose.backend.yml   # opcional para testes isolados do backend
├─ nest-cli.json
├─ package.json
├─ tsconfig.json
├─ tsconfig.build.json
├─ jest.config.js
├─ README.md
├─ src/
│  ├─ common/
│  │  ├─ decorators/
│  │  │  └─ roles.decorator
│  │  ├─ filters/
│  │  │  └─ http-exception.filter.ts *em branco
│  │  ├─ guards/
│  │  │  └─ roles.guard
│  │  ├─ interceptors/
│  │  │  └─ logging.interceptor.ts
│  │  └─ utils/
│  │     └─ pagination.utils
│  │
│  ├─ config/
│  │  ├─ configuration.ts
│  │  ├─ database.config.ts
│  │  └─ env.validation.ts
│  │
│  ├─ infra/
│  │  └─ http-client/
│  │     └─axios.client.ts *em branco
│  │
│  ├─ queue/
│  │  ├─ events/
│  │  │  ├─ weather-processed.listener *em branco
│  │  │ rabbitmq.module.ts       *em branco
│  │  ├─ rabbitmq.service.ts      # conexão + consumer *em branco
│  │
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ controllers/
│  │  │  │  └─ auth.controller.ts
│  │  │  ├─ services/
│  │  │  │  └─ auth.service.ts
│  │  │  ├─ strategies/
│  │  │  │  └─ jwt.strategy.ts
│  │  │  ├─ dtos/
│  │  │  │  └─ login.dto.ts
│  │  │  └─ auth.module.ts
│  │  │  ├─ guards/
│  │  │  └─ jwt-auth.guard.ts
│  │  │  ├─ auth.module.ts
│  │  │
│  │  ├─ health/
│  │  │  ├─ controllers/
│  │  │  │  └─ health.controller.ts *em branco
│  │  │  ├─ services/
│  │  │  │  └─ health.service.ts *em branco
│  │  │  └─ health.module.ts *em branco
│  │  │
│  │  ├─ insights/ 
│  │  │  ├─ controllers/
│  │  │  │  └─ insights.controller.ts
│  │  │  ├─ services/
│  │  │  │  └─ insights.service.ts
│  │  │  └─ insights.module
│  │  │
│  │  ├─ users/
│  │  │  ├─ controllers/
│  │  │  │  └─ users.controller.ts
│  │  │  ├─ dtos/
│  │  │  │  ├─ create-user.dto.ts
│  │  │  │  └─ update-user.dto.ts
│  │  │  ├─ entities/
│  │  │  │  └─ user.entity.ts
│  │  │  ├─ repositories/
│  │  │  │  └─ users.repository.ts
│  │  │  ├─ schemas/
│  │  │  │  └─ user.schema.ts
│  │  │  ├─ services/
│  │  │  │  └─ users.service.ts
│  │  │  ├─ users.module.ts
│  │  │
│  │  ├─ weather/
│  │  │  ├─ config
│  │  │  │  ├─ city.config.ts
│  │  │  │  └─ climate.config.ts 
│  │  │  ├─ controllers/
│  │  │  │  ├─ weather.controller.ts // ingest + logs/summary
│  │  │  │  └─ weather-export.controller.ts // export CSV/XLSX
│  │  │  ├─ dtos/
│  │  │  │  ├─export-weather-query.dto.ts
│  │  │  │  ├─ get-insights-query.dto.ts
│  │  │  │  ├─ ingest-weather.dto.ts
│  │  │  │  └─ query-logs.dto.ts
│  │  │  ├─ entities/
│  │  │  │  └─ weather.entity.ts
│  │  │  ├─ repositories/
│  │  │  │  └─ weather.repository.ts
│  │  │  ├─ schemas/
│  │  │  │  └─ weather.schema.ts
│  │  │  ├─ services/
│  │  │  │  ├─ weather.service.ts
│  │  │  │  └─ weather-export.service.ts // geração de CSV/XLSX
│  │  │  └─ weather.module.ts
│  │  │
│  ├─ app.module.ts
│  ├─ main.ts
│
├─ test/
│  ├─ e2e/
│  └─ unit/
│     ├─ auth/
│     │  ├─ auth.controller.spec.ts
│     │  └─ auth.service.spec.ts
│     ├─ users/
│     │  ├─ users.controller.spec.ts
│     │  ├─ users.repository.spec.ts
│     │  └─ users.service.spec.ts
│     └─ weather/
         ├─ weather.controller.spec.ts
         ├─ weather.repository.spec.ts
         └─ weather.service.spec.ts





---

## 🐳 Multi-Stage Build no Docker

O projeto utiliza **multi-stage build** por dois motivos:

1. **Imagens menores e mais rápidas**  
   Apenas os arquivos necessários para produção entram na imagem final.

2. **Ambiente de build separado do ambiente de execução**  
   Dependências de desenvolvimento não vão para o container final.

---

## 👨‍💻 Execuções

Principais comandos para execução dos testes:

```bash
- `npm run test` — Executa os testes unitários
- `npm run test:e2e` — Executa testes end-to-end
```

---

## Endpoints principais

```
http://localhost:3000
```
- `POST /users` — Criação de usuário (público)
- `GET /users/admin/:email` — Busca usuário por email (restrito a admins)
- `/docs` — Documentação Swagger interativa

---

## Observação sobre usuário administrador

A configuração das variáveis de ambiente deve ser feita conforme o arquivo `.env.example`. Um usuário administrador padrão é criado automaticamente via seed na inicialização da aplicação, utilizando as credenciais configuradas no `.env`.


concentrei a lógica de cidade em city.config, tratando sempre cidade como o par ‘nome para exibição’ + ‘chave interna para query’, o que deixa o mapeamento entre frontend, API e banco coeso e fácil de evoluir.﻿”

=======================================================================================================

#### Configurar versionamento e README final


#### Resumo final dos bancos (lista pronta para documentar)
Serviço	Banco	Objetivo
API NestJS (usuários, autenticação, API paginada)	gdash_api	Lógica principal
Dados climáticos (Python → RabbitMQ → Go → NestJS)	gdash_weather	Armazenar dados brutos e processados de clima
IA (insights e análises)	gdash_ai	Armazenar inteligência e respostas da IA
Auditoria e logs	gdash_logs	Telemetria, eventos e rastreamento
(Opcional) API pública paginada	gdash_public_api	Cache de API externa



#### Health module — itens a lembrar ####



#### Lista de ideias para o módulo de Insights (somente anotação)

Segue uma lista organizada, só para você guardar e usar quando chegar no módulo insights:

# Insights Simples

Tempo quente, frio, úmido, seco.

Vento fraco/moderado/forte.

Alertas de baixa umidade (DF é crítico).

Classificação: clima confortável / desconfortável.

# Insights Avançados

Cálculo de sensação térmica (wind chill).

Cálculo de índice de calor (heat index).

“Quality Score” do clima (0–100 baseado em regras).

Comparação com média histórica da mesma hora/dia.

Deteção de anomalias: temperatura atípica, umidade fora do padrão.

# Recomendações básicas:

"Hidrate-se — umidade muito baixa"

"Evite exercício intenso"

# Insights de Tendência

Tendência de queda ou aumento da temperatura nas últimas horas.

Média diária comparada com os últimos dias.

Previsão simples baseada em regressão linear básica (sem IA).

Tudo isso deixamos guardado para quando chegarmos no módulo insights.



















          ┌──────────────────┐
          │  Python Collector │
          │ (consulta API)    │
          └─────────┬────────┘
                    │
                    ▼
         Envia dados normalizados
                    │
                    ▼
           ┌────────────────┐
           │ RabbitMQ Queue │
           │   weather.raw  │
           └───────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Go Worker       │
          │ (valida /       │
          │  enriquece)     │
          └────────┬────────┘
                   │
          Publica dados prontos
                   │
                   ▼
           ┌────────────────┐
           │ RabbitMQ Queue │
           │ weather.processed│
           └─────────┬────────┘
                     │
                     ▼
           ┌──────────────────┐
           │   NestJS API     │
           │  (Consumer MQ)   │
           └────────┬─────────┘
                    │
                 Salva no
                 MongoDB
                    │
                    ▼
       ┌──────────────────────────┐
       │  Endpoints REST (API)   │
       │ - listar clima          │
       │ - exportar xlsx/csv     │
       │ - gerar insights        │
       │ - CRUD usuários/auth    │
       └───────────┬────────────┘
                   │
                   ▼
         ┌────────────────────┐
         │   Frontend React   │
         │  Dashboard + Login │
         └────────────────────┘

#### IMPLEMENTAR MODEL HEALTH <<<<<<<<<<<<+++++++++++++++>>>>>>>>>>>>

=> index em citykey visando busca indexada para fitros/exports por cidade
=> cityName cityQueryKey, city config, climate config
=> ideia de score para facilitar interpretacao do clima para insights





























=======================================================================================================


⚙️ GDASH – Backend (NestJS)
Backend REST API em NestJS responsável por autenticação, gestão de usuários, ingestão/armazenamento de dados climáticos, geração de insights e health check da aplicação, integrando-se ao pipeline Python → Message Broker → Go → NestJS → MongoDB → Frontend definido no desafio GDASH 2025/02.​

Visão geral

Arquitetura: organizada por módulos de feature (auth, users, weather, insights, health), com camadas bem definidas (controllers, services, repositories, schemas, entities, dtos).

Configuração: variáveis de ambiente centralizadas (ConfigModule) e validação via Joi (env.validation.ts), com configuração de banco em database.config.ts e configurações de clima/cidade em modules/weather/config.

Execução: aplicação exposta em /api (prefixo global), com documentação HTTP via Swagger (/docs) e health check em /api/health.

Módulos
Auth: autenticação via JWT, login com email/senha, guarda de rotas protegidas e extração de usuário autenticado.

Users: CRUD de usuários com schema Mongoose, repositório dedicado e serviços de domínio; inclui usuário admin padrão via seed carregado a partir do .env.

Weather: ingestão de logs climáticos (worker Go → NestJS), armazenamento em MongoDB, consultas de histórico (logs/summary) e exportação CSV/XLSX; todas as regras de cidade/cityKey centralizadas em city.config.ts e climate.config.ts.

Insights: geração de insights em cima do histórico (score de conforto, tendências, comparações históricas) consumindo o WeatherRepository, retornando dados já prontos para uso no dashboard, sem lógica de negócio no frontend.

Health: módulo dedicado para verificação leve de saúde da API e do MongoDB, usado por Docker/monitoramento para liveness/readiness da API.

Endpoints principais (backend)
Prefixo global: /api

Auth

POST /api/auth/login – Autenticação com email/senha e retorno de access_token JWT.

Users

GET /api/users – Listagem paginada de usuários (rota protegida, role admin).

POST /api/users – Criação de usuário.

GET /api/users/:id – Detalhe de usuário.

PATCH /api/users/:id – Atualização de usuário.

DELETE /api/users/:id – Remoção de usuário.

Weather

POST /api/weather/logs – Ingestão de registros climáticos vindos do worker Go (cityName/cityQueryKey, temperatura, umidade, vento, recordedAt).

GET /api/weather/logs – Consulta de registros climáticos com filtros (por cidade/período), para alimentar o dashboard.

GET /api/weather/export/csv – Exportação de dados climáticos em CSV.

GET /api/weather/export/xlsx – Exportação em XLSX, otimizando para consumo no frontend (buffer binário pronto para download).

Insights

GET /api/insights – Geração/retorno de insights climáticos (score, labels de conforto, tendências, comparações com período anterior), a partir da cidade configurada ou query.

Health

GET /api/health – Retorna status geral (ok | degraded), timestamp e estado de app e database (incluindo mensagens de erro amigáveis + detalhes técnicos concatenados).

Decisões de arquitetura e boas práticas
Separação por feature module: cada domínio (auth, users, weather, insights, health) encapsula seus próprios controllers/services/repositories/schemas/DTOs, seguindo a recomendação de módulos de domínio do NestJS.​

Lógica de domínio no service, controllers finos: controllers apenas traduzem HTTP → DTOs → services; toda a lógica de negócio (scores, insights, regras de cidade, filtros de export) vive em services/repositories.

Config centralizada: constantes de clima e de cidade (limiares de temperatura/umidade, cityName/cityQueryKey default) ficam em arquivos de config dentro do módulo weather, evitando “números mágicos” espalhados e facilitando manutenção/troca de cidades.

Observabilidade:

Health check dedicado (HealthService + HealthController) com ping leve no MongoDB e mensagens claras.

Interceptor de logging global em common/interceptors/logging.interceptor.ts para rastrear requisições/respostas em console/Docker.

Qualidade de código:

Tipagem forte em DTOs, entities e services.

Validação com class-validator + pipes globais de validação.

ESLint/Prettier configurados para estilo consistente.

Testes unitários cobrindo repositórios, services e controllers de módulos críticos (users, weather, auth, health) usando @nestjs/testing + mocks isolados.​

Próximos passos (integração completa)
Documentar no README raiz como subir toda a stack via Docker Compose (Python, fila, worker Go, API NestJS, MongoDB, frontend React).

Adicionar seções específicas para:

Execução do serviço Python (coletor Open-Meteo/OpenWeather) e formato do JSON enviado à fila.

Execução do worker Go (consumer do broker → POST /api/weather/logs).

URL do frontend (dashboard) e principais telas.

Link do vídeo explicativo (YouTube não listado), cobrindo arquitetura, pipeline completo e demonstração da aplicação rodando.​








========================================================================================================================





# ⚙️ GDASH – Backend (NestJS) A API de clima fornece ingestão, consultas e resumos de dados meteorológicos.

## Endpoints

### Weather
- **POST /api/weather/logs** — ingere novos registros climáticos.
- **GET /api/weather/logs** — lista registros salvos.
- **GET /api/weather/logs/latest** — retorna o último registro inserido.
- **GET /api/weather/logs/last-hours** — dados das últimas horas.
- **GET /api/weather/logs/between** — registros entre datas.
- **GET /api/weather/logs/summary** — resumo agregado dos dados.

### Export
- **GET /api/weather/export/csv** — exporta os dados em CSV.
- **GET /api/weather/export/xlsx** — exporta os dados em XLSX.

### Insights

Retorna métricas e análises geradas sobre os dados climáticos.

- **GET /api/weather/insights** — métricas e insights do clima.

---

### Users

Gerencia usuários do sistema e suas operações principais.

- **POST /api/users** — cria usuário.
- **GET /api/users** — lista usuários.
- **GET /api/users/{id}** — busca por ID.
- **PATCH /api/users/{id}** — atualiza usuário.
- **DELETE /api/users/{id}** — remove usuário.
- **GET /api/users/admin/email/{email}** — busca admin pelo email.

---

### ❤️ Health — Endpoint

Endpoint simples para verificação de estado da API.

- **GET /api/health** — retorna status do serviço.

---
## Modules

### 🔒 Auth

Gerencia autenticação, login, geração e validação de JWT.
Utilizado para proteger rotas privadas e validar permissões.

---

### 👥 Users Module

Executa operações relacionadas a usuários: criação, leitura, atualização e exclusão.
Utiliza repositório próprio e integra com autenticação para regras de acesso.

---

### 🌦️ Weather Module

Gerencia ingestão, armazenamento e consulta de dados climáticos.
Fornece logs, resumos, filtros e integra com o módulo de insights e exportação.

---

### 📁 Weather Export Module

Responsável por gerar arquivos CSV e XLSX com base nos dados climáticos armazenados.
Utiliza internamente o serviço do módulo Weather.

---

### 📈 Insights Module

Processa dados do módulo Weather para gerar métricas, cálculos e análises de tendência.
Fornece indicadores para o frontend exibir painéis e gráficos.

---

### 🩺 Health Module

Oferece um endpoint simples para monitoramento do status da API.
Utilizado por ferramentas de observabilidade ou scripts de verificação.
