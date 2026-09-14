# Elite Bot / Guia do Homem Barato

> Contexto oficial do projeto para desenvolvimento no Cursor.
>
> Este arquivo representa o estado consolidado do projeto após a fase de definição de produto, arquitetura e implementação inicial do backend.
>
> **Leia este arquivo antes de modificar código.**
>
> O objetivo é evitar duplicação, decisões conflitantes, mudança arbitrária de arquitetura e perda de contexto.

---

# 1. REGRA PRINCIPAL PARA O CURSOR

Antes de implementar qualquer tarefa:

1. Inspecione o código existente.
2. Leia este `PROJECT_CONTEXT.md`.
3. Procure implementações existentes da mesma responsabilidade.
4. Reutilize tabelas, tipos, services, agents, jobs, views e contratos existentes.
5. Não crie uma segunda implementação para algo que já existe.
6. Não altere a arquitetura sem identificar explicitamente o conflito.
7. Não invente regras de negócio.
8. Não introduza novas tecnologias sem necessidade.
9. Não altere o contrato da API sem avaliar impacto no frontend.
10. Preserve compatibilidade com o PostgreSQL/PostgREST/Worker existentes.
11. Execute typecheck/testes relevantes depois das alterações.
12. Reporte claramente:

* o que foi alterado;
* arquivos alterados;
* testes executados;
* resultado;
* eventuais riscos ou decisões pendentes.

## Princípio

> **Implementar primeiro. Reinventar somente quando houver necessidade comprovada.**

---

# 2. IDENTIDADE DO PRODUTO

## Nome

**Elite Bot**

## Ecossistema

**Guia do Homem Barato**

## Posicionamento

"Homem barato" não significa homem de baixa qualidade.

Significa:

> O homem que quer ficar melhor sem ser trouxa com dinheiro.

## Resumo

O Elite Bot é uma extensão gratuita do Chrome que ajuda homens interessados em estilo, grooming, skincare e perfumaria a encontrar melhores preços para produtos que já estão considerando comprar.

A extensão identifica o produto na página da loja, encontra ofertas, compara preços, calcula um indicador de qualidade da oferta e permite criar alertas de preço.

O Guia do Homem Barato funciona como camada de conteúdo, SEO e aquisição.

---

# 3. PROMESSA DO PRODUTO

Promessa principal:

> **Encontre as melhores ofertas para evoluir seu estilo, sem perder tempo caçando preços.**

Exemplo de CTA:

> Ative o Elite Bot e seja avisado quando esse produto chegar ao preço que você quer pagar.

---

# 4. PROBLEMA

## Dor principal

> "Eu quero melhorar meu estilo e minha aparência, mas não quero pagar caro nas coisas que compro."

## Sintomas

* pesquisa manual em várias lojas;
* comparação manual de preços;
* espera por promoções;
* perda de ofertas;
* arrependimento depois da compra;
* acompanhamento de várias lojas;
* grupos de promoções;
* newsletters;
* compras impulsivas;
* dificuldade para saber se uma promoção realmente é boa.

## Custo da dor

### Tempo

Pesquisar várias lojas e acompanhar preços manualmente.

### Dinheiro

Pagar mais caro por falta de comparação ou comprar em um momento ruim.

### Risco

Ser influenciado por descontos artificiais ou promoções que parecem boas mas não são.

---

# 5. MERCADO

## Segmento

* E-commerce;
* afiliados;
* moda masculina;
* perfumaria;
* skincare;
* grooming;
* desenvolvimento pessoal;
* comparação de preços.

## Concorrentes / alternativas

### Diretos

* comparadores de preço;
* extensões de preço;
* extensões de cupom;
* sites de ofertas.

### Indiretos

* Google;
* Google Shopping;
* marketplaces;
* grupos de promoções;
* influencers;
* newsletters;
* sites de descontos.

## Lacuna

Grande parte das soluções responde:

> "Qual é o preço mais barato?"

Oportunidade do Elite Bot:

> "Esse preço realmente vale a pena?"

---

# 6. NICHO

## Nicho específico

Homens interessados em:

* estilo;
* moda masculina;
* perfumes;
* skincare;
* grooming;
* melhoria pessoal;
* aparência.

Comportamento:

* compram online;
* são sensíveis a preço;
* valorizam marcas/produtos bons;
* não querem pagar mais do que precisam;
* pesquisam antes de comprar.

## Deve ter

* interesse em melhoria pessoal;
* compra online;
* interesse por produtos de estilo/grooming;
* sensibilidade a preço.

## Não deve ter

O produto não deve tentar atender inicialmente:

* qualquer categoria de produto;
* qualquer público;
* marketplace completo;
* comunidade social;
* coaching;
* app mobile.

---

# 7. PERSONA

## Persona principal

Homem adulto jovem ou em fase de melhoria pessoal que quer melhorar sua imagem, estilo e aparência sem gastar dinheiro desnecessariamente.

## Objetivo

Comprar produtos bons pelo melhor preço possível.

## Dores

* não sabe se o preço atual é bom;
* não quer pesquisar várias lojas;
* perde promoções;
* não quer acompanhar preços manualmente;
* desconfia de promoções;
* quer economizar sem comprar produtos ruins.

## Objeções

* "Será que esse preço está realmente bom?"
* "Será que existe mais barato em outra loja?"
* "Esse desconto é real?"
* "Vale a pena comprar agora?"
* "Esse produto é realmente o mesmo?"

## Critério de sucesso

O usuário consegue analisar um produto em poucos segundos e entender:

1. qual é o produto;
2. qual é o melhor preço;
3. se a oferta é boa;
4. onde comprar;
5. se pode esperar por preço melhor.

---

# 8. FUNIL

