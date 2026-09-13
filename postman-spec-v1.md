# Postman Spec V1 — Elite Bot API Validation
> Derivada de `Elite-Bot-API-Specification.md` e dos dados reais produzidos pelo E2E do pipeline.
> Esta spec define **o que testar, como testar, e o critério de aprovação** antes de tocar na Chrome Extension.

---

## 1. Objetivo

Provar que o backend V1 pode ser consumido corretamente via HTTP antes de qualquer frontend.

```
PostgreSQL
    ↓
PostgREST (localhost:3000)
    ↓
Postman — testes estruturados
    ↓
critérios de aprovação
    ↓
Extension pode ser construída em cima disso
```

---

## 2. Ambiente

### Variáveis Postman

| Variável           | Valor inicial                    | Descrição                              |
| ------------------ | -------------------------------- | -------------------------------------- |
| `base_url`         | `http://localhost:3000`          | URL base do PostgREST                  |
| `product_id`       | *(preenchido em TC-P0-01)*       | ID do produto real do E2E              |
| `offer_id`         | `00000000-0000-0000-0000-000000000004` | ID da oferta criada pelo E2E     |
| `store_id`         | `00000000-0000-0000-0000-000000000003` | ID da loja Beleza na Web         |
| `jwt_authenticated`| *(gerado com `JWT_SECRET`)*      | JWT com `role=authenticated`, `sub=<user_id>` |
| `user_id`          | *(preenchido ao criar usuário)*  | UUID do usuário de teste               |
| `alert_id`         | *(preenchido em TC-SEC-01)*      | ID do alerta criado no teste de RLS    |

### Pré-condição

Banco com dados do E2E aplicados:
- Produto `fame-rabanne-edp-80ml-e2e` com offer, price_history e deal_scores reais.
- Store `beleza-na-web` com `domain = belezanaweb.com.br`.

---

## 3. Estrutura dos casos de teste

```
P0 — Leitura do catálogo (público, sem auth)
P1 — Views (público, sem auth) ← mais importante para a Extension
P2 — Fluxo principal E2E via API
P3 — Escrita (Worker)
SEC — Segurança / RLS
```

Cada caso tem:
- **Request** — método, URL, headers, body
- **Expected** — status HTTP + campos mínimos obrigatórios
- **Assert** — o que o Postman deve validar com scripts
- **Critério** — o que define pass/fail

---

## 4. P0 — Leitura do catálogo

### TC-P0-01 — Listar categorias

```http
GET {{base_url}}/categories
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("array com >= 1 item", () => {
    const body = pm.response.json();
    pm.expect(body).to.be.an('array').with.length.gte(1);
});
pm.test("categoria perfumes existe", () => {
    const body = pm.response.json();
    const perfumes = body.find(c => c.slug === 'perfumes');
    pm.expect(perfumes).to.exist;
    pm.expect(perfumes.name).to.equal('Perfumes');
});
// Salva category_id para uso posterior
const perfumes = pm.response.json().find(c => c.slug === 'perfumes');
if (perfumes) pm.environment.set('category_id', perfumes.id);
```

---

### TC-P0-02 — Listar brands

```http
GET {{base_url}}/brands
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("array", () => pm.expect(pm.response.json()).to.be.an('array'));
```

---

### TC-P0-03 — Listar stores ativas

```http
GET {{base_url}}/stores?is_active=is.true
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("Beleza na Web presente", () => {
    const body = pm.response.json();
    const bnw = body.find(s => s.domain === 'belezanaweb.com.br');
    pm.expect(bnw).to.exist;
    pm.expect(bnw.is_active).to.be.true;
});
```

---

### TC-P0-04 — Listar produtos por categoria

```http
GET {{base_url}}/products?category_id=eq.{{category_id}}&order=name.asc
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("array", () => pm.expect(pm.response.json()).to.be.an('array'));
// Salva product_id do produto E2E
const body = pm.response.json();
const fame = body.find(p => p.slug === 'fame-rabanne-edp-80ml-e2e');
if (fame) pm.environment.set('product_id', fame.id);
```

---

### TC-P0-05 — Listar ofertas ativas de um produto

