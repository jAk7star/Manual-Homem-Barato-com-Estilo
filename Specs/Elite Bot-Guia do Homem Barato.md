# Elite Bot — Spec Fundamental da Solução V1.0

**Projeto:** Elite Bot / Guia do Homem Barato
**Versão:** V1.0
**Status:** Visão técnica e funcional
**Modelo:** Chrome Extension + Backend + Worker + Website
**Monetização:** Affiliate Marketing

---

# 1. Visão do Produto

O **Elite Bot** é uma extensão para Chrome que ajuda homens interessados em estilo, aparência e autocuidado a encontrar melhores oportunidades de compra.

O produto atua no momento em que o usuário está pesquisando ou comprando um produto.

A extensão identifica o produto, consulta ofertas disponíveis, compara preços e apresenta uma avaliação simples:

> **"Vale a pena comprar agora?"**

Quando o usuário quiser pagar menos, poderá criar um alerta de preço.

O **Guia do Homem Barato** será a camada de conteúdo, SEO e aquisição de usuários.

---

# 2. Problema

O usuário encontra um produto que deseja comprar, mas não sabe:

* se aquele preço é realmente bom;
* se existe uma oferta melhor;
* se outra loja vende o mesmo produto mais barato;
* se vale a pena esperar;
* qual foi o preço histórico;
* se aquela "promoção" é realmente uma promoção.

Hoje ele precisa pesquisar manualmente em várias lojas.

---

# 3. Proposta de Valor

### Antes

```text
Encontrar produto
       ↓
Pesquisar Google
       ↓
Abrir várias lojas
       ↓
Comparar preços
       ↓
Pesquisar histórico
       ↓
Decidir
```

### Depois

```text
Encontrar produto
       ↓
Elite Bot identifica
       ↓
Compara ofertas
       ↓
Analisa preço
       ↓
Mostra oportunidade
       ↓
Usuário decide
```

### Promessa

> **Encontre as melhores ofertas para evoluir seu estilo, sem perder tempo caçando preços.**

---

# 4. Escopo da V1

A V1 deverá resolver quatro problemas principais:

```text
1. Identificar o produto
2. Encontrar/comparar ofertas
3. Avaliar se o preço é bom
4. Avisar quando o preço atingir o valor desejado
```

Além disso:

```text
5. Registrar cliques de afiliados
```

---

# 5. Produtos da V1

## 5.1 Chrome Extension

Principal produto de interação.

Responsabilidades:

* identificar produto da página;
* consultar backend;
* mostrar melhor oferta;
* mostrar Deal Score;
* mostrar economia;
* permitir criar alerta;
* direcionar para oferta afiliada.

---

## 5.2 Website — Guia do Homem Barato

Responsável por:

* SEO;
* conteúdo;
* descoberta de produtos;
* artigos;
* páginas de categoria;
* aquisição de usuários;
* direcionamento para a extensão.

---

## 5.3 Backend

Responsável por:

* catálogo;
* ofertas;
* preços;
* histórico;
* Deal Score;
* alertas;
* afiliados.

---

## 5.4 Worker

Responsável pelo processamento assíncrono:

* coleta de preços;
* scraping;
* integração com lojas;
* identificação;
* matching;
* cálculo de Deal Score;
* processamento de alertas.

---

# 6. Arquitetura da Solução

```text
                    ┌──────────────────────┐
                    │      WEBSITE         │
                    │ Guia Homem Barato    │
                    │ React / Next.js      │
                    └──────────┬───────────┘
                               │
                               │ REST
                               ▼
                    ┌──────────────────────┐
                    │      POSTGREST       │
                    │       API REST       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      POSTGRESQL      │
                    │       DATABASE       │
                    └──────────▲───────────┘
                               │
                               │
                    ┌──────────┴───────────┐
                    │       WORKER         │
                    │ Node.js + TypeScript │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
             APIs           Scrapers       Affiliate
             Lojas          Lojas          Networks


                    ┌──────────────────────┐
                    │   CHROME EXTENSION   │
                    │ TypeScript + React   │
                    └──────────┬───────────┘
                               │
                               ▼
                         PostgREST API
```

---

# 7. Stack Frontend

## 7.1 Chrome Extension

### Stack

