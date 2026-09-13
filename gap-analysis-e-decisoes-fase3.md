# Gap Analysis & Decisões Arquiteturais — Fase 3
> **STATUS: ✅ MILESTONE CONCLUÍDO** — Pipeline real E2E 12/12 checks passando.
> Próximo milestone: API + Postman Validation → ver `postman-spec-v1.md`.

---

## 1. Premissa de contexto

O projeto **não está começando do zero**. A Fase 1 e a maior parte da Fase 2/3 já existem e estão implementadas. O risco principal mudou:

| Risco anterior         | Risco atual                                               |
| ---------------------- | --------------------------------------------------------- |
| "Não temos código"     | "A IA cria código duplicado ou contraditório"             |

Qualquer novo prompt ao BOB deve:
1. Reutilizar contratos, tipos, tabelas, services e regras já implementados.
2. Reportar conflito com a arquitetura existente **antes** de alterar qualquer coisa.
3. Nunca criar uma segunda implementação da mesma responsabilidade.

---

## 2. Estado do projeto neste momento

```
V1 Foundation       ██████████  100%   (PostgreSQL + PostgREST + Docker + RLS)
Backend Core        ████████░░   80%   (Agents + Jobs; connectors ausentes)
Real Data Pipeline  ██░░░░░░░░   20%   (JOB-001 é stub; nenhum dado real entra)
Product Experience  ░░░░░░░░░░    0%   (Extension + Website inexistentes)
```

---

## 3. Matriz de estado atual vs. Matriz de Agentes

| Área                  | Estado | Agente responsável    | Situação                                             |
| --------------------- | ------ | --------------------- | ---------------------------------------------------- |
| PostgreSQL            | ✅      | Backend               | Pronto                                               |
| PostgREST             | ✅      | Backend / Architect   | Pronto                                               |
| Docker                | ✅      | Architect / Backend   | Pronto                                               |
| RLS                   | ✅      | Architect / Backend   | Pronto — falta validar cenário real                  |
| Product Agent         | ✅      | Domain + Backend      | Implementado                                         |
| Price Agent           | ✅      | Domain + Backend      | Implementado                                         |
| Matching Agent        | ✅      | Domain + Backend      | Implementado                                         |
| Deal Agent            | ✅      | Domain + Backend      | Implementado                                         |
| Alert Agent           | ✅      | Domain + Backend      | Implementado                                         |
| Affiliate Agent       | ✅      | Domain + Backend      | **Módulo implementado** — ver DECISÃO-06             |
| JOB-001               | ⚠️     | Backend               | **Bloqueado por connector**                          |
| JOB-002               | ✅      | Backend               | Pronto                                               |
| JOB-003               | ✅      | Backend               | Pronto                                               |
| JOB-004               | ⚠️     | Backend               | Falta notificação real                               |
| Store Connector       | ❌      | Backend               | **Próximo trabalho**                                 |
| Semantic Matching     | ❌      | Domain + Backend      | Gap documentado                                      |
| Notifications         | ❌      | Backend               | Gap documentado                                      |
| JWT real              | ⚠️     | Architect + Backend   | Gap documentado                                      |
| Affiliate Redirect HTTP | ❌   | Backend               | **Gap — ver DECISÃO-06**                             |
| Extension             | ❌      | Frontend              | Gap documentado                                      |
| Website               | ❌      | Frontend              | Gap documentado                                      |
| Automated Tests       | ❌      | QA                    | Gap documentado                                      |

---

## 4. Classificação dos gaps

### 🔴 Bloqueadores do Core Loop

| Gap                | Impacto                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Store Connector    | JOB-001 é stub — pipeline inteiro não tem dados reais            |
| JOB-001 real       | Sem connector não há ingestão; sem ingestão não há Deal Score    |
| Semantic Matching  | Produtos sem EAN/brand exato nunca são identificados             |

### 🟠 Bloqueadores de produto

| Gap                      | Impacto                                                      |
| ------------------------ | ------------------------------------------------------------ |
| Chrome Extension         | Produto principal não existe                                 |
| JWT real                 | RLS e alertas funcionam só em testes; usuários reais não entram |
| Affiliate Redirect HTTP  | Monetização não fecha o ciclo (módulo existe, endpoint não)  |
| Notifications            | Alertas só logam no console                                  |

