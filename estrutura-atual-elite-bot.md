# Estrutura Atual — Elite Bot V1
> Gerado para análise de gaps contra a [`000-matriz-agents.md`](000-matriz-agents.md)

---

## 1. Visão geral do repositório

```text
elite-bot/
├── database/
│   └── migrations/
│       ├── 001_initial_schema.sql   ✅ schema completo
│       └── 002_security.sql         ✅ roles + RLS
├── postgrest/
│   └── postgrest.conf               ✅ configuração PostgREST
├── worker/
│   └── src/
│       ├── index.ts                 ✅ scheduler (node-cron)
│       ├── database/
│       │   └── client.ts            ✅ pool PostgreSQL
│       ├── agents/
│       │   ├── product-agent.ts     ✅ AG-001
│       │   ├── price-agent.ts       ✅ AG-002
│       │   ├── matching-agent.ts    ✅ AG-003
│       │   ├── deal-agent.ts        ✅ AG-004
│       │   ├── alert-agent.ts       ✅ AG-005
│       │   └── affiliate-agent.ts   ✅ AG-006
│       └── jobs/
│           ├── job-ingest-prices.ts    ✅ JOB-001 (stub — sem connectors)
│           ├── job-match-products.ts   ✅ JOB-002
│           ├── job-calculate-deals.ts  ✅ JOB-003
│           └── job-process-alerts.ts   ✅ JOB-004
├── Specs/
│   ├── Elite Bot-Guia do Homem Barato.md      ✅ spec fundamental
│   ├── Elite-Bot-Backend-Specification.md     ✅ spec backend
│   ├── Elite-Bot-Frontend-Specification.md    ✅ spec frontend
│   ├── Elite-Bot-API-Specification.md         ✅ spec API
│   └── Elite-Bot-Postman-Specification.md     ✅ spec Postman
├── docker-compose.yml               ✅ ambiente local completo
├── .env.example                     ✅
├── fase-3-store-connector-plan.md   ✅ plano ativo (Fase 3)
└── README.md                        ✅
```

---

## 2. Banco de dados — o que existe

### Tabelas implementadas

| Tabela               | Status | Observação                              |
| -------------------- | ------ | --------------------------------------- |
| `categories`         | ✅      | seed com Perfumes, Skincare, Roupas     |
| `brands`             | ✅      |                                         |
| `products`           | ✅      | gender, size, category, brand           |
| `product_identifiers`| ✅      | EAN, GTIN, SKU, MPN, brand_sku          |
| `stores`             | ✅      | affiliate_network, affiliate_base_url   |
| `offers`             | ✅      | price, shipping, affiliate_url, status  |
| `price_history`      | ✅      | histórico de preços por oferta          |
| `product_matches`    | ✅      | match_type, confidence, verified        |
| `deal_scores`        | ✅      | score 0–100, classification, avg, min   |
| `users`              | ✅      | sem autenticação própria ainda          |
| `alerts`             | ✅      | target_price, last_triggered_at         |
| `affiliate_clicks`   | ✅      | source, campaign, user opcional         |

### Views implementadas

| View                    | Status | Propósito                                   |
| ----------------------- | ------ | ------------------------------------------- |
| `best_product_offers`   | ✅      | melhor oferta por produto com deal score    |
| `product_price_history` | ✅      | histórico completo com loja                 |
| `product_deal_summary`  | ✅      | resumo: melhor preço, média, mínimo, score  |

### Segurança (migration 002)

| Item                     | Status |
| ------------------------ | ------ |
| Role `web_anon`          | ✅      |
| Role `authenticated`     | ✅      |
| Role `authenticator`     | ✅      |
| RLS em `users`           | ✅      |
| RLS em `alerts`          | ✅      |
| RLS em `affiliate_clicks`| ✅      |
| `auth.uid()` via JWT     | ✅      |

---

## 3. Worker — o que existe

### Agents de domínio (módulos TypeScript)