```text
TypeScript
React
Tailwind CSS
Chrome Extensions Manifest V3
```

### Componentes

```text
extension/
├── popup
├── content-script
├── background
├── services
├── components
└── styles
```

### Responsabilidades

### Content Script

Executa na página do e-commerce.

Responsável por:

* detectar título;
* detectar marca;
* detectar preço;
* detectar EAN/GTIN quando disponível;
* identificar informações do produto;
* enviar informações ao backend.

---

### Background Service

Responsável por:

* comunicação com API;
* autenticação;
* armazenamento local;
* gerenciamento de eventos;
* abertura de links;
* notificações.

---

### Popup

Interface principal do usuário.

Exemplo:

```text
┌──────────────────────────────┐
│        ELITE BOT              │
│                              │
│ Dior Sauvage EDT 100ml       │
│                              │
│ Preço atual                  │
│ R$ 449,90                    │
│                              │
│ Melhor oferta                │
│ R$ 379,90                    │
│                              │
│ Economia                     │
│ R$ 70,00                     │
│                              │
│ 🟢 EXCELENTE OFERTA          │
│                              │
│ [ VER MELHOR OFERTA ]        │
│                              │
│ 🔔 Avisar quando chegar      │
│    a R$ 350                  │
└──────────────────────────────┘
```

---

# 8. Stack Website

### Stack sugerida

```text
Next.js
React
TypeScript
Tailwind CSS
```

Responsabilidades:

* SEO;
* conteúdo;
* landing page;
* categorias;
* páginas de produtos;
* artigos;
* CTA para instalação da extensão.

### Estrutura

```text
website/
├── home
├── blog
├── categories
├── products
├── offers
└── extension-cta
```

---

# 9. Stack Backend

```text
PostgreSQL
PostgREST
Node.js
TypeScript
Cron
Postman
```

### Não faz parte da V1

```text
Supabase
Oracle Cloud
Firebase
n8n
Microservices
Kubernetes
```

A infraestrutura de hospedagem poderá ser escolhida posteriormente.

---

# 10. PostgreSQL

Responsável pela persistência.

### Principais tabelas

```text
categories
brands
products
product_identifiers
stores
offers
price_history
product_matches
deal_scores
users
alerts
affiliate_clicks
```

---

# 11. PostgREST

O PostgREST será a principal API de recursos.

### Responsabilidades

* GET;
* POST;
* PATCH;
* DELETE quando necessário;
* filtros;
* ordenação;
* paginação;
* relacionamentos;
* acesso controlado ao PostgreSQL.

---

# 12. Worker

O Worker representa o motor de processamento do Elite Bot.

```text
Worker
│
├── Product Agent
├── Price Agent
├── Matching Agent
├── Deal Agent
├── Alert Agent
└── Affiliate Agent
```

---

# 13. Agents da V1

## AG-001 Product Agent

Identifica o produto.

Entrada:

```text
URL
Título
Marca
EAN
SKU
```

Saída:

```text
Product ID
Confidence
Match Type
```

---

## AG-002 Price Agent

Busca e atualiza ofertas.

Responsabilidades:

```text
coleta
normalização
atualização
histórico
```

---

## AG-003 Matching Agent

Determina se duas ofertas representam o mesmo produto.

Prioridade:

```text
EAN/GTIN
SKU
MPN
Marca + Nome + Tamanho
Matching semântico
```

---

## AG-004 Deal Agent

Determina se o preço é bom.

Resultado:

```text
Score: 0–100

excellent
good
normal
expensive
```

---

## AG-005 Alert Agent

Processa alertas.

```text
Preço atual <= preço alvo
        ↓
Disparar alerta
```

---

## AG-006 Affiliate Agent

Registra e processa cliques.

---

# 14. Features V1

| ID    | Feature                  | Prioridade |
| ----- | ------------------------ | ---------- |
| F-001 | Identificação do produto | P0         |
| F-002 | Comparação de ofertas    | P0         |
| F-003 | Deal Score               | P0         |
| F-004 | Histórico de preços      | P1         |
| F-005 | Alerta de preço          | P1         |
| F-006 | Affiliate Tracking       | P0         |
| F-007 | Website/SEO              | P1         |
| F-008 | Login/usuário            | P1         |

---

# 15. Endpoints V1

