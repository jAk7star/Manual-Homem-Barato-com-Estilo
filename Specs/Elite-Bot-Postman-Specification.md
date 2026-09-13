# Elite Bot — Postman Specification

**Versão:** 0.1
**Status:** Draft / MVP
**Projeto:** Elite Bot / Guia do Homem Barato
**Depende de:** Elite-Bot-API-Specification.md, Elite-Bot-Backend-Specification.md

---

# 1. Visão geral

O Postman é a ferramenta oficial de validação da API do Elite Bot.

A collection cobre todos os endpoints da API, segue a ordem de dependência entre recursos e inclui testes automatizados em cada requisição.

```text
PostgreSQL → PostgREST → Postman → Worker → Extension
```

---

# 2. Arquivos

```text
postman/
├── Elite-Bot.postman_collection.json
└── Elite-Bot.postman_environment.json
```

---

# 3. Environments

## 3.1 Local

```json
{
  "name": "Elite Bot — Local",
  "values": [
    { "key": "base_url",      "value": "http://localhost:3000" },
    { "key": "worker_jwt",    "value": "<jwt do Worker>" },
    { "key": "user_jwt",      "value": "<jwt de usuário de teste>" },
    { "key": "category_id",   "value": "" },
    { "key": "brand_id",      "value": "" },
    { "key": "product_id",    "value": "" },
    { "key": "identifier_id", "value": "" },
    { "key": "store_id",      "value": "" },
    { "key": "offer_id",      "value": "" },
    { "key": "alert_id",      "value": "" },
    { "key": "click_id",      "value": "" }
  ]
}
```

## 3.2 Produção

Mesmo arquivo. Alterar apenas `base_url` para `https://api.elitebot.com`.

A collection permanece idêntica entre ambientes.

---

# 4. Estrutura da Collection

```text
Elite Bot API
│
├── 00 Health
│   └── GET Health check
│
├── 01 Categories
│   ├── GET List categories
│   ├── GET Category by ID
│   └── GET Category by slug
│
├── 02 Brands
│   ├── GET List brands
│   ├── GET Brand by ID
│   ├── POST Create brand
│   └── PATCH Update brand
│
├── 03 Products
│   ├── GET List products
│   ├── GET Product by ID
│   ├── GET Product by slug
│   ├── GET Products by category
│   ├── GET Products by brand
│   ├── POST Create product
│   └── PATCH Update product
│
├── 04 Product Identifiers
│   ├── GET Identifiers by product
│   ├── GET Product by EAN
│   └── POST Create identifier
│
├── 05 Stores
│   ├── GET List active stores
│   ├── GET Store by ID
│   ├── POST Create store
│   └── PATCH Update store
│
├── 06 Offers
│   ├── GET Offers by product (active, sorted by price)
│   ├── GET Offer by ID
│   ├── POST Create offer
│   └── PATCH Update offer price
│
├── 07 Price History
│   ├── GET Price history by offer
│   └── POST Record price
│
├── 08 Product Matches
│   ├── GET Matches by product
│   └── GET Matches by offer
│
├── 09 Deal Scores
│   ├── GET Deal scores by offer
│   └── GET Latest deal score by offer
│
├── 10 Best Offers
│   └── GET Best offers by product
│
├── 11 Deal Summary
│   └── GET Deal summary by product
│
├── 12 Price History (view)
│   └── GET Product price history
│
├── 13 Alerts
│   ├── GET List user alerts
│   ├── POST Create alert
│   └── PATCH Deactivate alert
│
└── 14 Affiliate
    ├── POST Register affiliate click
    └── GET List affiliate clicks (Worker)
```

---

# 5. Requisições detalhadas

## 00 Health

### GET Health check

```text
Method: GET
URL:    {{base_url}}/
```

**Test:**
```javascript
pm.test("API is up", function () {
    pm.response.to.have.status(200);
});
```

---

## 01 Categories

### GET List categories