```http
GET {{base_url}}/offers?product_id=eq.{{product_id}}&is_active=is.true&order=price.asc
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("pelo menos 1 oferta", () => {
    pm.expect(pm.response.json()).to.be.an('array').with.length.gte(1);
});
pm.test("oferta tem price > 0", () => {
    const offer = pm.response.json()[0];
    pm.expect(parseFloat(offer.price)).to.be.gt(0);
    pm.expect(offer.availability).to.equal('in_stock');
});
```

---

### TC-P0-06 — Histórico de preços de uma oferta

```http
GET {{base_url}}/price_history?offer_id=eq.{{offer_id}}&order=captured_at.desc&limit=10
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("pelo menos 1 registro", () => {
    pm.expect(pm.response.json()).to.be.an('array').with.length.gte(1);
});
pm.test("price_history tem price = 482.31", () => {
    const record = pm.response.json()[0];
    pm.expect(parseFloat(record.price)).to.equal(482.31);
});
```

---

### TC-P0-07 — Listar deal scores de uma oferta

```http
GET {{base_url}}/deal_scores?offer_id=eq.{{offer_id}}&order=calculated_at.desc&limit=1
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("deal_score existe", () => {
    const body = pm.response.json();
    pm.expect(body).to.be.an('array').with.length.gte(1);
    const s = body[0];
    pm.expect(parseFloat(s.score)).to.be.gt(0);
    pm.expect(['excellent','good','normal','expensive']).to.include(s.classification);
    pm.expect(parseFloat(s.current_price)).to.equal(482.31);
});
```

---

## 5. P1 — Views (contrato da Extension)

> Estes são os três endpoints que a Chrome Extension realmente usa. São os mais críticos.

### TC-P1-01 — `best_product_offers` — melhores ofertas com deal score

```http
GET {{base_url}}/best_product_offers?product_id=eq.{{product_id}}&order=total_price.asc
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("retorna pelo menos 1 oferta", () => {
    pm.expect(pm.response.json()).to.be.an('array').with.length.gte(1);
});
pm.test("campos obrigatórios presentes", () => {
    const o = pm.response.json()[0];
    pm.expect(o).to.have.property('product_id');
    pm.expect(o).to.have.property('offer_id');
    pm.expect(o).to.have.property('store_name');
    pm.expect(o).to.have.property('store_domain');
    pm.expect(o).to.have.property('price');
    pm.expect(o).to.have.property('shipping_price');
    pm.expect(o).to.have.property('total_price');
    pm.expect(o).to.have.property('availability');
    pm.expect(o).to.have.property('product_url');
    pm.expect(o).to.have.property('score');
    pm.expect(o).to.have.property('classification');
});
pm.test("total_price = price + shipping_price", () => {
    const o = pm.response.json()[0];
    const expected = parseFloat(o.price) + parseFloat(o.shipping_price);
    pm.expect(parseFloat(o.total_price)).to.be.closeTo(expected, 0.01);
});
pm.test("store_domain está correto", () => {
    const o = pm.response.json()[0];
    pm.expect(o.store_domain).to.equal('belezanaweb.com.br');
});
```

---

### TC-P1-02 — `product_price_history` — histórico consolidado

```http
GET {{base_url}}/product_price_history?product_id=eq.{{product_id}}&order=captured_at.desc&limit=30
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("retorna histórico", () => {
    pm.expect(pm.response.json()).to.be.an('array').with.length.gte(1);
});
pm.test("campos obrigatórios", () => {
    const r = pm.response.json()[0];
    pm.expect(r).to.have.property('product_id');
    pm.expect(r).to.have.property('product_name');
    pm.expect(r).to.have.property('store_name');
    pm.expect(r).to.have.property('price');
    pm.expect(r).to.have.property('shipping_price');
    pm.expect(r).to.have.property('total_price');
    pm.expect(r).to.have.property('captured_at');
});
pm.test("total_price calculado corretamente", () => {
    const r = pm.response.json()[0];
    const expected = parseFloat(r.price) + parseFloat(r.shipping_price);
    pm.expect(parseFloat(r.total_price)).to.be.closeTo(expected, 0.01);
});
```

---

### TC-P1-03 — `product_deal_summary` — resumo para o Popup

```http
GET {{base_url}}/product_deal_summary?product_id=eq.{{product_id}}
```

**Expected:** `200 OK`