| Agent                                                         | ID     | Status | Limitações conhecidas                        |
| ------------------------------------------------------------- | ------ | ------ | -------------------------------------------- |
| [`product-agent.ts`](worker/src/agents/product-agent.ts)     | AG-001 | ✅      | Semantic match (`TODO AG-003`) não implementado |
| [`price-agent.ts`](worker/src/agents/price-agent.ts)         | AG-002 | ✅      | Lógica de update + histórico completa        |
| [`matching-agent.ts`](worker/src/agents/matching-agent.ts)   | AG-003 | ✅      | Salva e busca matches; sem lógica semântica  |
| [`deal-agent.ts`](worker/src/agents/deal-agent.ts)           | AG-004 | ✅      | Classificação e score implementados          |
| [`alert-agent.ts`](worker/src/agents/alert-agent.ts)         | AG-005 | ✅      | `TODO`: integração com notificações reais    |
| [`affiliate-agent.ts`](worker/src/agents/affiliate-agent.ts) | AG-006 | ✅      | Registra clique e retorna URL afiliada       |

### Jobs agendados (node-cron)

| Job                                                                 | ID      | Schedule       | Status | Limitação                              |
| ------------------------------------------------------------------- | ------- | -------------- | ------ | -------------------------------------- |
| [`job-ingest-prices.ts`](worker/src/jobs/job-ingest-prices.ts)     | JOB-001 | a cada 30 min  | ⚠️ stub | **Sem store connectors reais** (TODO)  |
| [`job-match-products.ts`](worker/src/jobs/job-match-products.ts)   | JOB-002 | a cada hora    | ✅      |                                        |
| [`job-calculate-deals.ts`](worker/src/jobs/job-calculate-deals.ts) | JOB-003 | a cada hora    | ✅      |                                        |
| [`job-process-alerts.ts`](worker/src/jobs/job-process-alerts.ts)   | JOB-004 | a cada 15 min  | ⚠️ stub | Notificação só vai para `console.log`  |

---

## 4. Roadmap — status das fases

| Fase | Descrição                                     | Status     | Observação                               |
| ---- | --------------------------------------------- | ---------- | ---------------------------------------- |
| 1    | Infraestrutura (PostgreSQL + PostgREST + Docker) | ✅ Concluída |                                         |
| 2    | Core Backend (Products, Stores, Offers, Price History) | ✅ Concluída | Schema + agents implementados       |
| 3    | Inteligência (Product Agent, Matching Agent, Deal Agent) | ⚠️ Parcial | Agents existem; **sem connectors reais** |
| 4    | Extension (Content Script, Background, Popup) | ❌ Não iniciada |                                     |
| 5    | Monetização (Affiliate Tracking + Redirect)   | ⚠️ Parcial | Tabela + agent existem; sem endpoint HTTP |
| 6    | Retenção (Users, Alerts, Notifications)       | ⚠️ Parcial | Tabela + agent existem; **sem notificação real** |
| 7    | Acquisition (Website / Guia do Homem Barato)  | ❌ Não iniciada |                                     |

---

## 5. Trabalho em andamento

| Plano                                                          | Status     | Próximo passo                                 |
| -------------------------------------------------------------- | ---------- | --------------------------------------------- |
| [`fase-3-store-connector-plan.md`](fase-3-store-connector-plan.md) | ⏳ Ativo | ST-01: instalar `node-fetch` + `node-html-parser` |

**Sub-tarefas da Fase 3:**

| Sub-tarefa | Descrição                              | Status      |
| ---------- | -------------------------------------- | ----------- |
| ST-01      | Instalar dependências de scraping      | `[ ] pending` |
| ST-02      | Criar interface base `StoreConnector`  | `[ ] pending` |
| ST-03      | Implementar connector Beleza na Web    | `[ ] pending` |
| ST-04      | Criar registry de connectors           | `[ ] pending` |
| ST-05      | Integrar connectors no JOB-001         | `[ ] pending` |

---