## Catálogo

```http
GET /categories
GET /brands
GET /products
GET /products?id=eq.{id}
GET /product_identifiers
GET /stores
```

---

## Ofertas

```http
GET /offers
GET /offers?id=eq.{id}
GET /offers?product_id=eq.{id}
GET /offers?product_id=eq.{id}&order=price.asc
```

---

## Histórico

```http
GET /price_history
GET /price_history?offer_id=eq.{id}
GET /product_price_history?product_id=eq.{id}
```

---

## Deal

```http
GET /deal_scores
GET /product_deal_summary?product_id=eq.{id}
GET /best_product_offers?product_id=eq.{id}
```

---

## Alertas

```http
GET /alerts
POST /alerts
PATCH /alerts?id=eq.{id}
```

---

## Affiliate

```http
POST /affiliate_clicks
GET /affiliate_clicks
```

---

# 16. Endpoints de domínio futuros

Operações complexas não devem ser implementadas como CRUD simples.

Possíveis endpoints:

```http
POST /actions/identify-product
POST /actions/search-offers
POST /actions/match-product
POST /actions/calculate-deal
POST /actions/process-alerts
```

Essas operações serão executadas pelo Worker ou por uma camada de API de domínio.

---

# 17. Fluxo principal — Usuário

```text
Usuário abre produto
        ↓
Chrome Extension
        ↓
Content Script identifica informações
        ↓
API
        ↓
Product Identification
        ↓
Produto encontrado
        ↓
Busca ofertas
        ↓
Calcula Deal Score
        ↓
Retorna resultado
        ↓
Extension mostra:
        │
        ├── preço atual
        ├── melhor preço
        ├── economia
        ├── Deal Score
        └── classificação
```

---

# 18. Fluxo de compra

```text
Usuário vê oferta
       ↓
"VER MELHOR OFERTA"
       ↓
POST /affiliate_clicks
       ↓
Affiliate URL
       ↓
Loja
       ↓
Compra
       ↓
Comissão
```

---

# 19. Fluxo de alerta

```text
Usuário
   ↓
define R$350
   ↓
POST /alerts
   ↓
PostgreSQL
   ↓
Cron
   ↓
Worker
   ↓
Price Agent
   ↓
melhor preço = R$339
   ↓
Alert Agent
   ↓
notificação
```

---

# 20. Fluxo de ingestão

```text
Cron
  ↓
Worker
  ↓
Store Connector
  ↓
API / Feed / Scraper
  ↓
Product Agent
  ↓
Matching Agent
  ↓
Offer
  ↓
Price History
  ↓
Deal Agent
  ↓
Deal Score
```

---

# 21. Postman

O Postman será utilizado como ferramenta oficial de validação da API.

### Collection

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

# 22. Contrato entre Frontend e Backend

A extensão não deverá conhecer detalhes internos do Worker.

Ela conhece somente a API.

```text
Extension
    ↓
PostgREST
    ↓
Database
```

O Worker pode modificar os dados sem exigir mudanças na extensão, desde que o contrato da API seja preservado.

---

# 23. Contrato de resposta principal

A extensão deverá consumir um modelo próximo de:

```json
{
  "product": {
    "id": "uuid",
    "name": "Dior Sauvage EDT 100ml",
    "brand": "Dior"
  },
  "deal": {
    "score": 92,
    "classification": "excellent",
    "current_price": 379.90,
    "average_price": 449.90,
    "lowest_price": 359.90,
    "saving": 70.00
  },
  "offers": [
    {
      "offer_id": "uuid",
      "store": "Loja A",
      "price": 379.90,
      "shipping": 0,
      "total": 379.90,
      "affiliate_url": "..."
    }
  ]
}
```

---

# 24. Segurança

```text
Chrome Extension
       ↓
Autenticação/JWT
       ↓
PostgREST
       ↓
PostgreSQL
```

Credenciais administrativas:

```text
NUNCA
↓
Chrome Extension
```

O Worker terá credenciais privadas próprias.

---

# 25. Observabilidade V1

O Worker deverá registrar:

```text
job
status
duration
records_processed
records_created
records_updated
errors
```

A V1 não exige uma plataforma completa de observabilidade.

Logs estruturados são suficientes inicialmente.

---

