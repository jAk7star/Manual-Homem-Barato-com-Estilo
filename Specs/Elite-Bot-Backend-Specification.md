# Elite Bot — Backend Specification

**Versão:** 0.2
**Status:** Draft / MVP
**Projeto:** Elite Bot / Guia do Homem Barato

---

## 1. Visão

O backend do Elite Bot será responsável por identificar produtos, coletar e armazenar ofertas, comparar preços, calcular a qualidade das ofertas, manter histórico de preços, processar alertas e registrar interações de afiliados.

A arquitetura será independente de plataformas BaaS específicas.

### Stack oficial da v0.2

* **Database:** PostgreSQL
* **API:** PostgREST
* **Worker:** Node.js + TypeScript
* **Scheduler:** Cron
* **API Testing:** Postman
* **Client:** Chrome Extension
* **Versionamento:** Git
* **Migrations:** SQL versionado

---

# 2. Arquitetura

```text
                         ┌─────────────────────┐
                         │   Chrome Extension  │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP/REST
                                    ▼
                         ┌─────────────────────┐
                         │      PostgREST      │
                         │      REST API       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         │      Database       │
                         └──────────┬──────────┘
                                    ▲
                                    │
                         ┌──────────┴──────────┐
                         │       Worker        │
                         │   Node + TypeScript │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  ▼                 ▼                 ▼
              APIs/Feeds        Scrapers          Affiliate
              de lojas          de lojas           services
```

---

# 3. Responsabilidades

## 3.1 PostgreSQL

Responsável por:

* persistência;
* relacionamentos;
* constraints;
* índices;
* views;
* funções SQL;
* segurança por banco;
* RLS quando necessário;
* histórico de preços.

O banco será considerado a fonte de verdade dos dados.

---

## 3.2 PostgREST

Responsável pela API REST sobre PostgreSQL.

Será utilizado principalmente para:

* leitura de produtos;
* leitura de ofertas;
* filtros;
* ordenação;
* paginação;
* CRUD de recursos;
* criação/alteração de alertas;
* registro de eventos simples.

### Exemplos

```http
GET /products
GET /products?id=eq.UUID
GET /offers?product_id=eq.UUID
GET /offers?product_id=eq.UUID&order=price.asc
GET /best_product_offers?product_id=eq.UUID
POST /alerts
PATCH /alerts?id=eq.UUID
```

---

# 4. Worker

O Worker será responsável por processamento que não deve depender diretamente de uma requisição HTTP da extensão.

Responsabilidades:

* ingestão de preços;
* scraping;
* integração com APIs de lojas;
* normalização de produtos;
* matching;
* atualização de ofertas;
* criação de histórico;
* cálculo de Deal Score;
* processamento de alertas;
* tarefas periódicas.

### Stack

```text
Node.js
TypeScript
PostgreSQL Client
Zod
HTTP Client
```

---

# 5. Scheduler

Jobs serão executados através de Cron ou mecanismo equivalente.

Exemplo:

```text
Cron
  │
  ├── ingest-prices
  ├── calculate-deals
  └── process-alerts
```

O scheduler não contém regra de negócio.

Sua função é apenas disparar o Worker.

---

# 6. Princípio de separação

A regra principal da arquitetura será:

```text
PostgREST = API de recursos
Worker    = processamento
PostgreSQL = dados e integridade
Postman   = validação
```

Não colocar scraping diretamente no PostgREST.

Não colocar lógica complexa da aplicação diretamente em queries da extensão.

Não colocar credenciais privilegiadas no Chrome Extension.

---

# 7. Domínio

## 7.1 Categorias iniciais

* Perfumes
* Skincare
* Roupas

Expansões futuras poderão incluir:

* tênis;
* acessórios;
* relógios;
* cabelo;
* barba;
* suplementos, caso o produto seja expandido posteriormente.

---

# 8. Entidades

## 8.1 Category

```text
categories
-----------
id
name
slug
created_at
updated_at
```

---

## 8.2 Brand

```text
brands
------
id
name
slug
created_at
updated_at
```

---

## 8.3 Product

```text
products
--------
id
category_id
brand_id
name
slug
description
product_type
gender
size_value
size_unit
image_url
created_at
updated_at
```

---

## 8.4 Product Identifier

Permite identificar o mesmo produto em diferentes lojas.

```text
product_identifiers
-------------------
id
product_id
identifier_type
identifier_value
created_at
```

Tipos:

```text
ean
gtin
sku
mpn
brand_sku
```

---

## 8.5 Store

```text
stores
------
id
name
slug
domain
logo_url
affiliate_network
affiliate_base_url
is_active
created_at
updated_at
```

---

## 8.6 Offer