## 6. Gaps identificados (síntese)

### 🔴 Críticos (bloqueiam funcionalidade real)

| # | Gap                                  | Impacto                                             | Agente responsável |
| - | ------------------------------------ | --------------------------------------------------- | ------------------ |
| 1 | Nenhum store connector implementado  | JOB-001 não coleta preços reais; todo o pipeline fica sem dados | Backend (Fase 3)   |
| 2 | Semantic match não implementado      | Produtos sem EAN/brand exato nunca são identificados | Domain + Backend   |
| 3 | Notificações de alerta são só `console.log` | Usuários nunca recebem notificação real | Backend (Fase 6)   |

### 🟡 Importantes (reduzem o valor do produto)

| # | Gap                                         | Impacto                                          | Agente responsável     |
| - | ------------------------------------------- | ------------------------------------------------ | ---------------------- |
| 4 | Chrome Extension inexistente                | Produto principal não existe                     | Frontend (Fase 4)      |
| 5 | Sem endpoint HTTP para affiliate redirect   | Monetização não funciona de ponta a ponta        | Backend + Architect    |
| 6 | Sem autenticação/JWT para usuários reais    | RLS e alertas funcionam só em testes             | Architect + Backend    |
| 7 | Website (Guia do Homem Barato) inexistente  | Sem canal de aquisição                           | Frontend (Fase 7)      |

### 🟢 Baixa prioridade / melhorias futuras

| # | Gap                                                    | Observação                               |
| - | ------------------------------------------------------ | ---------------------------------------- |
| 8 | `JOB-001` sem retry/backoff em falhas de scraping      | Tolerância a falha simples existe        |
| 9 | `deal_scores` cresce indefinidamente (sem limpeza)     | Sem job de manutenção/purge              |
| 10| Sem mecanismo de descoberta de novos produtos (crawler)| Fora do escopo da V1 por decisão do PO   |
| 11| Postman collection referenciada no README mas ausente  | Pasta `postman/` não existe no repo      |

---

## 7. Arquivos ausentes (declarados mas não criados)

| Referência                                | Onde é citado              | Status   |
| ----------------------------------------- | -------------------------- | -------- |
| `postman/Elite-Bot.postman_collection.json` | README.md, Spec Postman  | ❌ Ausente |
| `postman/Elite-Bot.postman_environment.json`| README.md, Spec Postman  | ❌ Ausente |
| `worker/src/stores/` (qualquer arquivo)   | JOB-001 TODO, Fase 3 plan  | ❌ Ausente |

---

## 8. Mapeamento contra a Matriz de Agentes

| Artefato esperado (matriz)   | Existe?    | Localização atual                                |
| ----------------------------- | ---------- | ------------------------------------------------ |
| `vision.md`                  | ⚠️ Parcial | Incorporado na Spec Fundamental                  |
| `feature specs`              | ✅          | `Specs/` com 5 documentos                        |
| `acceptance criteria`        | ⚠️ Parcial | Dentro das specs, não separado                   |
| `roadmap`                    | ✅          | `README.md` (Roadmap V1)                         |
| `decision log`               | ❌          | Não existe arquivo dedicado                      |
| `architecture.md`            | ⚠️ Parcial | Dentro da Spec Fundamental                       |
| `architecture decision records` | ❌       | Não existe                                       |
| `dependency map`             | ❌          | Não existe                                       |
| `security architecture`      | ⚠️ Parcial | `002_security.sql` tem a implementação           |
| `business-rules.md`          | ❌          | Regras estão embutidas no código (`deal-agent.ts`)|
| `domain models`              | ⚠️ Parcial | Definidos no schema SQL                          |
| `scoring rules`              | ⚠️ Parcial | Implementadas no `deal-agent.ts`, não documentadas separadamente |
| `test cases`                 | ❌          | Nenhum teste automatizado existe                 |
| `test reports`               | ❌          | Nenhum                                           |
| `regression checklist`       | ❌          | Nenhum                                           |