**Assert:**
```js
pm.test("status 200", () => pm.response.to.have.status(200));
pm.test("retorna resumo", () => {
    pm.expect(pm.response.json()).to.be.an('array').with.length.gte(1);
});
pm.test("campos obrigatórios", () => {
    const s = pm.response.json()[0];
    pm.expect(s).to.have.property('product_id');
    pm.expect(s).to.have.property('current_best_price');
    pm.expect(s).to.have.property('average_price');
    pm.expect(s).to.have.property('score');
    pm.expect(s).to.have.property('classification');
});
pm.test("current_best_price > 0", () => {
    const s = pm.response.json()[0];
    pm.expect(parseFloat(s.current_best_price)).to.be.gt(0);
});
pm.test("classification é valor válido", () => {
    const s = pm.response.json()[0];
    pm.expect(['excellent','good','normal','expensive']).to.include(s.classification);
});
```

---

## 6. P2 — Fluxo principal E2E via API

> Simula exatamente o que a Extension fará: descobrir um produto → consultar → montar o Popup.

### TC-P2-01 — Fluxo completo: produto → ofertas → deal → histórico

**Sequência de requests (em ordem):**

1. `GET /categories` → encontrar ID de `perfumes`
2. `GET /products?category_id=eq.{id}` → encontrar produto E2E
3. `GET /best_product_offers?product_id=eq.{id}&order=total_price.asc` → melhor oferta
4. `GET /product_deal_summary?product_id=eq.{id}` → deal score
5. `GET /product_price_history?product_id=eq.{id}&order=captured_at.desc&limit=10` → histórico

**Critério de aprovação do fluxo completo:**

```js
// Executar ao final da request 5
pm.test("fluxo E2E: produto tem oferta real", () => {
    // Verificado nos passos anteriores via environment variables
    pm.expect(pm.environment.get('product_id')).to.not.be.empty;
    pm.expect(pm.environment.get('offer_id')).to.not.be.empty;
});
```

**O que este fluxo valida:**
- Pipeline do backend consegue ser consumido end-to-end via HTTP
- Dados raspados pelo connector chegam à API corretamente
- Views produzem os campos esperados pela Extension

---

## 7. P3 — Escrita (Worker)

> Testa que o PostgREST aceita escrita com as permissões corretas.
> Em V1, escrita é feita pelo Worker diretamente via DB — mas validamos o contrato HTTP para uso futuro.

### TC-P3-01 — Criar produto (sem auth → deve falhar)

```http
POST {{base_url}}/products
Content-Type: application/json

{
  "name": "Teste sem auth",
  "slug": "teste-sem-auth",
  "gender": "male"
}
```

**Expected:** `401` ou `403`

**Assert:**
```js
pm.test("escrita sem auth é rejeitada", () => {
    pm.expect(pm.response.code).to.be.oneOf([401, 403]);
});
```

---

### TC-P3-02 — Criar alerta (usuário autenticado)

```http
POST {{base_url}}/alerts
Content-Type: application/json
Authorization: Bearer {{jwt_authenticated}}

{
  "product_id": "{{product_id}}",
  "target_price": 400.00,
  "currency": "BRL"
}
```

**Expected:** `201 Created`

**Assert:**
```js
pm.test("alerta criado", () => pm.response.to.have.status(201));
// Salva alert_id para o teste de RLS
const loc = pm.response.headers.get('Location');
if (loc) {
    const match = loc.match(/id=eq\.([^&]+)/);
    if (match) pm.environment.set('alert_id', match[1]);
}
```

---

### TC-P3-03 — Registrar clique de afiliado

```http
POST {{base_url}}/affiliate_clicks
Content-Type: application/json
Authorization: Bearer {{jwt_authenticated}}

{
  "offer_id": "{{offer_id}}",
  "source": "extension"
}
```

**Expected:** `201 Created`

**Assert:**
```js
pm.test("click registrado", () => pm.response.to.have.status(201));
```

---

## 8. SEC — Segurança / RLS

> Valida que o Row-Level Security funciona. Este bloco não deve ser pulado.

### TC-SEC-01 — Usuário A não vê alertas do usuário B

**Pré-condição:** dois JWTs diferentes, alerta criado pelo usuário A (TC-P3-02).