Representa uma oferta de um produto em uma loja.

```text
offers
------
id
product_id
store_id
external_product_id
product_url
affiliate_url
title
price
original_price
currency
availability
seller_name
shipping_price
last_checked_at
is_active
created_at
updated_at
```

---

## 8.7 Price History

```text
price_history
-------------
id
offer_id
price
original_price
shipping_price
captured_at
```

---

## 8.8 Product Match

Relaciona uma oferta ao produto canônico.

```text
product_matches
---------------
id
product_id
offer_id
match_type
confidence
verified
created_at
```

---

## 8.9 Deal Score

```text
deal_scores
-----------
id
offer_id
score
classification
current_price
average_price
lowest_price
discount_percentage
calculated_at
```

Classificações:

```text
excellent
good
normal
expensive
```

---

## 8.10 User

```text
users
-----
id
display_name
created_at
updated_at
```

A autenticação será desacoplada da estrutura de domínio.

---

## 8.11 Alert

```text
alerts
------
id
user_id
product_id
target_price
currency
is_active
last_triggered_at
created_at
updated_at
```

---

## 8.12 Affiliate Click

```text
affiliate_clicks
----------------
id
user_id
offer_id
source
campaign
clicked_at
```

---

# 9. Relacionamentos

```text
categories
     │
     ▼
 products ◄──── brands
     │
     ├──── product_identifiers
     │
     └──── offers ◄──── stores
              │
              ├──── price_history
              │
              ├──── product_matches
              │
              └──── deal_scores


users
  │
  ├──── alerts ───── products
  │
  └──── affiliate_clicks ───── offers
```

---

# 10. Features

## F-001 — Product Identification

Identificar o produto visitado pelo usuário.

### Entrada

* URL;
* título;
* marca;
* EAN;
* SKU;
* informações da página.

### Saída

```json
{
  "product_id": "UUID",
  "confidence": 0.98,
  "match_type": "ean"
}
```

### Agent

AG-001 Product Agent

---

## F-002 — Price Comparison

Encontrar ofertas do mesmo produto em diferentes lojas.

### Agent

AG-002 Price Agent

### Dados

* product;
* offers;
* stores;
* shipping.

---

## F-003 — Deal Score

Determinar se o preço atual é realmente bom.

### Agent

AG-004 Deal Agent

### Resultado

```text
score
classification
average_price
lowest_price
discount_percentage
```

---

## F-004 — Price History

Manter histórico dos preços.

### Agent

AG-002 Price Agent

---

## F-005 — Price Alert

Permitir que o usuário defina um preço-alvo.

### Agent

AG-005 Alert Agent

---

## F-006 — Affiliate Tracking

Registrar cliques e origem.

### Agent

AG-006 Affiliate Agent

---

# 11. Agents

## AG-001 — Product Agent

### Responsabilidade

Identificar e normalizar produtos.

### Prioridade de matching

```text
EAN/GTIN
   ↓
SKU/MPN
   ↓
Brand + Name + Size
   ↓
Semantic Match
```

---

## AG-002 — Price Agent

### Responsabilidade

* coletar preços;
* normalizar valores;
* atualizar ofertas;
* registrar histórico;
* controlar `last_checked_at`.

---

## AG-003 — Matching Agent

### Responsabilidade

Determinar se uma oferta pertence ao produto correto.

### Output

```json
{
  "product_id": "UUID",
  "offer_id": "UUID",
  "match_type": "ean",
  "confidence": 0.99,
  "verified": true
}
```

---

## AG-004 — Deal Agent

### Responsabilidade

Calcular qualidade da oferta.

### Hipótese inicial

```text
< 70% da média → excellent
70–85%        → good
85–105%       → normal
> 105%        → expensive
```

Essas regras deverão ser recalibradas com dados reais.

---

## AG-005 — Alert Agent

### Responsabilidade

Processar alertas ativos.

### Fluxo

```text
buscar alertas
     ↓
buscar melhor preço
     ↓
comparar target_price
     ↓
disparar notificação
     ↓
atualizar last_triggered_at
```

---

## AG-006 — Affiliate Agent

### Responsabilidade

* registrar clique;
* identificar origem;
* identificar campanha;
* direcionar para URL afiliada.

---

# 12. API — Endpoints

## Categories

```http
GET /categories
GET /categories?id=eq.{id}
```

---

## Brands

```http
GET /brands
GET /brands?id=eq.{id}
POST /brands
PATCH /brands?id=eq.{id}
```

---

## Products

```http
GET /products
GET /products?id=eq.{id}
GET /products?category_id=eq.{id}
GET /products?brand_id=eq.{id}
POST /products
PATCH /products?id=eq.{id}
```

