# Elite Bot

**Uma extensão Chrome gratuita que identifica produtos de perfumes, skincare e roupas, compara ofertas, avalia se o preço está realmente bom e permite ao usuário ser avisado quando o produto atingir o preço desejado, monetizando através de afiliados.**

---

## Produtos

| Produto | Descrição |
|---|---|
| Chrome Extension | Interface principal — identifica produtos e exibe deals em tempo real |
| Website (Guia do Homem Barato) | Canal de conteúdo, SEO e aquisição |
| Backend | PostgreSQL + PostgREST + Worker |

---

## Stack

```text
Database:   PostgreSQL 16
API:        PostgREST 12
Worker:     Node.js + TypeScript
Extension:  TypeScript + React + Tailwind + Manifest V3
Website:    Next.js 14 + TypeScript + Tailwind
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js](https://nodejs.org/) 20+ (para o Worker e a Extension)

---

## Subir o ambiente local

### 1. Clone e configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e altere pelo menos `POSTGRES_PASSWORD` e `PGRST_JWT_SECRET` para valores únicos locais.

### 2. Suba o banco e a API

```bash
docker compose up -d
```

O Docker Compose irá:
1. Subir o **PostgreSQL** na porta `5432`
2. Executar automaticamente [`database/migrations/001_initial_schema.sql`](database/migrations/001_initial_schema.sql) na primeira inicialização
3. Subir o **PostgREST** na porta `3000` apontando para o banco

### 3. Verifique que a API está respondendo

```bash
curl http://localhost:3000/categories
```

Resposta esperada:
```json
[
  {"id":"...","name":"Perfumes","slug":"perfumes",...},
  {"id":"...","name":"Skincare","slug":"skincare",...},
  {"id":"...","name":"Roupas","slug":"roupas",...}
]
```

### 4. (Opcional) Subir o pgAdmin

```bash
docker compose --profile tools up -d
```

Acesse em `http://localhost:5050` com as credenciais definidas em `.env`.

---

## Parar o ambiente

```bash
docker compose down
```

Para remover também os volumes (apaga o banco):

```bash
docker compose down -v
```

---

## Estrutura do repositório

```text
elite-bot/
│
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql   ← schema completo (tabelas, views, índices, seed)
│
├── postgrest/
│   └── postgrest.conf               ← configuração de referência do PostgREST
│
├── Specs/
│   ├── Elite Bot-Guia do Homem Barato.md      ← Spec Fundamental
│   ├── Elite-Bot-Backend-Specification.md     ← Spec Backend
│   ├── Elite-Bot-Frontend-Specification.md    ← Spec Frontend
│   ├── Elite-Bot-API-Specification.md         ← Spec API
│   └── Elite-Bot-Postman-Specification.md     ← Spec Postman
│
├── .env.example        ← variáveis necessárias (copie para .env)
├── docker-compose.yml  ← ambiente local completo
└── README.md
```

---

## API

A API é servida pelo PostgREST em `http://localhost:3000`.

Consulte a [Spec API](Specs/Elite-Bot-API-Specification.md) para a documentação completa de endpoints, filtros, contratos de resposta e controle de acesso.

### Exemplos rápidos

```bash
# Listar categorias
curl http://localhost:3000/categories

# Listar produtos de uma categoria
curl "http://localhost:3000/products?category_id=eq.<uuid>"

# Melhores ofertas de um produto
curl "http://localhost:3000/best_product_offers?product_id=eq.<uuid>&order=total_price.asc"

# Resumo de deal de um produto
curl "http://localhost:3000/product_deal_summary?product_id=eq.<uuid>"
```

---

## Testes com Postman

Importe os arquivos da pasta `postman/` no Postman:

```text
postman/
├── Elite-Bot.postman_collection.json
└── Elite-Bot.postman_environment.json   ← não commitar com credenciais reais
```

Consulte a [Spec Postman](Specs/Elite-Bot-Postman-Specification.md) para a documentação completa dos testes.

---

## Roadmap V1

```text
✅ FASE 1 — Infraestrutura     PostgreSQL + PostgREST + Docker
⬜ FASE 2 — Core Backend       Products, Stores, Offers, Price History
⬜ FASE 3 — Inteligência       Product Agent, Matching Agent, Deal Agent
⬜ FASE 4 — Extension          Content Script, Background, Popup
⬜ FASE 5 — Monetização        Affiliate Tracking + Redirect
⬜ FASE 6 — Retenção           Users, Alerts, Notifications
⬜ FASE 7 — Acquisition        Website / Guia do Homem Barato
```

---

## Documentação

| Documento | Conteúdo |
|---|---|
| 🎨 [**Espec. de Design & Prompt Google Stitch**](GOOGLE_STITCH_DESIGN_SPEC.md) | **Guia visual Dark Cyber-Luxe e prompt pronto para o Google Stitch AI** |
| 📗 [**Documentação Técnica da API**](API_DOCUMENTATION.md) | **Guia completo da API REST, Quickstart, RLS, Endpoints e Matriz de Erros** |
| 🧪 [**Guia de Testes Postman / Newman**](POSTMAN_GUIDE.md) | **Como rodar e validar a suíte de testes da API via Postman ou CLI** |
| [Spec Fundamental](Specs/Elite%20Bot-Guia%20do%20Homem%20Barato.md) | Visão, arquitetura, fluxos, roadmap |
| [Spec Backend](Specs/Elite-Bot-Backend-Specification.md) | Entidades, agents, jobs, segurança |
| [Spec Frontend](Specs/Elite-Bot-Frontend-Specification.md) | Telas, componentes, fluxos de UI |
| [Spec API](Specs/Elite-Bot-API-Specification.md) | Endpoints, contratos, controle de acesso |
| [Spec Postman](Specs/Elite-Bot-Postman-Specification.md) | Collection, environments, testes |