### 🟡 Qualidade / escala

| Gap                    | Impacto                                              |
| ---------------------- | ---------------------------------------------------- |
| Automated Tests        | Nenhum teste automatizado — regressão não detectável |
| Mais lojas             | Pipeline só tem uma loja                             |
| Observabilidade        | Nenhum log estruturado / métricas                    |

### 🟢 Depois (fora do escopo da V1 imediata)

Website, SEO avançado, personalização, novas categorias.

---

## 5. Próximo milestone — objetivo

> **Primeiro dado real no pipeline**

```
URL real da Beleza na Web
          ↓
BelezaNaWebConnector
          ↓
ScrapedOffer
          ↓
JOB-001
          ↓
offers (atualizado)
          ↓
price_history (criado)
          ↓
JOB-003
          ↓
deal_scores (calculado)
```

Este milestone valida uma parte enorme do sistema que hoje só existe como código sem dados.

---

## 6. Roadmap técnico reordenado

```
CORE LOOP
    │
    ▼
Beleza na Web Connector  ← próximo (pré-condição: decisões desta seção)
    │
    ▼
JOB-001 real
    │
    ▼
Dado real no DB
    │
    ▼
Deal Pipeline E2E
    │
    ▼
Semantic Matching
    │
    ▼
Testes E2E            ← entra ANTES da Extension (valida o motor)
    │
    ▼
Chrome Extension
    │
    ▼
JWT / Auth
    │
    ▼
Affiliate Redirect
    │
    ▼
Notifications
    │
    ▼
Website
```

> **Nota sobre testes:** testes E2E entram antes do frontend para garantir que o motor
> funciona antes de colocar interface em cima.

---

## 7. Decisões arquiteturais

Estes são os pontos identificados na revisão do plano [`fase-3-store-connector-plan.md`](fase-3-store-connector-plan.md)
que precisavam de decisão antes de qualquer linha de código.

---

### DECISÃO-01 — `node-fetch` vs. fetch nativo

**Situação:**
O plano ST-01 propõe adicionar `node-fetch` como dependência.

**Contexto técnico verificado:**
- `worker/package.json` declara `@types/node: ^20.17.0` — Node.js 20
- `tsconfig.json` tem `"target": "ES2022"`, `"module": "NodeNext"`
- Node.js 18+ incluiu `fetch` nativo globalmente (sem flag)
- Node.js 20 é a versão LTS atual — fetch nativo está estável

**Decisão:**
❌ Não adicionar `node-fetch`.
✅ Usar `fetch` nativo do Node.js 20.

**Impacto em ST-01:**
ST-01 instala apenas `node-html-parser`. O Architecture Review confirma a compatibilidade do `fetch` nativo com o projeto existente.

**Status:** `[x] APROVADA pelo PO`

---

### DECISÃO-02 — Validar fonte de dados antes de implementar o connector ⛔ GATE

**Validação executada:** dois produtos reais testados via `curl` + `fetch` nativo (Node.js 20).

**Resultado:**

| Item verificado | Resultado |
| --- | --- |
| HTML retornado sem JS | ✅ HTTP 200, ~160KB |
| `application/ld+json` no HTML inicial | ✅ 2 blocos por página |
| Estrutura raiz | ⚠️ `@type: ProductGroup` — não `Product` diretamente |
| `@type: Product` | ✅ dentro de `hasVariant[]` |
| `price` | ✅ número float direto (`482.31`, `962.01`) |
| `priceCurrency` | ✅ `"BRL"` |
| `availability` | ✅ presente — como URI: `"https://schema.org/InStock"` |
| `name` / `title` | ✅ presente |
| `sku` | ✅ presente (SKU interno da loja) |
| `gtin13` / `gtin` | ❌ ausente nos dois produtos testados — campo existe mas vazio |
| `mpn` | ❌ ausente |
| `shippingPrice` | ❌ não exposto no JSON-LD |