```text
Method: GET
URL:    {{base_url}}/categories
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Returns array", function () {
    const body = pm.response.json();
    pm.expect(body).to.be.an("array");
});

pm.test("Contains seed categories", function () {
    const body = pm.response.json();
    const slugs = body.map(c => c.slug);
    pm.expect(slugs).to.include("perfumes");
    pm.expect(slugs).to.include("skincare");
    pm.expect(slugs).to.include("roupas");
});

// Salva o primeiro ID para uso nas próximas requisições
if (pm.response.json().length > 0) {
    pm.environment.set("category_id", pm.response.json()[0].id);
}
```

---

### GET Category by ID

```text
Method: GET
URL:    {{base_url}}/categories?id=eq.{{category_id}}
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Returns one category", function () {
    const body = pm.response.json();
    pm.expect(body).to.be.an("array").with.lengthOf(1);
    pm.expect(body[0].id).to.equal(pm.environment.get("category_id"));
});
```

---

## 02 Brands

### POST Create brand

```text
Method:  POST
URL:     {{base_url}}/brands
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "name": "Dior",
  "slug": "dior"
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Brand has id", function () {
    const body = pm.response.json();
    pm.expect(body).to.be.an("array").with.lengthOf(1);
    pm.expect(body[0].id).to.be.a("string");
    pm.environment.set("brand_id", body[0].id);
});
```

---

### GET List brands

```text
Method: GET
URL:    {{base_url}}/brands
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Contains created brand", function () {
    const body = pm.response.json();
    const brand = body.find(b => b.id === pm.environment.get("brand_id"));
    pm.expect(brand).to.not.be.undefined;
    pm.expect(brand.slug).to.equal("dior");
});
```

---

### PATCH Update brand

```text
Method:  PATCH
URL:     {{base_url}}/brands?id=eq.{{brand_id}}
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
Body:
{
  "name": "Christian Dior"
}
```

**Test:**
```javascript
pm.test("Status 204", function () {
    pm.response.to.have.status(204);
});
```

---

## 03 Products

### POST Create product

```text
Method:  POST
URL:     {{base_url}}/products
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "category_id": "{{category_id}}",
  "brand_id": "{{brand_id}}",
  "name": "Dior Sauvage Eau de Toilette 100ml",
  "slug": "dior-sauvage-eau-de-toilette-100ml",
  "product_type": "eau-de-toilette",
  "gender": "male",
  "size_value": 100,
  "size_unit": "ml"
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Product has id and slug", function () {
    const body = pm.response.json();
    pm.expect(body[0].id).to.be.a("string");
    pm.expect(body[0].slug).to.equal("dior-sauvage-eau-de-toilette-100ml");
    pm.environment.set("product_id", body[0].id);
});
```

---

### GET Product by ID

```text
Method: GET
URL:    {{base_url}}/products?id=eq.{{product_id}}
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Correct product returned", function () {
    const body = pm.response.json();
    pm.expect(body[0].id).to.equal(pm.environment.get("product_id"));
    pm.expect(body[0].gender).to.equal("male");
    pm.expect(body[0].size_value).to.equal("100.000");
});
```

---

## 04 Product Identifiers

### POST Create identifier

```text
Method:  POST
URL:     {{base_url}}/product_identifiers
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "product_id": "{{product_id}}",
  "identifier_type": "ean",
  "identifier_value": "3348901250146"
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Identifier created", function () {
    const body = pm.response.json();
    pm.expect(body[0].identifier_value).to.equal("3348901250146");
    pm.environment.set("identifier_id", body[0].id);
});
```

---

### GET Product by EAN

```text
Method: GET
URL:    {{base_url}}/product_identifiers?identifier_type=eq.ean&identifier_value=eq.3348901250146
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Returns matching product", function () {
    const body = pm.response.json();
    pm.expect(body[0].product_id).to.equal(pm.environment.get("product_id"));
});
```

---

## 05 Stores

### POST Create store

