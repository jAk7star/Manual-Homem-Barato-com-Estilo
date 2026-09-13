# Elite Bot — API Specification

**Versão:** 0.1
**Status:** Draft / MVP
**Projeto:** Elite Bot / Guia do Homem Barato
**Motor:** PostgREST — expõe tabelas e views PostgreSQL diretamente como REST
**Depende de:** Elite-Bot-Backend-Specification.md, 001_initial_schema.sql

---

# 1. Visão geral

A API do Elite Bot é servida pelo **PostgREST**, que gera automaticamente endpoints REST a partir das tabelas e views do PostgreSQL.

```text
Chrome Extension / Website
         ↓
    PostgREST
         ↓
    PostgreSQL
```

Todo acesso à API requer autenticação via JWT, exceto os endpoints públicos de leitura de catálogo.

---

# 2. Base URL

| Ambiente | URL |
|---|---|
| Desenvolvimento | `http://localhost:3000` |
| Produção | `https://api.elitebot.com` |

---

# 3. Autenticação

```http
Authorization: Bearer <jwt_token>
```

Todos os endpoints privados exigem JWT válido no header `Authorization`.

Os endpoints públicos de leitura (catálogo, produtos, ofertas) **não** exigem autenticação.

---

# 4. Convenções do PostgREST

## Filtros

```text
?coluna=eq.{valor}         igual a
?coluna=neq.{valor}        diferente de
?coluna=gt.{valor}         maior que
?coluna=gte.{valor}        maior ou igual
?coluna=lt.{valor}         menor que
?coluna=lte.{valor}        menor ou igual
?coluna=is.true            booleano verdadeiro
?coluna=is.false           booleano falso
?coluna=is.null            nulo
?coluna=in.({a},{b})       em lista
?coluna=ilike.*{termo}*    like case-insensitive
```

## Ordenação

```text
?order=coluna.asc
?order=coluna.desc
```

## Paginação

```text
?limit=20&offset=0
```

## Seleção de colunas

```text
?select=id,name,slug
```

## Headers de resposta

```text
Content-Type: application/json
Content-Range: 0-9/100      ← total de registros
```

---

# 5. Códigos de resposta

| Código | Significado |
|---|---|
| `200 OK` | Leitura bem-sucedida |
| `201 Created` | Recurso criado |
| `204 No Content` | Atualização sem retorno |
| `400 Bad Request` | Parâmetro inválido |
| `401 Unauthorized` | JWT ausente ou inválido |
| `403 Forbidden` | Permissão insuficiente |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Violação de constraint único |
| `500 Internal Server Error` | Erro interno |

---

# 6. Endpoints — Catálogo público

## 6.1 Categories

### Listar todas as categorias

```http
GET /categories
```

**Resposta 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Perfumes",
    "slug": "perfumes",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Buscar categoria por ID

```http
GET /categories?id=eq.{uuid}
```

---

### Buscar categoria por slug

```http
GET /categories?slug=eq.{slug}
```

---

## 6.2 Brands

### Listar todas as marcas

```http
GET /brands
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Dior",
    "slug": "dior",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Buscar marca por ID

```http
GET /brands?id=eq.{uuid}
```

---

### Buscar marca por slug

```http
GET /brands?slug=eq.{slug}
```

---

### Criar marca *(Worker only)*

```http
POST /brands
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "name": "Dior",
  "slug": "dior"
}
```

**Resposta 201:** corpo vazio com header `Location: /brands?id=eq.{uuid}`

---

### Atualizar marca *(Worker only)*

```http
PATCH /brands?id=eq.{uuid}
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "name": "Christian Dior"
}
```

**Resposta 204**

---

## 6.3 Products

### Listar produtos

```http
GET /products
GET /products?order=name.asc
GET /products?category_id=eq.{uuid}
GET /products?brand_id=eq.{uuid}
GET /products?select=id,name,slug,brand_id,image_url
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "category_id": "uuid",
    "brand_id": "uuid",
    "name": "Dior Sauvage Eau de Toilette 100ml",
    "slug": "dior-sauvage-eau-de-toilette-100ml",
    "description": "...",
    "product_type": "eau-de-toilette",
    "gender": "male",
    "size_value": 100.000,
    "size_unit": "ml",
    "image_url": "https://cdn.elitebot.com/products/dior-sauvage.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Buscar produto por ID

```http
GET /products?id=eq.{uuid}
```

---

### Buscar produto por slug

```http
GET /products?slug=eq.{slug}
```

---

### Criar produto *(Worker only)*

```http
POST /products
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "category_id": "uuid",
  "brand_id": "uuid",
  "name": "Dior Sauvage Eau de Toilette 100ml",
  "slug": "dior-sauvage-eau-de-toilette-100ml",
  "product_type": "eau-de-toilette",
  "gender": "male",
  "size_value": 100,
  "size_unit": "ml"
}
```

**Resposta 201**

---

### Atualizar produto *(Worker only)*

```http
PATCH /products?id=eq.{uuid}
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "image_url": "https://cdn.elitebot.com/products/dior-sauvage.jpg"
}
```

**Resposta 204**