# 26. Escopo fora da V1

Não fazem parte da primeira versão:

* aplicativo mobile;
* marketplace;
* comunidade;
* rede social;
* chatbot;
* recomendação personalizada avançada;
* IA generativa como feature principal;
* assinatura paga;
* dezenas de categorias;
* dezenas de lojas;
* sistema distribuído;
* Kubernetes;
* arquitetura de microsserviços.

---

# 27. Critério de sucesso técnico

A V1 estará tecnicamente funcional quando o seguinte fluxo funcionar:

```text
Página de produto
       ↓
Extension identifica
       ↓
Backend encontra produto
       ↓
Backend possui ofertas
       ↓
Melhor preço calculado
       ↓
Deal Score calculado
       ↓
Extension exibe resultado
       ↓
Usuário clica
       ↓
Affiliate click registrado
```

E:

```text
Usuário cria alerta
       ↓
Worker verifica preço
       ↓
Preço atinge objetivo
       ↓
Alerta é processado
```

---

# 28. Critério de sucesso de negócio

A V1 deve provar:

```text
Instalação
    ↓
Ativação
    ↓
Uso
    ↓
Clique em oferta
    ↓
Compra
    ↓
Comissão
```

Métricas principais:

* instalações;
* usuários ativos;
* produtos analisados;
* ofertas encontradas;
* affiliate clicks;
* conversão;
* receita por usuário;
* retenção;
* alertas criados;
* alertas acionados.

---

# 29. Roadmap V1

```text
FASE 1
Infraestrutura
│
├── PostgreSQL
├── PostgREST
├── Docker
└── Postman

        ↓

FASE 2
Core Backend
│
├── Products
├── Stores
├── Offers
└── Price History

        ↓

FASE 3
Inteligência
│
├── Product Agent
├── Matching Agent
└── Deal Agent

        ↓

FASE 4
Extension
│
├── Content Script
├── Background
└── Popup

        ↓

FASE 5
Monetização
│
├── Affiliate Tracking
└── Affiliate Redirect

        ↓

FASE 6
Retenção
│
├── Users
├── Alerts
└── Notifications

        ↓

FASE 7
Acquisition
│
└── Guia do Homem Barato / SEO
```

---

# 30. Visão final da V1

```text
                  ELITE BOT V1
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
   EXTENSION        WEBSITE          BACKEND
       │               │                │
       │               │                ├── PostgreSQL
       │               │                ├── PostgREST
       │               │                └── Worker
       │               │
       ▼               ▼
   Compra           Aquisição
   inteligente     / SEO
       │
       ▼
   Comparação
       │
       ▼
   Deal Score
       │
       ▼
   Alertas
       │
       ▼
   Affiliate
       │
       ▼
   Receita
```

---

# 31. Decisão arquitetural V1

A solução deverá ser construída de forma desacoplada do provedor de infraestrutura.

### Core

```text
PostgreSQL
PostgREST
Node.js / TypeScript Worker
Chrome Extension
Website
Postman
Cron
```

### Infraestrutura

A definir posteriormente:

```text
VPS
Cloud
PaaS
Managed PostgreSQL
```

A troca do provedor não deverá exigir mudança no domínio do produto.

---

# 32. Traceability

Toda implementação deverá conseguir ser rastreada:

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
   ↓
FRONTEND
```

Exemplo:

```text
F-002 Price Comparison
        ↓
AG-002 Price Agent
        ↓
JOB-001 Ingest Prices
        ↓
offers + price_history
        ↓
GET /best_product_offers
        ↓
Postman T-010
        ↓
Extension OfferCard
```

---

# 33. Definição da V1 em uma frase

> **Uma extensão Chrome gratuita que identifica produtos de perfumes, skincare e roupas, compara ofertas, avalia se o preço está realmente bom e permite ao usuário ser avisado quando o produto atingir o preço desejado, monetizando através de afiliados.**
  
## Pendencia de documentação

  SPEC FUNDAMENTAL
       │
       ├── SPEC FRONTEND
       │      └── telas + componentes + fluxos
       │
       ├── SPEC BACKEND
       │      └── banco + Worker + agents
       │
       ├── SPEC API
       │      └── endpoints + contratos
       │
       └── SPEC POSTMAN
              └── collections + testes