```text
Method:  POST
URL:     {{base_url}}/stores
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "name": "Sephora",
  "slug": "sephora",
  "domain": "sephora.com.br",
  "affiliate_network": "lomadee",
  "affiliate_base_url": "https://redir.lomadee.com/v2/deeplink?id=1&url="
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Store is active by default", function () {
    const body = pm.response.json();
    pm.expect(body[0].is_active).to.be.true;
    pm.environment.set("store_id", body[0].id);
});
```

---

## 06 Offers

### POST Create offer

```text
Method:  POST
URL:     {{base_url}}/offers
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "product_id": "{{product_id}}",
  "store_id": "{{store_id}}",
  "product_url": "https://sephora.com.br/dior-sauvage-edt-100ml",
  "affiliate_url": "https://redir.lomadee.com/v2/deeplink?id=1&url=https://sephora.com.br/dior-sauvage-edt-100ml",
  "price": 379.90,
  "original_price": 449.90,
  "currency": "BRL",
  "availability": "in_stock",
  "shipping_price": 0
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Offer is active by default", function () {
    const body = pm.response.json();
    pm.expect(body[0].is_active).to.be.true;
    pm.expect(parseFloat(body[0].price)).to.equal(379.90);
    pm.environment.set("offer_id", body[0].id);
});
```

---

### GET Offers by product (active, sorted by price)

```text
Method: GET
URL:    {{base_url}}/offers?product_id=eq.{{product_id}}&is_active=is.true&order=price.asc
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Contains created offer", function () {
    const body = pm.response.json();
    const offer = body.find(o => o.id === pm.environment.get("offer_id"));
    pm.expect(offer).to.not.be.undefined;
});
```

---

## 07 Price History

### POST Record price

```text
Method:  POST
URL:     {{base_url}}/price_history
Headers: Authorization: Bearer {{worker_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "offer_id": "{{offer_id}}",
  "price": 379.90,
  "original_price": 449.90,
  "shipping_price": 0
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Price recorded", function () {
    const body = pm.response.json();
    pm.expect(parseFloat(body[0].price)).to.equal(379.90);
});
```

---

### GET Price history by offer

```text
Method: GET
URL:    {{base_url}}/price_history?offer_id=eq.{{offer_id}}&order=captured_at.desc
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has at least one record", function () {
    const body = pm.response.json();
    pm.expect(body.length).to.be.at.least(1);
});
```

---

## 10 Best Offers

### GET Best offers by product

```text
Method: GET
URL:    {{base_url}}/best_product_offers?product_id=eq.{{product_id}}&order=total_price.asc
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has required fields", function () {
    const body = pm.response.json();
    pm.expect(body.length).to.be.at.least(1);
    const offer = body[0];
    pm.expect(offer).to.have.property("offer_id");
    pm.expect(offer).to.have.property("store_name");
    pm.expect(offer).to.have.property("total_price");
    pm.expect(offer).to.have.property("affiliate_url");
});
```

---

## 11 Deal Summary

### GET Deal summary by product

```text
Method: GET
URL:    {{base_url}}/product_deal_summary?product_id=eq.{{product_id}}
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Summary has required fields", function () {
    const body = pm.response.json();
    pm.expect(body.length).to.be.at.least(1);
    const summary = body[0];
    pm.expect(summary).to.have.property("current_best_price");
    pm.expect(summary).to.have.property("average_price");
    pm.expect(summary).to.have.property("lowest_price");
});
```

---

## 12 Price History (view)

### GET Product price history

```text
Method: GET
URL:    {{base_url}}/product_price_history?product_id=eq.{{product_id}}&order=captured_at.desc&limit=90
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has product name and store name", function () {
    const body = pm.response.json();
    pm.expect(body[0]).to.have.property("product_name");
    pm.expect(body[0]).to.have.property("store_name");
    pm.expect(body[0]).to.have.property("total_price");
});
```

---

## 13 Alerts

### POST Create alert