```http
GET {{base_url}}/alerts
Authorization: Bearer {{jwt_user_b}}
```

**Expected:** `200 OK` com array vazio (RLS filtra)

**Assert:**
```js
pm.test("usuário B não vê alertas do usuário A", () => {
    pm.response.to.have.status(200);
    const body = pm.response.json();
    pm.expect(body).to.be.an('array').with.length(0);
});
```

---

### TC-SEC-02 — Leitura pública do catálogo sem auth

```http
GET {{base_url}}/products
```
*(sem header Authorization)*

**Expected:** `200 OK`

**Assert:**
```js
pm.test("catálogo público sem auth: 200", () => pm.response.to.have.status(200));
```

---

### TC-SEC-03 — Alerta sem JWT é rejeitado

```http
POST {{base_url}}/alerts
Content-Type: application/json

{
  "product_id": "{{product_id}}",
  "target_price": 300.00
}
```
*(sem header Authorization)*

**Expected:** `401` ou `403`

**Assert:**
```js
pm.test("POST /alerts sem auth é rejeitado", () => {
    pm.expect(pm.response.code).to.be.oneOf([401, 403]);
});
```

---

### TC-SEC-04 — Affiliate click sem JWT é rejeitado

```http
POST {{base_url}}/affiliate_clicks
Content-Type: application/json

{
  "offer_id": "{{offer_id}}",
  "source": "extension"
}
```
*(sem header Authorization)*

**Expected:** `401` ou `403`

**Assert:**
```js
pm.test("POST /affiliate_clicks sem auth é rejeitado", () => {
    pm.expect(pm.response.code).to.be.oneOf([401, 403]);
});
```

---

## 9. Critérios de aprovação do milestone

O milestone **API + Postman Validation** está concluído quando:

| Grupo | Casos | Critério |
| ----- | ----- | -------- |
| P0 — Catálogo | TC-P0-01 a TC-P0-07 | 7/7 passando |
| P1 — Views | TC-P1-01 a TC-P1-03 | 3/3 passando — **obrigatório** antes da Extension |
| P2 — Fluxo E2E | TC-P2-01 | 1/1 passando |
| P3 — Escrita | TC-P3-01 a TC-P3-03 | 3/3 passando |
| SEC — Segurança | TC-SEC-01 a TC-SEC-04 | 4/4 passando — **obrigatório** antes da Extension |

**Total: 18 casos / 18 obrigatórios**

> Nenhum grupo é opcional. SEC em especial **não pode ser adiado** — a RLS é o único mecanismo de isolamento de dados privados na V1.

---

## 10. O que NÃO está nesta spec

| Item | Por quê |
| ---- | ------- |
| `POST /rpc/identify_product` | RPC não implementada ainda (product-agent exposto via DB, não via RPC) |
| Deal Score history com múltiplas coletas | Faz parte do milestone Backend V1 Validation (próximo) |
| JWT emissão/autenticação | Sem sistema de auth próprio na V1 — JWT gerado manualmente com `PGRST_JWT_SECRET` |
| Testes de carga / performance | Fora do escopo V1 |

---

## 11. Como gerar JWT de teste

O PostgREST valida JWTs assinados com `PGRST_JWT_SECRET` (HS256).

**Payload para `authenticated`:**
```json
{
  "role": "authenticated",
  "sub": "<uuid-do-usuario>",
  "exp": 9999999999
}
```

**Payload para `web_anon` (leitura pública):**
Sem JWT necessário — PostgREST usa a role `web_anon` por padrão.

**Ferramenta:** [jwt.io](https://jwt.io) com `Algorithm: HS256` e `secret: change_me_minimum_32_characters_secret`.

---

## 12. Roadmap após aprovação desta spec

```
Postman V1 ✅
    ↓
Backend V1 Validation
    ├── pipeline real com múltiplas coletas
    ├── histórico e Deal Score acumulado
    └── múltiplas ofertas por produto
    ↓
Chrome Extension
    ├── identificação de produto
    ├── consulta /best_product_offers
    ├── consulta /product_deal_summary
    ├── OfferCard + DealScore UI
    └── affiliate click → POST /affiliate_clicks
    ↓
JWT / Auth real
    ↓
Affiliate Redirect HTTP
    ↓
Notifications
    ↓
Website
```