---

## 6.4 Product Identifiers

### Listar identificadores de um produto

```http
GET /product_identifiers?product_id=eq.{uuid}
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "identifier_type": "ean",
    "identifier_value": "3348901250146",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Buscar produto por EAN/GTIN/SKU

```http
GET /product_identifiers?identifier_value=eq.{value}
GET /product_identifiers?identifier_type=eq.ean&identifier_value=eq.{ean}
```

---

### Criar identificador *(Worker only)*

```http
POST /product_identifiers
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "product_id": "uuid",
  "identifier_type": "ean",
  "identifier_value": "3348901250146"
}
```

**Resposta 201**

---

## 6.5 Stores

### Listar lojas ativas

```http
GET /stores?is_active=is.true
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Sephora",
    "slug": "sephora",
    "domain": "sephora.com.br",
    "logo_url": "https://cdn.elitebot.com/stores/sephora.png",
    "affiliate_network": "lomadee",
    "affiliate_base_url": "https://redir.lomadee.com/...",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Criar loja *(Worker only)*

```http
POST /stores
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "name": "Sephora",
  "slug": "sephora",
  "domain": "sephora.com.br",
  "affiliate_network": "lomadee",
  "affiliate_base_url": "https://redir.lomadee.com/..."
}
```

**Resposta 201**

---

---

# 7. Endpoints — Ofertas

## 7.1 Offers

### Listar ofertas ativas de um produto

```http
GET /offers?product_id=eq.{uuid}&is_active=is.true&order=price.asc
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "store_id": "uuid",
    "external_product_id": "SKU-123",
    "product_url": "https://sephora.com.br/produto",
    "affiliate_url": "https://redir.lomadee.com/...",
    "title": "Dior Sauvage EDT 100ml",
    "price": 379.90,
    "original_price": 449.90,
    "currency": "BRL",
    "availability": "in_stock",
    "seller_name": null,
    "shipping_price": 0.00,
    "last_checked_at": "2024-01-15T10:00:00Z",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### Criar oferta *(Worker only)*

```http
POST /offers
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "product_id": "uuid",
  "store_id": "uuid",
  "product_url": "https://sephora.com.br/produto",
  "price": 379.90,
  "currency": "BRL",
  "availability": "in_stock",
  "shipping_price": 0
}
```

**Resposta 201**

---

### Atualizar oferta *(Worker only)*

```http
PATCH /offers?id=eq.{uuid}
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "price": 369.90,
  "availability": "in_stock",
  "last_checked_at": "2024-01-16T10:00:00Z"
}
```

**Resposta 204**

---

## 7.2 Price History

### Histórico de preços de uma oferta

```http
GET /price_history?offer_id=eq.{uuid}&order=captured_at.desc&limit=90
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "offer_id": "uuid",
    "price": 379.90,
    "original_price": 449.90,
    "shipping_price": 0.00,
    "captured_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### Registrar preço *(Worker only)*

```http
POST /price_history
Content-Type: application/json
Authorization: Bearer <worker_jwt>

{
  "offer_id": "uuid",
  "price": 379.90,
  "original_price": 449.90,
  "shipping_price": 0
}
```

**Resposta 201**

---

---

# 8. Endpoints — Views

## 8.1 Best Product Offers

Retorna as melhores ofertas ativas de um produto com score de deal mais recente.

```http
GET /best_product_offers?product_id=eq.{uuid}&order=total_price.asc
```

**Resposta 200:**
```json
[
  {
    "product_id": "uuid",
    "offer_id": "uuid",
    "store_id": "uuid",
    "store_name": "Sephora",
    "store_domain": "sephora.com.br",
    "price": 379.90,
    "shipping_price": 0.00,
    "total_price": 379.90,
    "currency": "BRL",
    "availability": "in_stock",
    "product_url": "https://sephora.com.br/produto",
    "affiliate_url": "https://redir.lomadee.com/...",
    "score": 92.00,
    "classification": "excellent",
    "last_checked_at": "2024-01-15T10:00:00Z"
  }
]
```

---

## 8.2 Product Price History

Retorna o histórico de preços de um produto consolidado por loja.

```http
GET /product_price_history?product_id=eq.{uuid}&order=captured_at.desc&limit=90
```

**Resposta 200:**
```json
[
  {
    "product_id": "uuid",
    "product_name": "Dior Sauvage EDT 100ml",
    "offer_id": "uuid",
    "store_id": "uuid",
    "store_name": "Sephora",
    "price": 379.90,
    "original_price": 449.90,
    "shipping_price": 0.00,
    "total_price": 379.90,
    "captured_at": "2024-01-15T10:00:00Z"
  }
]
```

---

## 8.3 Product Deal Summary

Retorna o resumo de deal de um produto: melhor preço atual, média histórica, menor preço já visto e score.

```http
GET /product_deal_summary?product_id=eq.{uuid}
```

**Resposta 200:**
```json
[
  {
    "product_id": "uuid",
    "current_best_price": 379.90,
    "average_price": 420.00,
    "lowest_price": 359.90,
    "score": 92.00,
    "classification": "excellent"
  }
]
```