---

## Product Identifiers

```http
GET /product_identifiers
GET /product_identifiers?product_id=eq.{id}
GET /product_identifiers?identifier_value=eq.{value}
POST /product_identifiers
```

---

## Stores

```http
GET /stores
GET /stores?id=eq.{id}
POST /stores
PATCH /stores?id=eq.{id}
```

---

## Offers

```http
GET /offers
GET /offers?id=eq.{id}
GET /offers?product_id=eq.{id}
GET /offers?product_id=eq.{id}&order=price.asc
GET /offers?product_id=eq.{id}&is_active=is.true
POST /offers
PATCH /offers?id=eq.{id}
```

---

## Price History

```http
GET /price_history
GET /price_history?offer_id=eq.{id}&order=captured_at.desc
POST /price_history
```

---

## Best Offers

View:

```text
best_product_offers
```

Endpoint:

```http
GET /best_product_offers?product_id=eq.{id}
```

---

## Product Price History

View:

```text
product_price_history
```

Endpoint:

```http
GET /product_price_history?product_id=eq.{id}
```

---

## Deal Summary

View:

```text
product_deal_summary
```

Endpoint:

```http
GET /product_deal_summary?product_id=eq.{id}
```

---

## Alerts

```http
GET /alerts
POST /alerts
PATCH /alerts?id=eq.{id}
```

---

## Affiliate

```http
GET /affiliate_clicks
POST /affiliate_clicks
```

---

# 13. Domain Actions

Operações complexas não serão tratadas como simples CRUD.

O Worker será responsável por:

```text
identify-product
search-offers
match-product
calculate-deal
process-alerts
```

A primeira implementação pode ser executada diretamente como jobs internos do Worker.

Caso seja necessário expor essas ações via HTTP posteriormente, será criada uma camada de API específica.

---

# 14. Jobs

## JOB-001 — Ingest Prices

```text
Store/API/Scraper
       ↓
Price Agent
       ↓
normalize
       ↓
Offer
       ↓
Price History
```

---

## JOB-002 — Match Products

```text
new offers
    ↓
Product Agent
    ↓
Matching Agent
    ↓
Product Match
```

---

## JOB-003 — Calculate Deals

```text
offers
   +
price_history
   ↓
Deal Agent
   ↓
deal_scores
```

---

## JOB-004 — Process Alerts

```text
alerts ativos
      ↓
melhor preço
      ↓
target_price
      ↓
notificação
```

---

# 15. Segurança

## Client

A Chrome Extension nunca terá credenciais administrativas.

```text
Chrome Extension
       ↓
JWT / credencial pública limitada
       ↓
PostgREST
       ↓
PostgreSQL
```

## Worker

O Worker terá credenciais privadas próprias.

```text
Worker
   ↓
private database credentials
   ↓
PostgreSQL
```

Essas credenciais nunca serão enviadas ao navegador.

---

# 16. Controle de acesso

Dados públicos:

```text
categories
brands
products
stores
offers
price_history
```

Dados privados:

```text
users
alerts
affiliate_clicks
```

As operações privadas deverão validar o usuário autenticado.

---

# 17. Views públicas

O backend terá inicialmente:

```text
best_product_offers
product_price_history
product_deal_summary
```

Essas views funcionarão como contratos de consulta para a extensão.

---

# 18. Postman

Collection:

```text
Elite Bot API
│
├── 00 Health
├── 01 Categories
├── 02 Brands
├── 03 Products
├── 04 Product Identifiers
├── 05 Stores
├── 06 Offers
├── 07 Price History
├── 08 Product Matches
├── 09 Deal Scores
├── 10 Best Offers
├── 11 Deal Summary
├── 12 Alerts
└── 13 Affiliate
```

---

# 19. Postman Environment

Variáveis:

```text
base_url
api_key
jwt_token

category_id
brand_id
product_id
identifier_id
store_id
offer_id
alert_id
```

Exemplo:

```text
base_url=http://localhost:3000
```

Posteriormente:

```text
base_url=https://api.elitebot.com
```

A Collection permanece a mesma.

---

# 20. Test Strategy

A validação seguirá a ordem:

```text
PostgreSQL
    ↓
PostgREST
    ↓
Postman
    ↓
Worker
    ↓
Extension
```

### Testes mínimos

```text
T-001 Database connection
T-002 Categories GET
T-003 Product creation
T-004 Product GET
T-005 Store creation
T-006 Offer creation
T-007 Offer filtering
T-008 Price history
T-009 Best offer
T-010 Deal summary
T-011 Alert creation
T-012 Affiliate click
```

---

# 21. Estrutura do repositório