```text
Guia do Homem Barato
        ↓
SEO / Conteúdo
        ↓
CTA
        ↓
Elite Bot
        ↓
Extensão detecta produto
        ↓
Backend identifica produto
        ↓
Compara ofertas
        ↓
Calcula Deal Score
        ↓
Usuário vê resultado
        ↓
Usuário clica na oferta
        ↓
Affiliate click
        ↓
Compra
        ↓
Comissão
```

---

# 9. MONETIZAÇÃO

## Modelo

Principal:

**Afiliados**

Secundário:

* tráfego;
* conteúdo;
* monetização do website.

## Não é V1

* assinatura paga;
* marketplace próprio;
* cobrança do usuário.

---

# 10. ESCOPO V1

A V1 precisa provar o seguinte loop:

```text
Página de produto
        ↓
Extension identifica produto
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

E também:

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

# 11. CATEGORIAS V1

Inicialmente:

1. Perfumes
2. Skincare
3. Roupas masculinas

Não expandir categorias sem decisão explícita de produto.

---

# 12. ANTI-ESCOPO

A V1 NÃO É:

* loja;
* marketplace;
* marca de roupas;
* comunidade;
* rede social;
* coaching;
* comparador genérico;
* app mobile;
* chatbot;
* produto de assinatura;
* sistema de recomendação personalizada avançada;
* plataforma com dezenas de categorias;
* plataforma com dezenas de lojas;
* arquitetura de microservices;
* Kubernetes;
* n8n;
* sistema de IA generativa como feature principal.

---

# 13. ARQUITETURA OFICIAL

## Stack

### Backend

* PostgreSQL
* PostgREST
* Node.js
* TypeScript
* Cron

### Frontend

Chrome Extension:

* TypeScript
* React
* Tailwind CSS
* Chrome Extensions Manifest V3

Website:

* Next.js
* React
* TypeScript
* Tailwind CSS

### Desenvolvimento

* Docker
* Postman
* Git

---

# 14. DECISÃO IMPORTANTE — SEM SUPABASE

O projeto **não utiliza Supabase**.

Não introduzir Supabase.

Também não utilizar como substituição automática:

* Firebase;
* Oracle;
* n8n;
* microservices;
* Kubernetes.

A infraestrutura de hospedagem ainda pode ser decidida posteriormente.

Essa decisão não deve alterar o domínio do sistema.

---

# 15. RESPONSABILIDADE DE CADA COMPONENTE

## PostgreSQL

Responsável por:

* persistência;
* integridade;
* relacionamentos;
* constraints;
* índices;
* views;
* segurança/RLS.

## PostgREST

Responsável por:

* API REST;
* CRUD;
* consultas;
* exposição controlada das tabelas/views.

PostgREST **não é scraper**.

## Worker

Responsável por:

* scraping;
* ingestão;
* normalização;
* matching;
* cálculo de deals;
* processamento de alertas;
* integrações com lojas;
* tarefas agendadas.

## Cron

Responsável por disparar jobs do Worker.

## Chrome Extension

Responsável por:

* detectar produto na página;
* enviar contexto ao backend;
* apresentar resultado;
* interação do usuário;
* alertas/notificações;
* affiliate click.

## Website

Responsável por:

* SEO;
* conteúdo;
* landing page;
* categorias;
* páginas de produto;
* aquisição.

---

# 16. DIAGRAMA DA ARQUITETURA

```text
                         ┌─────────────────────┐
                         │   Chrome Extension  │
                         └──────────┬──────────┘
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
                         └──────────▲──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │       Worker        │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  ▼                 ▼                 ▼
              APIs/Feeds        Scrapers          Affiliate
              de lojas          de lojas          services
```

Website também consome PostgREST.

---

# 17. SEGURANÇA

## Regra

A Chrome Extension nunca recebe:

* senha de banco;
* service role;
* credencial administrativa;
* `PGRST_JWT_SECRET`;
* credenciais de scraper.

## Worker

Possui credenciais privadas.

## Cliente

Usa credencial pública/JWT com permissões limitadas.

Fluxo:

```text
Extension
    ↓
JWT / credencial limitada
    ↓
PostgREST
    ↓
PostgreSQL + RLS
```

Worker:

```text
Worker
    ↓
credencial privada
    ↓
PostgreSQL/PostgREST
```

---

# 18. ENTIDADES PRINCIPAIS

As entidades atuais são:

1. `categories`
2. `brands`
3. `products`
4. `product_identifiers`
5. `stores`
6. `offers`
7. `price_history`
8. `product_matches`
9. `deal_scores`
10. `users`
11. `alerts`
12. `affiliate_clicks`

---

# 19. RELACIONAMENTOS

```text
categories
     ↓
 products ← brands
     ↓
 product_identifiers
     ↓
 offers ← stores
     ├── price_history
     ├── product_matches
     └── deal_scores

users
 ├── alerts → products
 └── affiliate_clicks → offers
```

---

# 20. BANCO — ESTADO ATUAL

A migration inicial já existe.

Arquivo principal:

```text
database/migrations/001_initial_schema.sql
```

Ela inclui:

* `pgcrypto`;
* enums;
* tabelas;
* constraints;
* índices;
* views;
* seed;
* triggers de `updated_at`.

---

# 21. ENUMS

## Product gender

```text
male
female
unisex
```

## Availability

```text
in_stock
out_of_stock
pre_order
unknown
```

## Identifier type

```text
ean
gtin
sku
mpn
brand_sku
```

## Match type

```text
ean
gtin
sku
exact
semantic
manual
```

## Deal classification

```text
excellent
good
normal
expensive
```

---

# 22. PRODUCTS

Campos principais:

```text
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

# 23. PRODUCT IDENTIFIERS

Usados para identificação e matching.

Tipos possíveis:

```text
ean
gtin
sku
mpn
brand_sku
```

## Regra importante

Não confundir:

* EAN;
* GTIN;
* SKU;
* MPN.