---

---

# 9. Endpoints — Usuário autenticado

## 9.1 Alerts

### Listar alertas do usuário

```http
GET /alerts?user_id=eq.{user_id}&is_active=is.true
Authorization: Bearer <jwt>
```

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid",
    "target_price": 350.00,
    "currency": "BRL",
    "is_active": true,
    "last_triggered_at": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Criar alerta

```http
POST /alerts
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "product_id": "uuid",
  "target_price": 350.00,
  "currency": "BRL"
}
```

**Resposta 201**

---

### Desativar alerta

```http
PATCH /alerts?id=eq.{uuid}
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "is_active": false
}
```

**Resposta 204**

---

## 9.2 Affiliate Clicks

### Registrar clique de afiliado

```http
POST /affiliate_clicks
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "offer_id": "uuid",
  "source": "extension",
  "campaign": null
}
```

**Campos `source` aceitos:** `extension`, `website`

**Resposta 201**

---

---

# 10. Controle de acesso por endpoint

| Endpoint | Método | Acesso |
|---|---|---|
| `/categories` | GET | Público |
| `/brands` | GET | Público |
| `/brands` | POST, PATCH | Worker |
| `/products` | GET | Público |
| `/products` | POST, PATCH | Worker |
| `/product_identifiers` | GET | Público |
| `/product_identifiers` | POST | Worker |
| `/stores` | GET | Público |
| `/stores` | POST, PATCH | Worker |
| `/offers` | GET | Público |
| `/offers` | POST, PATCH | Worker |
| `/price_history` | GET | Público |
| `/price_history` | POST | Worker |
| `/best_product_offers` | GET | Público |
| `/product_price_history` | GET | Público |
| `/product_deal_summary` | GET | Público |
| `/alerts` | GET, POST, PATCH | Usuário autenticado |
| `/affiliate_clicks` | POST | Usuário autenticado |
| `/affiliate_clicks` | GET | Worker |

---

# 11. Payload de identificação de produto

A Extension envia dados extraídos da página para o Worker identificar o produto.

> **Nota:** Esta chamada é feita pelo Worker, não diretamente pela Extension. A Extension envia os dados ao Background, que chama a API para buscar o produto já identificado.

```http
POST /rpc/identify_product
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "title": "Dior Sauvage Eau de Toilette 100ml",
  "brand": "Dior",
  "price": 449.90,
  "ean": "3348901250146",
  "url": "https://sephora.com.br/produto"
}
```

**Resposta 200:**
```json
{
  "product_id": "uuid",
  "confidence": 0.98,
  "match_type": "ean"
}
```

**Resposta 404 — produto não identificado:**
```json
{
  "code": "PRODUCT_NOT_FOUND",
  "message": "Product could not be identified from the provided data."
}
```

---

# 12. Contrato de resposta principal (Extension)

Resposta consolidada que a Extension consome para exibir o Popup:

```json
{
  "product": {
    "id": "uuid",
    "name": "Dior Sauvage EDT 100ml",
    "brand": "Dior",
    "image_url": "https://cdn.elitebot.com/products/dior-sauvage.jpg"
  },
  "deal": {
    "score": 92,
    "classification": "excellent",
    "current_best_price": 379.90,
    "average_price": 420.00,
    "lowest_price": 359.90,
    "saving": 70.00
  },
  "offers": [
    {
      "offer_id": "uuid",
      "store_name": "Sephora",
      "price": 379.90,
      "shipping_price": 0.00,
      "total_price": 379.90,
      "currency": "BRL",
      "affiliate_url": "https://redir.lomadee.com/..."
    },
    {
      "offer_id": "uuid",
      "store_name": "Beleza na Web",
      "price": 389.90,
      "shipping_price": 0.00,
      "total_price": 389.90,
      "currency": "BRL",
      "affiliate_url": "https://redir.lomadee.com/..."
    }
  ]
}
```

Este contrato é montado pela Extension combinando as respostas de:
1. `GET /product_deal_summary?product_id=eq.{uuid}`
2. `GET /best_product_offers?product_id=eq.{uuid}&order=total_price.asc`

---

# 13. Erros padrão PostgREST

```json
{
  "code": "22P02",
  "details": null,
  "hint": null,
  "message": "invalid input syntax for type uuid: \"not-a-uuid\""
}
```

```json
{
  "code": "PGRST116",
  "details": "Results contain 0 rows",
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

---

# 14. Traceability

| Endpoint | Origem |
|---|---|
| `/categories`, `/brands`, `/products` | Backend Spec §12 — Catálogo |
| `/offers`, `/price_history` | Backend Spec §12 — Ofertas |
| `/best_product_offers` | Backend Spec §17 — Views públicas |
| `/product_price_history` | Backend Spec §17 — Views públicas |
| `/product_deal_summary` | Backend Spec §17 — Views públicas |
| `/alerts` | Backend Spec §12 — Alertas |
| `/affiliate_clicks` | Backend Spec §12 — Affiliate |
| Contrato de resposta principal | Spec Fundamental §23 |
| Controle de acesso | Backend Spec §16 |