**Ajustes obrigatórios incorporados em ST-03:**

1. **ProductGroup → hasVariant:** parser deve localizar `ProductGroup` e selecionar o variant correspondente à URL da página, não assumir `@type: Product` na raiz nem cegamente `hasVariant[0]` se houver forma melhor de identificar a URL correta.
2. **`availability` é URI schema.org:** normalizar antes de retornar: `"https://schema.org/InStock"` → `'in_stock'`, `"https://schema.org/OutOfStock"` → `'out_of_stock'`, `"https://schema.org/PreOrder"` → `'pre_order'`, qualquer outro → `'unknown'`.
3. **EAN ausente é comportamento normal:** extrair `gtin13`/`gtin` quando existir. Ausência não é erro de scraping. Nunca transformar `sku` em `ean`.
4. **`shippingPrice: 0`** explícito — não disponível no JSON-LD da Beleza na Web.

**Regra adicional (PO):** ausência de campos opcionais (`sku`, `ean`, `mpn`, `shippingPrice`) é comportamento normal. Apenas ausência de `price` utilizável justifica retornar `null`.

**Status:** `[x] APROVADA pelo PO — ST-03 LIBERADO`

---

### DECISÃO-03 — Identificadores: campos planos, preservar origem *(Opção A — aprovada pelo PO)*

**Situação:**
O plano ST-03 menciona extrair `gtin13 / sku` do JSON-LD como identificador, tratando-os
de forma equivalente.

**Problema:**
O banco já modela a distinção com `product_identifiers.identifier_type`:

| Campo JSON-LD | Tipo real                | Mapeamento correto no DB         |
| ------------- | ------------------------ | -------------------------------- |
| `gtin13`      | EAN-13 global            | `identifier_type = 'ean'`        |
| `gtin14`      | GTIN-14 global           | `identifier_type = 'gtin'`       |
| `gtin`        | GTIN genérico            | `identifier_type = 'gtin'`       |
| `sku`         | SKU interno da loja      | `identifier_type = 'sku'`        |
| `brand_sku`   | SKU de marca             | `identifier_type = 'brand_sku'`  |
| `mpn`         | Manufacturer part number | `identifier_type = 'mpn'`        |

O `matching-agent` e o `product-agent` dependem desta distinção. Tratar `sku` como `ean`
quebraria silenciosamente o Matching Agent.

**Decisão final — Opção A (campos planos):**
O `product-agent` existente aceita `ean?: string`. Introduzir `identifiers[]` criaria uma segunda abstração e exigiria mudanças adicionais no pipeline fora do escopo deste milestone.

**Contrato de `ScrapedOffer` para identificadores:**

```typescript
ean?: string;   // apenas EAN-13 / GTIN — usado pelo product-agent para matching
sku?: string;   // SKU interno da loja — extraído, preservado, NÃO usado no matching desta fase
mpn?: string;   // Manufacturer Part Number — extraído, preservado, NÃO usado no matching desta fase
```

**Regra inviolável:** cada campo preserva sua origem e significado. `sku` nunca é tratado como `ean`. O connector extrai os três, mas o pipeline atual usa apenas `ean` para identificação automática.

**Status:** `[x] APROVADA pelo PO — Opção A (campos planos)`

---

### DECISÃO-04 — `availability` como union type, sem string livre

**Situação:**
O banco define:

```sql
CREATE TYPE availability_status AS ENUM (
    'in_stock',
    'out_of_stock',
    'pre_order',
    'unknown'
);
```

O connector pode encontrar strings variadas na página: `"InStock"`, `"OutOfStock"`, `"PreOrder"`, etc.

**Decisão:**
O connector deve converter internamente antes de retornar. O tipo de `ScrapedOffer.availability`
deve ser exatamente:

```typescript
availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
```

Nunca `string` livre.

**Status:** `[x] APROVADA pelo PO`

---

### DECISÃO-05 — `price` e `shippingPrice` separados em `ScrapedOffer`

**Situação:**
O `Deal Agent` calcula `current_price = offer.price + offer.shipping_price`
(implementado em [`deal-agent.ts`](worker/src/agents/deal-agent.ts), linhas 59–60).
Isso é consistente com as views `best_product_offers` e `product_deal_summary`.

