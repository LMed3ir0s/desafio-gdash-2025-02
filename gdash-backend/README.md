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