São identificadores diferentes.

---

# 24. STORES

Representam lojas suportadas.

Exemplo atualmente validado:

```text
Beleza na Web
belezanaweb.com.br
```

---

# 25. OFFERS

Campos principais:

```text
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

## Regra

`price` e `shipping_price` devem permanecer separados.

Não juntar os dois no banco.

O preço total pode ser calculado na view:

```text
total_price = price + shipping_price
```

---

# 26. PRICE HISTORY

Campos:

```text
id
offer_id
price
original_price
shipping_price
captured_at
```

Cada ingestão de preço relevante pode gerar registro histórico.

---

# 27. PRODUCT MATCHES

Responsável por registrar relação entre produto e oferta.

Matching pode utilizar:

```text
EAN/GTIN
    ↓
SKU
    ↓
MPN
    ↓
Brand + Name + Size
    ↓
Semantic Match
```

Quanto mais forte o identificador, maior a confiança.

---

# 28. DEAL SCORES

Campos:

```text
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

Score:

```text
0–100
```

Classificação:

```text
excellent
good
normal
expensive
```

## Regra inicial

Hipótese atual:

```text
< 70% da média     → excellent
70–85%             → good
85–105%            → normal
> 105%             → expensive
```

Essa regra é uma hipótese e deve ser calibrada com dados reais.

Não modificar arbitrariamente.

---

# 29. ALERTS

Campos:

```text
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

Fluxo:

```text
alert ativo
    ↓
Worker consulta preço
    ↓
best/current price <= target_price
    ↓
disparar alerta
    ↓
atualizar last_triggered_at
```

---

# 30. AFFILIATE CLICKS

Campos:

```text
id
user_id
offer_id
source
campaign
clicked_at
```

Responsável por registrar intenção/clique de afiliado.

---

# 31. VIEWS OFICIAIS

Existem três views fundamentais para o frontend:

## `best_product_offers`

Contrato inicial da Extension.

Retorna dados como:

```text
product_id
store_name
store_domain
price
shipping_price
total_price
currency
availability
product_url
affiliate_url
score
classification
```

## `product_price_history`

Contrato de histórico.

Retorna:

```text
product_name
store_name
price
shipping_price
total_price
captured_at
```

## `product_deal_summary`

Resumo do produto:

```text
current_best_price
average_price
lowest_price
score
classification
```

---

# 32. CONTRATO FRONTEND VALIDADO

Os três endpoints/views abaixo foram testados com dados reais:

```text
GET /best_product_offers?product_id=eq.{id}

GET /product_price_history?product_id=eq.{id}

GET /product_deal_summary?product_id=eq.{id}
```

## Resultado

P1:

```text
3/3 PASS
```

Portanto:

> **Essas três views são o contrato inicial da Extension.**

Não alterar seus nomes/campos sem necessidade e sem avaliar impacto.

---

# 33. API POSTGREST

## Categories

```http
GET /categories
GET /categories?id=eq.{id}
```

## Brands

```http
GET /brands
GET /brands?id=eq.{id}
POST /brands
PATCH /brands?id=eq.{id}
```

## Products

```http
GET /products
GET /products?id=eq.{id}
GET /products?category_id=eq.{id}
GET /products?brand_id=eq.{id}
POST /products
PATCH /products?id=eq.{id}
```

## Product Identifiers

```http
GET /product_identifiers
GET /product_identifiers?product_id=eq.{id}
GET /product_identifiers?identifier_value=eq.{value}
POST /product_identifiers
```

## Stores

```http
GET /stores
GET /stores?id=eq.{id}
POST /stores
PATCH /stores?id=eq.{id}
```

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

## Price History

```http
GET /price_history
GET /price_history?offer_id=eq.{id}&order=captured_at.desc
POST /price_history
GET /product_price_history?product_id=eq.{id}
```

## Deal

```http
GET /deal_scores
GET /product_deal_summary?product_id=eq.{id}
GET /best_product_offers?product_id=eq.{id}
```

## Alerts

```http
GET /alerts
POST /alerts
PATCH /alerts?id=eq.{id}
```

## Affiliate

```http
GET /affiliate_clicks
POST /affiliate_clicks
```

---

# 34. DOMAIN ACTIONS

Operações complexas não devem ser tratadas como CRUD simples.

Possíveis ações:

```http
POST /actions/identify-product
POST /actions/search-offers
POST /actions/match-product
POST /actions/calculate-deal
POST /actions/process-alerts
```

Essas ações podem permanecer internas no Worker.

Não expor externamente sem necessidade real.

---

# 35. AGENTS DO PRODUTO

Os agents abaixo são módulos de domínio do software.

Eles **não são necessariamente agentes de IA no Cursor**.

## AG-001 Product Agent

Responsabilidade:

* identificar produto;
* normalizar produto;
* processar identificadores.

Entrada pode conter:

* URL;
* título;
* marca;
* EAN;
* SKU;
* MPN.

Saída esperada:

```json
{
  "product_id": "UUID",
  "confidence": 0.98,
  "match_type": "ean"
}
```

## Estado importante

Atualmente o Product Agent aceita/usa principalmente:

```text
ean?: string
```

A extensão de identificadores para SKU/MPN deve ser feita somente como tarefa explícita.

Foi decidido que:

> **AC-07 — SKU — está adiado.**

Não implementar automaticamente só porque o schema possui SKU.

---

# 36. AG-002 PRICE AGENT

Responsabilidade:

* coletar preços;
* normalizar preços;
* atualizar ofertas;
* criar histórico.

Não deve ser responsável por UI.

---

# 37. AG-003 MATCHING AGENT

Responsabilidade:

Determinar se uma oferta pertence ao mesmo produto.

Prioridade:

```text
EAN/GTIN
    ↓
SKU
    ↓
MPN
    ↓