**Risco:**
Se o connector colocar o total (produto + frete) no campo `price` e `shippingPrice = 0`,
o Deal Score calcula correto mas comparações entre lojas ficam distorcidas.

**Decisão:**
`ScrapedOffer` mantém `price` (produto) e `shippingPrice` (frete) separados.
Se frete não estiver na página → retornar `shippingPrice: 0` explicitamente, nunca `undefined`.

**Status:** `[x] APROVADA pelo PO`

---

### DECISÃO-06 — `affiliate-agent.ts` (módulo) ≠ Affiliate Redirect HTTP (endpoint)

**Situação:**
O Affiliate Agent estava marcado como "implementado" de forma genérica, o que ocultava um gap real.

**Distinção necessária:**

| Componente              | Status | O que existe                                              |
| ----------------------- | ------ | --------------------------------------------------------- |
| `affiliate-agent.ts`    | ✅      | Lógica de registro de clique e retorno de URL afiliada    |
| Affiliate Redirect HTTP | ❌      | Endpoint HTTP inexistente — Extension/Website não têm rota para disparar o clique e receber redirect |

O módulo tem a lógica, mas não há superfície HTTP exposta via PostgREST ou Worker.
Este gap permanece na classificação 🟠 e não entra no milestone atual.

**Status:** `[x] APROVADA pelo PO — gap 🟠 documentado, fora deste milestone`

---

## 8. Critério de aceite do milestone

O milestone "Primeiro dado real" só está concluído quando:

| #     | Acceptance Criteria                                                  | Status        |
| ----- | -------------------------------------------------------------------- | ------------- |
| AC-01 | URL válida da Beleza na Web é reconhecida pelo registry              | `[ ] pending` |
| AC-02 | Connector consegue obter a página sem erro                           | `[ ] pending` |
| AC-03 | Preço do produto é extraído corretamente (formato numérico)          | `[ ] pending` |
| AC-04 | Título do produto é extraído                                         | `[ ] pending` |
| AC-05 | Disponibilidade é normalizada para o enum correto                    | `[ ] pending` |
| AC-06 | EAN, quando presente, é disponibilizado em `ScrapedOffer.ean`        | `[ ] pending` |
| AC-07 | ~~SKU gravado como `identifier_type = 'sku'`~~                       | `[ADIADO]` — ver nota abaixo |
| AC-08 | Falha de scraping não derruba o Worker (isolamento de erro)          | `[ ] pending` |
| AC-09 | JOB-001 atualiza `offers` com dados reais                            | `[ ] pending` |
| AC-10 | JOB-001 cria registro em `price_history`                             | `[ ] pending` |
| AC-11 | JOB-003 calcula `deal_scores` usando os dados ingestados             | `[ ] pending` |
| AC-12 | Nenhuma credencial é exposta em logs ou código                       | `[ ] pending` |

> **AC-07 — ADIADO:** O `product-agent` atual aceita apenas `ean` como identificador de entrada. A implementação de matching/persistência por SKU exige extensão do contrato do `product-agent` e/ou do job de matching — fora do escopo deste milestone. O connector pode extrair e preservar `sku` em `ScrapedOffer`, mas a gravação em `product_identifiers` fica para um milestone posterior.

> "typecheck passou" **não é** critério de conclusão — é pré-condição mínima.

---

## 9. Coordenação de agentes — congelada para este milestone

```
PO / Orchestrator
       │
       │ aprova decisões deste documento
       ▼
Architecture Review       ← valida DECISÕES-01 a 06 + confirma plano ST-01 → ST-05
       │
       │ contrato aprovado
       ▼
[GATE] DECISÃO-02         ← validação manual: HTML estático da Beleza na Web
       │
       │ HTML estático confirmado
       ▼
Backend Agent             ← Bloco A (ST-01, ST-02) → revisão → Bloco B (ST-03 → ST-05)
       │
       │ implementação
       ▼
QA Agent                  ← valida AC-01 a AC-12
       │
       ▼
MILESTONE DONE
```