```text
elite-bot-backend/
│
├── docs/
│   ├── architecture.md
│   ├── business-rules.md
│   └── api.md
│
├── database/
│   ├── schema.md
│   ├── relationships.md
│   ├── indexes.md
│   ├── security.md
│   │
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_indexes.sql
│       ├── 003_views.sql
│       └── 004_security.sql
│
├── postgrest/
│   └── config/
│
├── worker/
│   ├── src/
│   │   ├── agents/
│   │   ├── jobs/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── database/
│   │   └── index.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── postman/
│   ├── Elite-Bot.postman_collection.json
│   └── Elite-Bot.postman_environment.json
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

# 22. Docker

Para desenvolvimento local, a arquitetura poderá ser executada como:

```text
docker-compose
│
├── postgres
├── postgrest
└── worker
```

Opcionalmente:

```text
└── pgadmin
```

O ambiente local deverá permitir executar todo o backend sem depender de serviços externos.

---

# 23. Environment Variables

### PostgreSQL

```text
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
```

### PostgREST

```text
PGRST_DB_URI
PGRST_DB_SCHEMA
PGRST_DB_ANON_ROLE
PGRST_JWT_SECRET
```

### Worker

```text
DATABASE_URL
POSTGREST_URL
JWT_SECRET
```

Credenciais reais nunca devem entrar no Git.

---

# 24. Observabilidade inicial

O Worker deverá registrar:

```text
job
started_at
finished_at
duration
status
records_processed
records_created
records_updated
errors
```

Exemplo:

```text
JOB ingest-prices

status: success
duration: 18.4s
stores: 3
offers_found: 142
offers_updated: 119
offers_created: 23
errors: 0
```

---

# 25. MVP Scope

## Entram

* PostgreSQL;
* PostgREST;
* Worker;
* Product;
* Brand;
* Category;
* Store;
* Offer;
* Price History;
* Deal Score;
* Alert;
* Affiliate Click;
* Postman;
* Cron;
* primeira integração de preço.

## Não entram inicialmente

* aplicativo mobile;
* marketplace próprio;
* sistema social;
* chat;
* recomendação avançada por IA;
* programa de assinatura;
* dezenas de integrações;
* n8n;
* infraestrutura complexa de microsserviços.

---

# 26. Critério de pronto do Backend MVP

O backend será considerado funcional quando for possível executar:

```text
1. Criar produto
        ↓
2. Criar loja
        ↓
3. Criar oferta
        ↓
4. Registrar preço
        ↓
5. Consultar histórico
        ↓
6. Calcular Deal Score
        ↓
7. Consultar melhor oferta
        ↓
8. Criar alerta
        ↓
9. Worker processar alerta
        ↓
10. Registrar clique afiliado
```

Tudo isso deverá ser reproduzível através do Postman e dos jobs do Worker.

---

# 27. Traceability

A estrutura oficial de rastreabilidade será:

```text
VISION
  ↓
FEATURE
  ↓
AGENT
  ↓
JOB / ENDPOINT
  ↓
DATABASE
  ↓
POSTMAN TEST
```

Exemplo:

```text
F-002 Price Comparison
        ↓
AG-002 Price Agent
        ↓
JOB-001 Ingest Prices
        ↓
offers
price_history
        ↓
EP-010 GET /offers?product_id
        ↓
Postman T-007
```

---

# 28. Decisão arquitetural

A versão 0.2 não possui dependência de:

* Supabase;
* Oracle Cloud;
* Firebase;
* AWS;
* Azure;
* GCP;
* Neon;
* Railway;
* Render.

Esses serviços poderão ser utilizados posteriormente apenas como infraestrutura de hospedagem.

O contrato principal permanece:

```text
PostgreSQL
     +
PostgREST
     +
Worker TypeScript
     +
Cron
     +
Postman
```

Isso mantém o Elite Bot portátil entre diferentes provedores de infraestrutura.

---

# 29. Próximas entregas técnicas

Ordem recomendada:

```text
01. 001_initial_schema.sql
        ↓
02. Docker Compose
        ↓
03. PostgreSQL local
        ↓
04. PostgREST local
        ↓
05. Postman Collection
        ↓
06. Testes CRUD
        ↓
07. Worker TypeScript
        ↓
08. Product Agent
        ↓
09. Price Agent
        ↓
10. Matching Agent
        ↓
11. Deal Agent
        ↓
12. Alert Agent
        ↓
13. Primeiro scraper/API de loja
        ↓
14. Chrome Extension
```

**Decisão da v0.2:** nenhuma lógica de negócio depende de Supabase. O backend pode ser instalado em qualquer infraestrutura que rode PostgreSQL + PostgREST + Node.js.