Brand + Name + Size
    ↓
Semantic Match
```

Saída:

```json
{
  "product_id": "UUID",
  "offer_id": "UUID",
  "match_type": "ean",
  "confidence": 0.99,
  "verified": true
}
```

Semantic matching ainda é uma lacuna do projeto.

---

# 38. AG-004 DEAL AGENT

Responsabilidade:

* calcular Deal Score;
* classificação;
* preço médio;
* menor preço;
* preço atual;
* desconto.

Não colocar lógica de UI dentro deste agent.

---

# 39. AG-005 ALERT AGENT

Responsabilidade:

* buscar alertas ativos;
* comparar preço;
* disparar processamento;
* atualizar `last_triggered_at`.

---

# 40. AG-006 AFFILIATE AGENT

Responsabilidade:

* registrar contexto de affiliate;
* source;
* campaign;
* associação com offer.

## Importante

Não confundir:

```text
Affiliate Agent
```

com:

```text
Affiliate Redirect HTTP
```

São responsabilidades diferentes.

---

# 41. STORE CONNECTORS

O Worker possui conceito de connector.

Contrato:

```typescript
interface ScrapedOffer {
  price: number;
  originalPrice?: number;
  shippingPrice: number;
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
  title?: string;
  ean?: string;
  sku?: string;
  mpn?: string;
}

interface StoreConnector {
  readonly domain: string;
  scrapeOffer(url: string): Promise<ScrapedOffer | null>;
}
```

---

# 42. STORE REGISTRY

Arquivo:

```text
worker/src/stores/registry.ts
```

Responsabilidade:

Mapear domínio para connector.

Contrato conceitual:

```typescript
REGISTRY: ReadonlyMap<string, StoreConnector>
```

E:

```typescript
getConnector(domain): StoreConnector | null
```

---

# 43. BELEZA NA WEB CONNECTOR

O primeiro connector real implementado é:

```text
belezanaweb.com.br
```

O connector já foi validado com produtos reais.

## Estratégia

A página inicial respondeu:

```text
HTTP 200
```

Sem depender de execução de JavaScript para obter os dados testados.

Foi encontrado JSON-LD.

A página utiliza:

```text
ProductGroup
    ↓
hasVariant[]
```

O connector:

1. encontra o ProductGroup;
2. procura a variante correspondente à URL;
3. faz fallback para primeira variante com preço válido;
4. extrai preço;
5. normaliza availability;
6. extrai SKU quando disponível;
7. extrai EAN somente quando realmente existe;
8. mantém `shippingPrice = 0` quando não há informação de frete.

## Regra

Não inventar EAN.

Se não existir:

```text
ean = undefined
```

---

# 44. TESTE REAL DO CONNECTOR

Foram testados dois produtos reais.

Exemplo:

```text
Fame Rabanne
price = 482.31
availability = in_stock
SKU = 20050244
EAN = undefined
```

Outro:

```text
La Bomba CH
price = 962.01
availability = in_stock
SKU = 20081735
EAN = undefined
```

Smoke test:

```text
16/16 checks PASS
```

---

# 45. JOBS

## JOB-001 — Ingest Prices

Fluxo:

```text
Cron
 ↓
Worker
 ↓
Store Registry
 ↓
Connector
 ↓
ScrapedOffer
 ↓
Product Agent
 ↓
Matching Agent
 ↓
Offer
 ↓
Price History
```

Depois:

```text
JOB-003
 ↓
Deal Score
```

---

# 46. JOB-002 — Match Products

Responsabilidade:

* encontrar correspondência entre produto e oferta;
* executar matching;
* registrar `product_matches`.

---

# 47. JOB-003 — Calculate Deals

Responsabilidade:

* processar ofertas;
* calcular Deal Score;
* persistir `deal_scores`.

---

# 48. JOB-004 — Process Alerts

Responsabilidade:

* buscar alertas ativos;
* verificar preço;
* disparar alerta;
* atualizar estado.

---

# 49. E2E JÁ VALIDADO

O pipeline real já foi executado com sucesso.

Antes:

```text
price = 999.99 fictício
availability = unknown
price_history = 0
deal_scores = 0
```

Depois do JOB-001:

```text
price = 482.31
shipping = 0
availability = in_stock
last_checked_at = 2026-09-13T19:30:28Z
price_history = 1 row
```

Depois do JOB-003:

```text
offers_processed = 1
scores_created = 1
```

Deal:

```text
score = 55
classification = normal
current_price = 482.31
average_price = 482.31
```

## Observação

`normal` é esperado na primeira ingestão porque:

```text
average_price == current_price
```

Portanto não alterar a regra apenas para produzir uma classificação "melhor".

---

# 50. ESTADO ATUAL DO BACKEND

## Fundação

```text
PostgreSQL       ✅
PostgREST        ✅
Docker           ✅
RLS              ✅
```

## Backend Core

```text
Agents           ✅
Jobs             ✅
Store Registry   ✅
Connector        ✅
JOB-001 real     ✅
JOB-003          ✅
```

## Real Data Pipeline

```text
Primeiro dado real         ✅
Beleza na Web              ✅
Offer                      ✅
Price History              ✅
Deal Score                 ✅
```

## API Validation

```text
P0 — Catálogo       7/7 ✅
P1 — Views          3/3 ✅
```

---

# 51. P0 + P1 — RESULTADO OFICIAL

## P0 — 7/7

```text
TC-P0-01 categories              PASS
TC-P0-02 brands                  PASS
TC-P0-03 stores                  PASS
TC-P0-04 products                PASS
TC-P0-05 offers                  PASS
TC-P0-06 price_history           PASS
TC-P0-07 deal_scores             PASS
```

## P1 — 3/3

```text
TC-P1-01 best_product_offers     PASS
TC-P1-02 product_price_history   PASS
TC-P1-03 product_deal_summary    PASS
```

Total:

```text
10/10 PASS
```

---

# 52. P1 É O CONTRATO DA EXTENSION

A condição de liberação da Extension foi atingida:

```text
P1-01 PASS
P1-02 PASS
P1-03 PASS
```

Portanto o frontend pode consumir essas três views.

Antes disso, não deveria haver implementação significativa da Extension.

Agora essa restrição foi removida.

---

# 53. PRÓXIMO MILESTONE DO BACKEND

Ainda faltam validar:

```text
P2 — E2E
P3 — Escrita
SEC — RLS/JWT
```

Objetivo:

```text
P0 + P1
   ↓
