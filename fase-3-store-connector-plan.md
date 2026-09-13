# Fase 3 — Store Connector: Beleza na Web

## Visão geral

Implementar o primeiro store connector real para a Beleza na Web (`belezanaweb.com.br`),
capaz de raspar a página de produto individual e retornar dados de preço e disponibilidade.

O connector alimenta o `JOB-001 ingest-prices`, que hoje tem dois TODOs apontando
exatamente para `worker/src/stores/`. Ao terminar esta fase, o job funcionará de ponta
a ponta com dados reais de uma loja.

**Escopo:** raspar apenas páginas de produto individualmente a partir de URL conhecida.
Descoberta de novos produtos (listagens/categorias) fica fora da V1.

---

## Sub-tarefas

---

### ST-01 — Instalar dependências de scraping

**Status:** `[ ] pending`

**Intent**
Adicionar as bibliotecas necessárias para fazer requisições HTTP e parsear HTML no Worker,
sem introduzir um browser headless (desnecessário para estrutura de página estática).

**Expected Outcomes**
- `package.json` atualizado com as novas dependências
- `npm install` executado sem erros
- Typecheck continua passando

**Todo List**
1. Adicionar ao `worker/package.json`:
   - `node-fetch` — requisições HTTP com suporte a headers customizados
   - `node-html-parser` — parser de HTML leve, sem dependência de browser
2. Adicionar types: `@types/node-fetch` se necessário (node-fetch v3 já inclui)
3. Rodar `npm install` dentro de `worker/`
4. Rodar `npx tsc --noEmit` e confirmar zero erros

**Relevant Context**
- `worker/package.json`
- `worker/tsconfig.json`

---

### ST-02 — Criar a interface base de connector

**Status:** `[ ] pending`

**Intent**
Definir o contrato TypeScript que todo store connector deve implementar, para que o job
possa chamar qualquer loja de forma uniforme sem saber dos detalhes internos de cada uma.

**Expected Outcomes**
- Arquivo `worker/src/stores/types.ts` criado com interface `StoreConnector`
- Interface exporta um método `scrapeOffer(url: string): Promise<ScrapedOffer | null>`
- `ScrapedOffer` contém os campos que `PriceData` (price-agent.ts) espera, mais `title` e `ean`

**Todo List**
1. Criar `worker/src/stores/types.ts` com:
   - Interface `ScrapedOffer { price, originalPrice?, shippingPrice?, availability?, title?, ean? }`
   - Interface `StoreConnector { domain: string; scrapeOffer(url): Promise<ScrapedOffer | null> }`
2. Typecheck: zero erros

**Relevant Context**
- `worker/src/agents/price-agent.ts` — interface `PriceData` (linhas 14-20)

---

### ST-03 — Implementar o connector da Beleza na Web

**Status:** `[ ] pending`

**Intent**
Implementar `BelezaNaWebConnector` que, dada a URL de um produto, faz uma requisição HTTP,
parseia o HTML e extrai: preço, preço original, disponibilidade, título e EAN quando disponível.

**Expected Outcomes**
- Arquivo `worker/src/stores/beleza-na-web.ts` criado e tipado
- Dado uma URL real da Beleza na Web, o connector retorna um `ScrapedOffer` preenchido
- Retorna `null` se a página não for de produto ou se o parsing falhar
- Tratamento de erro não deixa o job crashar (try/catch interno)

**Todo List**
1. Criar `worker/src/stores/beleza-na-web.ts` implementando `StoreConnector`
2. Estratégia de extração de preço (em ordem de prioridade):
   - JSON-LD (`<script type="application/ld+json">` com `@type: Product`)
   - Meta tags Open Graph / schema.org
   - Seletores CSS identificados manualmente na página
3. Estratégia de extração de EAN:
   - JSON-LD campo `gtin13` / `sku`
   - Meta tag `product:ean` se disponível
4. Normalização de preço: remover `R$`, `.` de milhar, trocar `,` por `.`, parsear float
5. Header `User-Agent` realista para evitar bloqueio simples
6. Timeout de 10s na requisição
7. Typecheck: zero erros

**Relevant Context**
- `worker/src/stores/types.ts` — interface `StoreConnector` (ST-02)
- `worker/src/agents/price-agent.ts` — como os dados são consumidos

---

### ST-04 — Criar registry de connectors

**Status:** `[ ] pending`

**Intent**
Criar um mapa `domain → connector` para que o job consiga resolver o connector correto
dado o domínio da loja sem lógica condicional espalhada.

**Expected Outcomes**
- Arquivo `worker/src/stores/registry.ts` com função `getConnector(domain): StoreConnector | null`
- `BelezaNaWebConnector` registrado para `belezanaweb.com.br`
- Fácil de adicionar novas lojas no futuro (uma linha)

**Todo List**
1. Criar `worker/src/stores/registry.ts`
2. Instanciar `BelezaNaWebConnector` e adicionar ao mapa keyed por domínio
3. Exportar `getConnector(domain: string): StoreConnector | null`
4. Typecheck: zero erros

**Relevant Context**
- `worker/src/stores/beleza-na-web.ts` — connector (ST-03)
- `worker/src/stores/types.ts` — interface (ST-02)

---

### ST-05 — Integrar connectors no job-ingest-prices

**Status:** `[ ] pending`

**Intent**
Substituir os dois TODOs em `job-ingest-prices.ts` pela chamada real ao connector,
usando o domínio da loja para resolver qual connector usar e raspando o preço atual.

**Expected Outcomes**
- `JOB-001` chama `getConnector(store.domain)` para cada oferta ativa
- Se connector existe: raspa a URL, chama `updateOfferPrice` com os dados reais
- Se connector não existe: loga skip e continua (não falha o job)
- Os contadores `offersUpdated` / `offersCreated` refletem o resultado real
- Typecheck: zero erros

**Todo List**
1. Em `job-ingest-prices.ts`, alterar o loop de ofertas:
   - Query deve incluir `store.domain` e `o.product_url` além do `offer.id`
   - Chamar `getConnector(store.domain)`
   - Se `null`: logar `skip` e `continue`
   - Se existe: chamar `connector.scrapeOffer(offer.product_url)`
   - Se `ScrapedOffer` retornado: chamar `updateOfferPrice({ offerId, ...scraped })`
2. Remover os dois comentários TODO
3. Rodar `npx tsc --noEmit` e confirmar zero erros

**Relevant Context**
- `worker/src/jobs/job-ingest-prices.ts` — TODOs nas linhas 9 e 55
- `worker/src/stores/registry.ts` — `getConnector` (ST-04)
- `worker/src/agents/price-agent.ts` — `updateOfferPrice` e `PriceData`

---

## Arquivos que serão criados/modificados

```
worker/
├── package.json                         MODIFICADO — novas deps
├── src/
│   ├── stores/
│   │   ├── types.ts                     CRIADO
│   │   ├── beleza-na-web.ts             CRIADO
│   │   └── registry.ts                  CRIADO
│   └── jobs/
│       └── job-ingest-prices.ts         MODIFICADO — integração real
```

## Dependência entre sub-tarefas

ST-01 → ST-02 → ST-03 → ST-04 → ST-05