```text
Method:  POST
URL:     {{base_url}}/alerts
Headers: Authorization: Bearer {{user_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "product_id": "{{product_id}}",
  "target_price": 350.00,
  "currency": "BRL"
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Alert is active by default", function () {
    const body = pm.response.json();
    pm.expect(body[0].is_active).to.be.true;
    pm.expect(parseFloat(body[0].target_price)).to.equal(350.00);
    pm.environment.set("alert_id", body[0].id);
});
```

---

### GET List user alerts

```text
Method: GET
URL:    {{base_url}}/alerts?is_active=is.true
Headers: Authorization: Bearer {{user_jwt}}
```

**Test:**
```javascript
pm.test("Status 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Contains created alert", function () {
    const body = pm.response.json();
    const alert = body.find(a => a.id === pm.environment.get("alert_id"));
    pm.expect(alert).to.not.be.undefined;
});
```

---

### PATCH Deactivate alert

```text
Method:  PATCH
URL:     {{base_url}}/alerts?id=eq.{{alert_id}}
Headers: Authorization: Bearer {{user_jwt}}
         Content-Type: application/json
Body:
{
  "is_active": false
}
```

**Test:**
```javascript
pm.test("Status 204", function () {
    pm.response.to.have.status(204);
});
```

---

## 14 Affiliate

### POST Register affiliate click

```text
Method:  POST
URL:     {{base_url}}/affiliate_clicks
Headers: Authorization: Bearer {{user_jwt}}
         Content-Type: application/json
         Prefer: return=representation
Body:
{
  "offer_id": "{{offer_id}}",
  "source": "extension",
  "campaign": null
}
```

**Test:**
```javascript
pm.test("Status 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Click recorded with correct source", function () {
    const body = pm.response.json();
    pm.expect(body[0].source).to.equal("extension");
    pm.environment.set("click_id", body[0].id);
});
```

---

# 6. Testes mínimos (T-001 a T-012)

| ID | Teste | Requisição |
|---|---|---|
| T-001 | Database connection | `GET /` → 200 |
| T-002 | Categories GET | `GET /categories` → array com seed |
| T-003 | Product creation | `POST /products` → 201 com ID |
| T-004 | Product GET | `GET /products?id=eq.{id}` → produto correto |
| T-005 | Store creation | `POST /stores` → 201, `is_active: true` |
| T-006 | Offer creation | `POST /offers` → 201 com preço correto |
| T-007 | Offer filtering | `GET /offers?product_id=eq.{id}&is_active=is.true` → lista |
| T-008 | Price history | `POST /price_history` → 201; `GET` → lista |
| T-009 | Best offer | `GET /best_product_offers?product_id=eq.{id}` → campos obrigatórios |
| T-010 | Deal summary | `GET /product_deal_summary?product_id=eq.{id}` → current_best_price |
| T-011 | Alert creation | `POST /alerts` → 201, `is_active: true` |
| T-012 | Affiliate click | `POST /affiliate_clicks` → 201, source correto |

---

# 7. Ordem de execução recomendada

A collection deve ser executada na ordem da árvore pois cada grupo depende de recursos criados pelo anterior:

```text
Health → Categories → Brands → Products → Product Identifiers
       → Stores → Offers → Price History
       → Best Offers → Deal Summary → Price History (view)
       → Alerts → Affiliate
```

Os IDs criados em cada POST são automaticamente salvos nas variáveis de ambiente via scripts de test (`pm.environment.set`), eliminando a necessidade de copiar manualmente.

---

# 8. Segurança nas requisições

- Requisições de leitura pública **não** incluem `Authorization`
- Requisições de escrita do Worker usam `{{worker_jwt}}`
- Requisições de usuário autenticado usam `{{user_jwt}}`
- Os tokens **nunca** são commitados no arquivo de environment — são preenchidos localmente antes de rodar a collection

---

# 9. Traceability

| Seção | Origem |
|---|---|
| Estrutura da collection | Backend Spec §18 |
| Environment variables | Backend Spec §19 |
| Testes mínimos T-001 a T-012 | Backend Spec §20 |
| Endpoints cobertos | API Spec §6–§9 |
| Ordem de execução | Backend Spec §20 — Test Strategy |