P2
   ↓
P3
   ↓
SEC
   ↓
BACKEND V1 VALIDADO
```

---

# 54. P2 — E2E

Objetivo:

Validar fluxo completo usando dados reais.

Fluxo esperado:

```text
Product
 ↓
Offer
 ↓
Price History
 ↓
Deal Score
 ↓
Views
```

P2 pode ser executado sem JWT especial.

---

# 55. P3 — ESCRITA

Validar:

1. criação de alerta;
2. affiliate click;
3. rejeição de escrita sem autenticação.

Endpoints envolvidos:

```http
POST /alerts
POST /affiliate_clicks
```

---

# 56. SEC — RLS/JWT

Validar isolamento de usuários.

Cenário:

```text
User A
User B
```

Verificar que:

```text
User A ≠ User B
```

e dados privados não vazam entre usuários.

Também validar:

```text
JWT válido       → permitido
sem JWT          → rejeitado
```

---

# 57. JWT — REGRA DE SEGURANÇA

JWTs devem ser gerados localmente.

Não utilizar:

```text
jwt.io
```

para inserir o secret real.

Preferência:

Node.js +:

```text
crypto.createHmac
```

usando o:

```text
PGRST_JWT_SECRET
```

localmente.

O secret nunca deve ser commitado.

---

# 58. FRONTEND — NOVA GOVERNANÇA

O frontend não será desenvolvido no BOB.

Divisão:

```text
BOB
 ↓
Backend / arquitetura / regras
```

```text
Google Stitch
 ↓
Design / UX / estrutura visual
```

```text
Cursor
 ↓
Implementação / integração / evolução
```

## Regra

Stitch define:

* aparência;
* estrutura;
* experiência;
* estados visuais.

Cursor implementa.

Cursor não deve inventar novo produto.

---

# 59. CHROME EXTENSION

## Stack

```text
TypeScript
React
Tailwind CSS
Manifest V3
```

## Componentes

### Content Script

Responsável por:

* detectar URL;
* título;
* marca;
* preço;
* EAN;
* SKU;
* outros identificadores disponíveis.

### Background

Responsável por:

* API;
* autenticação;
* storage;
* eventos;
* abertura de links;
* notificações.

### Popup

Responsável por:

* UI principal;
* resultado;
* preço;
* Deal Score;
* ofertas;
* histórico;
* alerta.

---

# 60. UX PRINCIPAL

Fluxo:

```text
Página de produto
        ↓
Extension detecta
        ↓
Loading
        ↓
Produto identificado
        ↓
Busca ofertas
        ↓
Deal Score
        ↓
Resultado
```

Exemplo de UI:

```text
ELITE BOT

Encontramos esse produto

Preço atual
R$ 349

Melhor oferta
R$ 289

Economia
R$ 60

🟢 BOA OFERTA