**Domain Agent:** NÃO chamar — salvo conflito de regra de negócio não antecipado.
**Frontend Agent:** NÃO chamar neste milestone.

---

## 10. Sub-tarefas — blocos de execução

### Bloco A — Infraestrutura do connector ✅ AUTORIZADO

| Sub-tarefa | Descrição                                                      | Status         |
| ---------- | -------------------------------------------------------------- | -------------- |
| ST-01      | Instalar `node-html-parser` (apenas — não `node-fetch`)        | `[ ] autorizado` |
| ST-02      | Criar `worker/src/stores/types.ts` com `ScrapedOffer` e `StoreConnector` | `[ ] autorizado` |

**Contrato obrigatório de `ScrapedOffer` (resultado de B1 + B2 do Architecture Review):**

```typescript
interface ScrapedOffer {
  price: number;                // obrigatório
  originalPrice?: number;
  shippingPrice: number;        // obrigatório — nunca undefined; usar 0 se não encontrado
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
  title?: string;               // correção B2: necessário para product-agent
  ean?: string;                 // apenas EAN-13/GTIN — usado no matching
  sku?: string;                 // SKU da loja — preservado, não usado no matching desta fase
  mpn?: string;                 // MPN — preservado, não usado no matching desta fase
}
```

> Se a interface `ScrapedOffer` estiver errada, corrigimos aqui antes do Bloco B.

### Bloco B — Implementação e integração ⛔ BLOQUEADO

| Sub-tarefa | Descrição                                             | Status                                              |
| ---------- | ----------------------------------------------------- | --------------------------------------------------- |
| ST-03      | Implementar `BelezaNaWebConnector`                    | `⛔ bloqueado — aguarda DECISÃO-02`                  |
| ST-04      | Criar registry de connectors                          | `⛔ bloqueado — aguarda ST-03`                       |
| ST-05      | Integrar connectors no JOB-001 (+ JOIN em `stores`)   | `⛔ bloqueado — aguarda ST-04`                       |

> **ST-05 nota:** a query do JOB-001 precisa de JOIN em `stores` para trazer `store.domain` (correção B3 do Architecture Review). Já está no escopo de ST-05.

---

## 11. Prompt de Architecture Review — versão final aprovada pelo PO

Este é o **primeiro** prompt a enviar ao BOB. Nenhum código deve ser escrito antes deste retorno.

---

```
Analise exclusivamente a proposta ST-01 → ST-05 do arquivo fase-3-store-connector-plan.md.

NÃO implemente código, NÃO crie arquivos e NÃO altere nenhum artefato.

O objetivo desta etapa é somente validar o plano técnico antes da implementação.

Verifique a compatibilidade com os artefatos existentes:

- worker/package.json — Node.js 20 / dependências atuais
- worker/tsconfig.json — ES2022 / NodeNext
- worker/src/agents/price-agent.ts — interface PriceData e campos esperados
- worker/src/agents/product-agent.ts — tipos e fluxo de identificação
- worker/src/agents/matching-agent.ts — regras atuais de matching
- worker/src/jobs/job-ingest-prices.ts — fluxo atual de ingestão
- database/migrations/001_initial_schema.sql — availability_status, offers, product_identifiers
- worker/src/agents/deal-agent.ts — cálculo envolvendo price e shipping_price

Responda especificamente:

1. node-fetch é necessário no Node.js 20 considerando as dependências e configuração atuais? Se não, confirme o uso do fetch nativo.
2. A interface ScrapedOffer proposta está compatível com PriceData?
3. ScrapedOffer deve manter ean, sku, mpn e demais identificadores distintos? Não assumir que SKU é EAN. Não assumir que GTIN e EAN são intercambiáveis sem verificar o contrato existente de product_identifiers.identifier_type.
4. Verifique se os tipos de identificadores propostos são compatíveis com product_identifiers.identifier_type.
5. Verifique se availability deve ser normalizado para o conjunto exato de valores aceito pelo banco.
6. Verifique se price e shippingPrice devem permanecer separados para preservar o cálculo atual do Deal Agent.
7. Verifique se existe algum conflito entre ST-01 → ST-05 e código/contratos já existentes.
8. Verifique se a implementação proposta cria alguma responsabilidade duplicada em relação aos Agents ou Jobs existentes.
9. Identifique qualquer dependência técnica que esteja faltando antes da implementação.
10. Identifique qualquer decisão que precise voltar ao PO/Orchestrator antes de implementar.

Regra de escopo

A análise deve permanecer limitada ao primeiro Store Connector da Beleza na Web.

Não propor:
- Chrome Extension
- Website
- novas categorias
- novas lojas
- microservices, Redis, filas, Kubernetes
- autenticação nova
- novas features
- refatorações não necessárias ao connector

Formato obrigatório da resposta

Retorne somente:

A. APROVADO
   decisões que podem ser executadas como estão

B. CORREÇÕES NECESSÁRIAS
   mudanças obrigatórias no plano ST-01 → ST-05

C. BLOQUEIOS
   qualquer problema que impeça a implementação

D. ORDEM DE EXECUÇÃO
   sequência final recomendada para ST-01 → ST-05

Não escreva código nesta etapa.
```