Quer que eu avise quando ficar ainda mais barato?
```

---

# 61. ESTADOS DA EXTENSION

## Loading

```text
Analisando produto...
```

## Produto identificado

Mostrar:

* nome;
* marca;
* imagem;
* preço.

## Resultado

Mostrar:

* preço atual;
* melhor preço;
* economia;
* loja;
* Deal Score;
* classificação;
* link.

## Histórico

Mostrar evolução de preço.

## Alerta

Permitir:

```text
"Avise quando chegar a R$ X"
```

## Erros

A Extension deve tratar:

* produto não identificado;
* nenhuma oferta;
* loja não suportada;
* API indisponível;
* erro temporário;
* histórico insuficiente.

---

# 62. DESIGN SYSTEM

Direção visual:

```text
Dark mode
Cyan neon
Orange queimado
```

Cyan:

* ações;
* elementos interativos;
* destaque principal.

Orange:

* desconto;
* urgência;
* preço especial.

A interface deve parecer:

* masculina;
* premium;
* objetiva;
* moderna;
* rápida.

Evitar aparência de:

* marketplace genérico;
* dashboard corporativo;
* site de cupons barato.

---

# 63. WEBSITE

Stack planejada:

```text
Next.js
React
TypeScript
Tailwind
```

Responsabilidades:

* SEO;
* conteúdo;
* landing page;
* categorias;
* páginas de produtos;
* artigos;
* CTA para Extension.

Website é importante para aquisição, mas não bloqueia o core loop da Extension.

---

# 64. ANALYTICS V1

Eventos relevantes:

```text
extension_installed
product_detected
product_identified
offers_loaded
deal_viewed
affiliate_clicked
alert_created
alert_triggered
```

Métricas principais:

* instalações;
* produtos analisados;
* ofertas encontradas;
* affiliate clicks;
* conversão;
* receita por usuário;
* retenção;
* alertas criados;
* alertas disparados.

---

# 65. MÉTRICAS DE SUCESSO

## Métrica 1

Instalações e ativação.

## Métrica 2

Produtos analisados por usuário.

## Métrica 3

Affiliate clicks.

## Métrica 4

Conversão em compra.

## Métrica 5

Receita por usuário.

## Métrica 6

Retenção.

---

# 66. TRACEABILITY

Toda implementação deve ser rastreável:

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

# 67. FEATURES V1

## F-001 — Product Identification

Prioridade:

```text
P0
```

## F-002 — Price Comparison

Prioridade:

```text
P0
```

## F-003 — Deal Score

Prioridade:

```text
P0
```

## F-004 — Price History

Prioridade:

```text
P1
```

## F-005 — Price Alert

Prioridade:

```text
P1
```

## F-006 — Affiliate Tracking

Prioridade:

```text
P0
```

## F-007 — Website / SEO

Prioridade:

```text
P1
```

## F-008 — Login / User

Prioridade:

```text
P1
```

---

# 68. PRIORIDADE ATUAL

Após P0/P1:

```text
1. P2 E2E
2. P3 Writing
3. SEC RLS/JWT
4. Backend V1 validated
5. Frontend Specification
6. Google Stitch
7. Chrome Extension implementation
8. Affiliate redirect
9. Notifications
10. Website
```

---

# 69. GAPS CONHECIDOS

## Core

* semantic matching completo;
* mais Store Connectors;
* pipeline de múltiplas lojas;
* affiliate redirect real.

## Produto

* Chrome Extension;
* autenticação JWT real no cliente;
* notificações;
* alertas completos.

## Qualidade

* testes automatizados;
* testes E2E;
* observabilidade;
* logging;
* retry;
* tratamento robusto de falhas.

## Futuro

* mais lojas;
* mais categorias;
* SEO avançado;
* personalização;
* recomendações.

---

# 70. ACCEPTANCE CRITERIA — STORE CONNECTOR / PIPELINE

Critérios já definidos:

```text
AC-01 URL reconhecida pelo registry
AC-02 Connector obtém página
AC-03 Preço extraído
AC-04 Título extraído
AC-05 Disponibilidade normalizada
AC-06 EAN como identifier_type='ean'
AC-07 SKU como identifier_type='sku'
AC-08 Falha de scraping não derruba Worker
AC-09 JOB-001 atualiza offers
AC-10 JOB-001 cria price_history
AC-11 JOB-003 calcula deal_scores
AC-12 Nenhuma credencial exposta
```

## Estado

```text
AC-01     PASS
AC-02     PASS
AC-03     PASS
AC-04     PASS
AC-05     PASS
AC-06     depende de presença real do EAN
AC-07     ADIADO
AC-08     deve permanecer protegido
AC-09     PASS
AC-10     PASS
AC-11     PASS
AC-12     PASS
```

---

# 71. DECISÕES ARQUITETURAIS JÁ TOMADAS

## DECISÃO-01

Não utilizar Supabase.

## DECISÃO-02

Beleza na Web deve ser validada por HTML real antes de assumir estratégia de scraping.

Resultado:

```text
HTTP 200
JSON-LD presente
ProductGroup + hasVariant
```

## DECISÃO-03

Usar `fetch` nativo do Node em vez de adicionar `node-fetch`, quando compatível.

## DECISÃO-04

`ScrapedOffer` usa campos planos:

```typescript
ean?: string;
sku?: string;
mpn?: string;
```

## DECISÃO-05

Não confundir identificadores:

```text
EAN
GTIN
SKU
MPN
```

## DECISÃO-06

`availability` deve ser compatível com os valores aceitos pelo banco.

## DECISÃO-07

`price` e `shippingPrice` permanecem separados.

## DECISÃO-08

Affiliate Agent e Affiliate Redirect são responsabilidades diferentes.

## DECISÃO-09

AC-07 / SKU como fluxo de identificação foi adiado.

## DECISÃO-10

As views:

```text
best_product_offers
product_price_history
product_deal_summary
```

são o contrato inicial da Extension.

---

# 72. ESTRUTURA DE REPOSITÓRIO

Estrutura recomendada:

```text
elite-bot-backend/
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

A estrutura pode evoluir se o código atual já possuir organização diferente.

**Não reorganizar o projeto apenas por estética.**

---

# 73. POSTMAN

Collection:

```text
Elite Bot API

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
ean
```

---

# 74. POSTMAN — ESTADO

P0:

```text
7/7 PASS
```

P1:

```text
3/3 PASS
```

P2:

```text
pendente
```

P3:

```text
pendente
```

SEC:

```text
pendente
```

---

# 75. TESTES MÍNIMOS

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

# 76. GOVERNANÇA DE DESENVOLVIMENTO

## PO

Responsável por:

* produto;
* prioridade;
* escopo;
* decisões;
* release;
* conflitos.

## Architect

Responsável por:

* arquitetura;
* segurança;
* contratos;
* dependências;
* infraestrutura.

## Domain/Data

Responsável por:

* regras de negócio;
* modelos;
* scoring;
* matching;
* validações.

## Backend

Responsável por:

* PostgreSQL;
* SQL;
* migrations;
* PostgREST;
* views;
* RLS;
* Worker;
* jobs;
* connectors.

## Frontend

Responsável por:

* Extension;
* Website;
* UI;
* integração API;
* UX implementation.

## QA

Responsável por:

* testes;
* acceptance criteria;
* regressão;
* release validation.

---

# 77. COMO O CURSOR DEVE INTERPRETAR OS PAPÉIS

No Cursor não é necessário criar seis agentes independentes para cada responsabilidade.

O desenvolvedor pode assumir múltiplas responsabilidades.

Porém, a separação conceitual deve permanecer:

```text
Produto
≠
Arquitetura
≠
Domínio
≠
Implementação
≠
QA
```

---

# 78. REGRA PARA ALTERAÇÕES DE ARQUITETURA

Se uma tarefa parecer exigir:

* nova tecnologia;
* novo banco;
* novo serviço;
* mudança de API;
* mudança de schema;
* mudança de autenticação;
* mudança de arquitetura;

o Cursor deve primeiro informar:

```text
ARCHITECTURAL CHANGE DETECTED
```

E explicar:

1. problema;
2. solução atual;
3. limitação;
4. alternativa;
5. impacto;
6. recomendação.

Não alterar silenciosamente.

---

# 79. REGRA PARA NOVAS DEPENDÊNCIAS

Antes de adicionar pacote:

1. verificar se o Node já fornece a funcionalidade;
2. verificar dependências existentes;
3. avaliar necessidade;
4. evitar dependência adicional se a solução nativa for suficiente.

Exemplo:

Foi decidido utilizar `fetch` nativo do Node quando possível.

---

# 80. REGRA PARA NOVOS ENDPOINTS

Não criar endpoint apenas porque parece conveniente.

Primeiro verificar se:

* PostgREST já resolve;
* uma view resolve;
* um endpoint existente resolve;
* a operação pertence ao Worker.

Endpoints novos devem existir por necessidade de domínio.

---

# 81. REGRA PARA NOVAS TABELAS

Antes de criar tabela:

1. verificar se entidade já existe;
2. verificar se uma tabela existente pode representar a informação;
3. verificar se a informação pertence ao domínio;
4. avaliar impacto em RLS;
5. avaliar views;
6. avaliar API.

---

# 82. REGRA PARA FRONTEND

Frontend nunca deve duplicar lógica de negócio que pertence ao backend.

Exemplo:

Não recalcular no frontend:

```text
Deal Score
```

se o backend já fornece:

```text
score
classification
```

Frontend deve apresentar o contrato.

---

# 83. REGRA PARA ERROS

Falha em uma loja não deve derrubar todo o Worker.

Esperado:

```text
Store A → sucesso
Store B → erro
Store C → sucesso
```

Resultado:

```text
Store A processada
Store B registrada como falha
Store C processada
Worker continua
```

---

# 84. REGRA PARA SCRAPING

Scraper deve:

* ser isolado por loja;
* respeitar o connector;
* normalizar saída;
* não vazar credenciais;
* retornar `null` ou erro controlado;
* não quebrar o pipeline inteiro.

---

# 85. REGRA PARA DADOS

Não inventar:

* EAN;
* SKU;
* preço;
* disponibilidade;
* frete;
* produto;
* loja.

Se um dado não existe:

usar ausência apropriada.

Exemplo:

```text
ean = undefined
```

é melhor do que inventar um EAN.

---

# 86. REGRA PARA DEAL SCORE

O Deal Score atual é baseado em dados disponíveis.

Na primeira ingestão:

```text
current_price = average_price
```

Logo:

```text
score = 55
classification = normal
```

Isso é esperado.

Não "forçar" score alto por ser primeiro preço.

---

# 87. REGRA PARA MATCHING

Nunca considerar produtos diferentes como iguais somente porque:

* nome é parecido;
* marca é igual;
* categoria é igual.

Quando disponível, priorizar:

```text
EAN / GTIN
```

Depois:

```text
SKU
MPN
nome + marca + tamanho
semantic matching
```

---

# 88. REGRA PARA COMMITS

Preferir commits pequenos e coerentes.

Exemplos:

```text
feat: add product price endpoint
fix: normalize store availability
test: add alert RLS coverage
feat: add Chrome extension API client
```

Evitar:

```text
feat: implement entire product
```

misturando várias responsabilidades.

---

# 89. REGRA PARA OUTPUT DO CURSOR

Ao concluir uma tarefa, responder com:

```text
## Implemented

- ...

## Files changed

- ...

## Tests

- ...

## Result

PASS / FAIL

## Notes

- ...

## Risks / Pending

- ...
```

Se uma decisão arquitetural foi necessária:

```text
## Architectural Decision

Problem:
...

Decision:
...

Reason:
...

Impact:
...
```

---

# 90. PROTOCOLO DE EXECUÇÃO DE TAREFA

Para qualquer nova tarefa:

## Step 1 — Understand

Ler:

```text
PROJECT_CONTEXT.md
```

e os arquivos relevantes.

## Step 2 — Locate

Encontrar implementação existente.

## Step 3 — Validate

Confirmar:

* contrato;
* dependências;
* schema;
* regra de negócio.

## Step 4 — Implement

Fazer a menor mudança necessária.

## Step 5 — Test

Executar:

```text
typecheck
tests relevantes
smoke test
```

conforme aplicável.

## Step 6 — Report

Informar resultado.

---

# 91. O QUE NÃO FAZER NO CURSOR

Não:

* recriar banco;
* trocar PostgreSQL;
* adicionar Supabase;
* migrar para Firebase;
* criar microservices;
* introduzir Kubernetes;
* introduzir n8n;
* criar camada de IA sem requisito;
* reescrever o Worker inteiro;
* substituir PostgREST sem necessidade;
* criar nova API paralela;
* duplicar views;
* duplicar agents;
* duplicar jobs;
* alterar Deal Score sem decisão;
* inventar identificadores;
* alterar schema apenas para facilitar frontend;
* criar frontend antes de entender contrato;
* criar autenticação própria paralela ao sistema existente.

---

# 92. ESTADO DE TRANSIÇÃO BOB → CURSOR

O projeto está oficialmente migrando o desenvolvimento operacional para o Cursor porque o crédito disponível no BOB foi esgotado.

Isso não representa reset do projeto.

O estado anterior deve ser considerado válido.

O Cursor deve assumir o projeto a partir do estado atual.

---

# 93. PRIMEIRA TAREFA RECOMENDADA NO CURSOR

Antes de implementar novas features:

```text
AUDIT CURRENT STATE
```

O Cursor deve:

1. ler `PROJECT_CONTEXT.md`;
2. listar estrutura atual;
3. identificar package.json;
4. identificar Node version;
5. verificar migrations;
6. verificar PostgREST;
7. verificar Worker;
8. verificar connectors;
9. verificar agents;
10. verificar jobs;
11. verificar views;
12. verificar RLS;
13. verificar testes;
14. verificar Postman;
15. identificar diferenças entre este documento e o código real.