---

## 12. Gate — o que acontece depois do Architecture Review

Architecture Review concluído. Decisões do PO registradas. Bloco A autorizado.

O que acontece agora:

1. ✅ Architecture Review retornou — seções B e C avaliadas pelo PO
2. ✅ B1 → Opção A aprovada (campos planos `ean/sku/mpn`)
3. ✅ C2 → AC-07 adiado formalmente
4. ▶️ **Executar ST-01 → ST-02 (Bloco A)**
5. Após Bloco A: PO revisa `types.ts` gerado
6. PO realiza validação manual do HTML (DECISÃO-02)
7. HTML confirmado → liberar ST-03 → ST-04 → ST-05 (Bloco B)

---

## 13. Regra global para todos os próximos prompts ao BOB

> **Antes de implementar qualquer tarefa, o agente deve:**
> 1. Verificar os artefatos existentes e reutilizar contratos, tipos, tabelas, services e regras já implementados.
> 2. Não criar uma segunda implementação da mesma responsabilidade.
> 3. Quando encontrar conflito entre a tarefa solicitada e a arquitetura existente, reportar o conflito **antes** de alterar a arquitetura.

---

## 14. Histórico de decisões

| Decisão    | Descrição resumida                                                                          | Status                                |
| ---------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| DECISÃO-01 | Usar `fetch` nativo — não adicionar `node-fetch`                                            | `[x] APROVADA pelo PO`                |
| DECISÃO-02 | HTML estático validado: ProductGroup→hasVariant, availability como URI, EAN ausente normal  | `[x] APROVADA pelo PO — ST-03 liberado` |
| DECISÃO-03 | Campos planos `ean?/sku?/mpn?` — Opção A; cada campo preserva origem, nunca SKU = EAN      | `[x] APROVADA pelo PO — Opção A`      |
| DECISÃO-04 | `availability` como union type exato, não `string` livre                                    | `[x] APROVADA pelo PO`                |
| DECISÃO-05 | `price` e `shippingPrice` separados em `ScrapedOffer`                                       | `[x] APROVADA pelo PO`                |
| DECISÃO-06 | `affiliate-agent.ts` (módulo) ✅ ≠ Affiliate Redirect HTTP ❌ — gap 🟠                       | `[x] APROVADA pelo PO`                |
| B1         | `ScrapedOffer` usa campos planos, não `identifiers[]` — Opção A escolhida pelo PO           | `[x] APROVADA pelo PO`                |
| B2         | `title?: string` adicionado a `ScrapedOffer` — necessário para `product-agent`              | `[x] INCORPORADO no contrato ST-02`   |
| B3         | ST-05 deve expandir query do JOB-001 com JOIN em `stores` para trazer `store.domain`        | `[x] INCORPORADO no escopo de ST-05`  |
| C2 / AC-07 | SKU → `product_identifiers` adiado — `product-agent` atual só aceita `ean` para matching   | `[x] ADIADO pelo PO`                  |