Não fazer grandes alterações nessa etapa.

---

# 94. SAÍDA ESPERADA DO AUDIT

```text
## Project Audit

### Architecture
PASS / GAP

### Database
PASS / GAP

### PostgREST
PASS / GAP

### Worker
PASS / GAP

### Store Connectors
PASS / GAP

### Agents
PASS / GAP

### Jobs
PASS / GAP

### RLS
PASS / GAP

### Tests
PASS / GAP

### Postman
PASS / GAP

### Frontend
PASS / GAP

### Context inconsistencies
- ...

### Recommended next task
- ...
```

---

# 95. PRÓXIMA TAREFA APÓS AUDIT

Se o audit confirmar que o estado descrito aqui corresponde ao código:

```text
P2 — E2E Validation
```

Depois:

```text
P3 — Write Validation
```

Depois:

```text
SEC — RLS/JWT
```

Depois:

```text
BACKEND V1 COMPLETE
```

---

# 96. ROADMAP

## Fase atual

```text
Backend Foundation
        ✅
```

## Fase seguinte

```text
Backend Validation
        ↓
P2
        ↓
P3
        ↓
SEC
```

## Depois

```text
Frontend Specification
        ↓
Google Stitch
```

## Depois

```text
Chrome Extension
        ↓
Cursor
```

## Depois

```text
Affiliate Redirect
        ↓
Notifications
        ↓
Website
```

---

# 97. ROADMAP DE PRODUTO COMPLETO

```text
Foundation
    ↓
Real Store Connector
    ↓
Real Data Pipeline
    ↓
Deal Pipeline E2E
    ↓
Semantic Matching
    ↓
Backend Tests
    ↓
Chrome Extension
    ↓
JWT/Auth
    ↓
Affiliate Redirect
    ↓
Notifications
    ↓
Website
    ↓
SEO
    ↓
More Stores
    ↓
More Categories
```

---

# 98. CRITÉRIO DE SUCESSO DA V1

A V1 deve conseguir executar:

```text
Usuário abre página de produto
        ↓
Extension detecta
        ↓
Backend identifica
        ↓
Backend encontra ofertas
        ↓
Melhor preço aparece
        ↓
Deal Score aparece
        ↓
Usuário entende se vale comprar
        ↓
Usuário clica
        ↓
Affiliate click é registrado
```

E:

```text
Usuário define preço-alvo
        ↓
Worker monitora
        ↓
Preço atinge target
        ↓
Notificação/alerta
```

---

# 99. CRITÉRIO DE PIVOT

Se houver:

```text
uso alto
+
baixa conversão
```

investigar:

* oferta;
* confiança;
* UX;
* affiliate;
* Deal Score.

Se houver:

```text
instalação baixa
```

investigar:

* aquisição;
* posicionamento;
* landing page;
* conteúdo;
* CTA.

Se houver:

```text
instalação alta
+
uso baixo
```

investigar:

* detecção;
* UX;
* cobertura de lojas;
* valor percebido.

---

# 100. PRINCÍPIO FINAL

O Elite Bot não precisa ser uma plataforma gigantesca para provar valor.

O objetivo inicial é provar:

> **O usuário encontra um produto, o Elite Bot encontra uma oferta melhor, explica se o preço é bom e ajuda o usuário a comprar melhor.**

Tudo que não contribui para provar esse loop deve ser tratado como secundário.

---

# 101. RESUMO EXECUTIVO PARA O CURSOR

```text
PRODUTO
Elite Bot / Guia do Homem Barato

OBJETIVO
Comparar preços de produtos de estilo/grooming e informar se a oferta é boa.

USUÁRIO
Homem interessado em estilo, grooming, perfumes, skincare e moda.

MONETIZAÇÃO
Afiliados.

BACKEND
PostgreSQL + PostgREST + Node.js/TypeScript Worker + Cron.

FRONTEND
Chrome Extension + Website.

DESIGN
Google Stitch.

IMPLEMENTAÇÃO FRONTEND
Cursor.

SUPABASE
NÃO UTILIZAR.

ESTADO
Backend foundation implementado.

DADO REAL
Beleza na Web funcionando.

P0
7/7 PASS.

P1
3/3 PASS.

PRÓXIMO
P2 → P3 → SEC.

CONTRATO EXTENSION
best_product_offers
product_price_history
product_deal_summary

PRINCIPAL REGRA
Não reinventar o que já existe.

PRINCIPAL OBJETIVO
Provar o core loop de produto.

PRINCIPAL RESTRIÇÃO
Não alterar arquitetura ou regras de negócio silenciosamente.
```

---

# 102. INSTRUÇÃO FINAL PARA O CURSOR

Ao receber qualquer tarefa deste projeto:

> **Primeiro entenda o sistema existente. Depois implemente somente o necessário.**

Se a tarefa estiver claramente coberta por este contexto:

```text
IMPLEMENT
```

Se houver conflito:

```text
REPORT CONFLICT
```

Se houver mudança arquitetural:

```text
PROPOSE DECISION
```

Se houver risco de segurança:

```text
STOP AND REPORT
```

Se o código já possuir a solução:

```text
REUSE EXISTING IMPLEMENTATION
```

O Cursor deve tratar este documento como **contexto de projeto**, não como autorização para modificar tudo que está descrito.

A fonte de verdade para implementação é:

```text
PROJECT_CONTEXT.md
        +
código existente
        +
database/schema
        +
business rules
        +
testes
```

Em caso de inconsistência entre este documento e o código, **não corrigir silenciosamente**.

Reportar a inconsistência e propor a decisão antes de uma alteração estrutural.

---

# FIM DO PROJECT_CONTEXT.md
