A ideia é impedir três problemas: **agentes fazendo a mesma coisa, agentes tomando decisões fora da sua autoridade e prompts gastos em tarefas que poderiam ser resolvidas por um agente já existente.**

# Matriz de Agentes — Elite Bot V1

## 1. Modelo de governança

```text
                         ┌──────────────────────┐
                         │    PRODUCT OWNER     │
                         │      / ORCHESTRATOR  │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
          │ ARCHITECT   │    │   DOMAIN    │    │     QA      │
          │             │    │   / DATA    │    │             │
          └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                           ┌────────┴────────┐
                           │ IMPLEMENTATION  │
                           └────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
               BACKEND          FRONTEND         WORKER
```

**PO/Orchestrator é quem coordena.**

Os demais agentes não devem decidir arbitrariamente o escopo do produto.

---

# 2. Matriz principal

| Agente                | Responsabilidade                 | Pode decidir? | Pode implementar? | Pode alterar arquitetura? |
| --------------------- | -------------------------------- | ------------: | ----------------: | ------------------------: |
| **PO / Orchestrator** | Produto, prioridade, coordenação |             ✅ |                ⚠️ |                  ✅ aprova |
| **Architect**         | Arquitetura técnica              |  ⚠️ recomenda |                 ❌ |                  ✅ propõe |
| **Domain/Data**       | Regras de negócio e dados        |  ⚠️ recomenda |                ⚠️ |                        ⚠️ |
| **Backend**           | API, DB, Worker                  |             ❌ |                 ✅ |                         ❌ |
| **Frontend**          | Extension + Website              |             ❌ |                 ✅ |                         ❌ |
| **QA**                | Testes e validação               |             ❌ |         ⚠️ testes |                         ❌ |

A regra é:

> **Quem implementa não é automaticamente quem decide.**

---

# 3. PO / Orchestrator

### Missão

Ser o responsável por transformar necessidade em trabalho coordenado.

### Responsabilidades

```text
VISION
FEATURES
PRIORIDADES
ESCOPO
DEPENDÊNCIAS
SEQUÊNCIA
CRITÉRIOS DE ACEITE
```

### Pode

* definir prioridade P0/P1/P2;
* aprovar/rejeitar features;
* decidir quando uma tarefa está pronta;
* escolher qual agente deve trabalhar;
* impedir trabalho desnecessário;
* resolver conflitos entre agentes;
* aprovar mudanças de escopo.

### Não deve

* escrever implementação detalhada;
* ficar codando SQL;
* corrigir CSS;
* implementar cada endpoint manualmente.

### Artefatos

```text
vision.md
feature specs
acceptance criteria
roadmap
decision log
agent task
```

---

# 4. Architect Agent

### Missão

Garantir que todas as partes do sistema continuem obedecendo à arquitetura.

### Responsável por

```text
PostgreSQL
PostgREST
Worker
Docker
segurança
integrações
dependências
interfaces
```

### Pode propor

* alteração de stack;
* nova camada;
* novo componente;
* mudança de comunicação;
* novo padrão de integração.

### Não pode

Adicionar simplesmente:

> "Vamos usar Redis."

ou:

> "Vamos colocar microservices."

sem passar pelo processo de decisão arquitetural.

### Artefatos

```text
architecture.md
architecture decision records
dependency map
security architecture
integration contracts
```

---

# 5. Domain / Data Agent

Esse agente é particularmente importante para o Elite Bot.

Ele conhece o **negócio por trás dos dados**.

### Responsável por

```text
Product
Price
Offer
Matching
Deal
Alert
Affiliate
```

### Exemplo

A pergunta:

> O que significa uma "boa oferta"?

Não é uma decisão do Backend.

É uma decisão de domínio.

O Domain Agent define:

```text
current_price
average_price
lowest_price
discount
score
classification
```

e propõe:

```text
0–69    expensive
70–84   normal/good
85–100  excellent
```

ou qualquer regra que seja validada pelo PO.

### Artefatos

```text
business-rules.md
domain models
scoring rules
matching rules
validation rules
```

---

# 6. Backend Agent

### Missão

Transformar arquitetura e regras aprovadas em backend funcional.

### Responsável por

```text
PostgreSQL
SQL
migrations
PostgREST
views
permissions
Worker
jobs
services
connectors
```

### Pode implementar

```text
products
offers
price_history
deal_scores
alerts
affiliate_clicks
```

### Não deve decidir sozinho

* novas tabelas sem necessidade;
* novas tecnologias;
* mudança de arquitetura;
* nova feature;
* alteração da regra de Deal Score.

Se encontrar necessidade:

```text
Backend
   ↓
problema
   ↓
Orchestrator
   ↓
Architect / Domain
   ↓
decisão
   ↓
Backend
```

---

# 7. Frontend Agent

Responsável por:

### Chrome Extension

```text
Manifest V3
React
TypeScript
Tailwind
Content Script
Background
Popup
Notifications
Storage
API Client
```

### Website

```text
Next.js
React
SEO
Landing pages
Product pages
Content
CTA
```

### Regra importante

O Frontend Agent **não deve criar lógica de negócio duplicada**.

Por exemplo:

❌ Extension calcula Deal Score.

Correto:

```text
PostgreSQL
   ↓
Deal Agent
   ↓
Deal Score
   ↓
PostgREST
   ↓
Extension
```

A Extension apresenta.

---

# 8. QA Agent

O QA não entra apenas no final.

Ele pode trabalhar em três momentos:

```text
SPEC
 ↓
IMPLEMENTAÇÃO
 ↓
QA
```

e também:

```text
IMPLEMENTAÇÃO
      ↓
REGRESSION
      ↓
RELEASE
```

### Responsabilidades

* validar acceptance criteria;
* testar endpoints;
* testar banco;
* testar Worker;
* testar Extension;
* testar fluxos;
* detectar regressões.

### Artefatos

```text
test cases
test reports
bug reports
regression checklist
release checklist
```

---

# 9. Matriz por domínio

Agora chegamos à parte mais importante.

| Domínio        | Dono               | Implementador | Validador |
| -------------- | ------------------ | ------------- | --------- |
| Produto        | Domain             | Backend       | QA        |
| Identificação  | Domain             | Backend       | QA        |
| Matching       | Domain             | Backend       | QA        |
| Preços         | Domain             | Backend       | QA        |
| Deal Score     | Domain             | Backend       | QA        |
| Alertas        | Domain             | Backend       | QA        |
| Afiliados      | PO + Domain        | Backend       | QA        |
| API            | Architect          | Backend       | QA        |
| Database       | Architect + Domain | Backend       | QA        |
| Extension      | PO + Frontend      | Frontend      | QA        |
| Website        | PO + Frontend      | Frontend      | QA        |
| Infraestrutura | Architect          | Backend       | QA        |
| Segurança      | Architect          | Backend       | QA        |

---

# 10. Matriz de autoridade

Vamos usar algo próximo de **RACI**, mas simplificado.

Legenda:

* **D** = Decide
* **R** = Responsible
* **C** = Consultado
* **V** = Valida

| Decisão          |    PO | Architect | Domain | Backend | Frontend |      QA |
| ---------------- | ----: | --------: | -----: | ------: | -------: | ------: |
| Nova feature     | **D** |         C |      C |       C |        C |       C |
| Prioridade       | **D** |         C |      C |       - |        - |       - |
| Regra de negócio | **D** |         C |  **R** |       C |        - |       V |
| Schema DB        |     C |     **D** |      R |   **R** |        - |       V |
| API contract     |     C |     **D** |      C |   **R** |        C |       V |
| UI/UX            | **D** |         C |      C |       - |    **R** |       V |
| Arquitetura      |     C |     **D** |      C |       C |        C |       V |
| Código Backend   |     - |         V |      C |   **R** |        - |       V |
| Código Frontend  |     - |         V |      C |       - |    **R** |       V |
| Testes           |     - |         C |      C |       C |        C | **R/D** |
| Release          | **D** |         C |      C |       R |        R |   **V** |

---

# 11. O que NÃO devemos fazer

Esse é provavelmente o ponto que mais vai economizar prompts no BOB.

### ❌ Todos os agentes analisando tudo

```text
PO
Architect
Backend
Frontend
QA
Domain
```

para cada tarefa.

Isso gera redundância.

---

### ❌ Backend reinventando arquitetura

```text
"Precisamos de Redis."
```

→ implementa.

Não.

---

### ❌ Frontend criando regra de negócio

```text
if (price < average * 0.7) {
   score = excellent
}
```

Isso cria duplicação.

---

### ❌ QA reconstruindo o projeto

QA deve testar a especificação existente, não redesenhar o produto.

---

### ❌ Agente criando nova feature "porque seria melhor"

Especialmente perigoso em projetos com IA.

Exemplo:

> "Adicionei recomendação personalizada porque melhora UX."

Não.

Isso precisa voltar para o PO.

---

# 12. Quando chamar mais de um agente?

Usaremos três níveis.

## Nível 1 — tarefa simples

Apenas um agente.

```text
"Crie migration para adicionar coluna X."

→ Backend
```

---

## Nível 2 — tarefa com dependência

Dois agentes.

```text
Nova tela de alerta

PO
 ↓
Frontend
 ↓
QA
```

---

## Nível 3 — decisão arquitetural

Orquestração.

```text
PO
 ↓
Architect
 ↓
Domain
 ↓
Backend
 ↓
Frontend
 ↓
QA
```

Somente quando realmente necessário.

---

# 13. Pipeline oficial

Eu estabeleceria este pipeline para o BOB:

```text
┌──────────────┐
│    IDEA      │
└──────┬───────┘
       ▼
┌──────────────┐
│      PO      │
└──────┬───────┘
       ▼
┌──────────────┐
│ ARCHITECTURE │
│   REVIEW     │
└──────┬───────┘
       ▼
┌──────────────┐
│ DOMAIN/SPEC  │
└──────┬───────┘
       ▼
┌──────────────┐
│ IMPLEMENT    │
└──────┬───────┘
       ▼
┌──────────────┐
│     QA       │
└──────┬───────┘
       ▼
┌──────────────┐
│   ACCEPT     │
└──────┬───────┘
       ▼
┌──────────────┐
│    MERGE     │
└──────────────┘
```

Mas **não necessariamente executamos todos os passos em toda tarefa**.

O Orchestrator decide o nível necessário.

---

# 14. Matriz de acionamento

Esta é a que eu usaria no dia a dia:

| Situação                   | Agente                |
| -------------------------- | --------------------- |
| Dúvida de produto          | PO                    |
| Nova feature               | PO → Domain/Architect |
| Regra de negócio           | Domain                |
| Banco                      | Backend               |
| API                        | Backend               |
| Arquitetura                | Architect             |
| Worker                     | Backend               |
| Agent de domínio no código | Backend + Domain      |
| Extension                  | Frontend              |
| Website                    | Frontend              |
| Bug backend                | Backend → QA          |
| Bug frontend               | Frontend → QA         |
| Regressão                  | QA                    |
| Segurança                  | Architect + Backend   |
| Mudança de stack           | Architect → PO        |
| Nova dependência           | Architect → Backend   |
| Nova loja                  | Domain → Backend      |
| Nova categoria             | PO → Domain → Backend |
| Mudança de escopo          | PO                    |

---

# 15. Controle de prompts

Aqui está nossa regra de eficiência.

### Antes de enviar um prompt para o BOB:

Perguntamos:

```text
1. Essa tarefa realmente precisa de IA?
2. Qual agente é o dono?
3. O contexto já existe?
4. O resultado esperado está definido?
5. Existe dependência bloqueando?
6. Posso resolver isso diretamente?
7. O agente precisa analisar ou executar?
```

Se a resposta for:

> "É só criar um arquivo baseado em uma especificação fechada."

→ **não precisamos de uma rodada de arquitetura.**

Se for:

> "Não sabemos como essa parte deve funcionar."

→ **não mandamos o Backend implementar ainda.**

Primeiro resolvemos a decisão.

---

# 16. Regra de "não gastar prompt"

Eu colocaria isso como princípio oficial do projeto:

> **Prompt é recurso de execução, não substituto de planejamento.**

Antes de gastar um prompt caro:

```text
               TAREFA
                  │
                  ▼
          ┌───────────────┐
          │ ESPECIFICAÇÃO │
          │     CLARA?    │
          └───────┬───────┘
                  │
          NÃO ◄───┴───► SIM
          │              │
          ▼              ▼
       decidir        executar
          │              │
          ▼              ▼
      1 prompt       1 prompt
```

O objetivo é que cada prompt do BOB produza **um artefato útil ou uma mudança verificável no projeto**.

---

# 17. Regra especial para agentes do Elite Bot

Temos dois conceitos diferentes:

```text
AGENTE DE IA
      ≠
AGENTE DO PRODUTO
```

No código teremos:

```text
product.agent.ts
price.agent.ts
matching.agent.ts
deal.agent.ts
alert.agent.ts
affiliate.agent.ts
```

Mas isso **não significa que precisamos de seis agentes de IA no BOB**.

Podemos ter:

```text
                 Backend Agent
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Product          Price         Matching
      Agent           Agent          Agent
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                    Deal
                     Agent
                       │
                       ▼
                    Alert
                     Agent
```

São **módulos de software**, coordenados pelo Worker.

Isso é muito mais econômico e simples para a V1.

---

# 18. Matriz final do Elite Bot V1

```text
┌────────────────────────────────────────────────────────────┐
│                    PO / ORCHESTRATOR                       │
│                                                            │
│ Vision • Scope • Priority • Decisions • Coordination       │
└──────────────────────────┬─────────────────────────────────┘
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  ARCHITECT   │ │ DOMAIN/DATA  │ │      QA      │
   │              │ │              │ │              │
   │ Architecture │ │ Business     │ │ Validation   │
   │ Security     │ │ Rules        │ │ Tests        │
   │ Contracts    │ │ Scoring      │ │ Regression   │
   └──────┬───────┘ └──────┬───────┘ └──────────────┘
          │                │
          └────────┬───────┘
                   ▼
          ┌─────────────────┐
          │  IMPLEMENTATION │
          └────────┬────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
   ┌─────────────┐   ┌─────────────┐
   │   BACKEND   │   │  FRONTEND   │
   │             │   │             │
   │ PostgreSQL  │   │ Extension   │
   │ PostgREST   │   │ Website     │
   │ Worker      │   │             │
   │ Jobs        │   │             │
   └─────────────┘   └─────────────┘
```

## Minha recomendação

**Essa passa a ser a matriz oficial de agentes da V1.**

E eu faria uma coisa antes de mandar qualquer novo prompt para o IBM BOB: **mapear o que ele já criou contra essa matriz**.

Assim conseguimos descobrir:

* quais agentes ele já possui;
* quais responsabilidades estão duplicadas;
* o que já foi implementado;
* o que está errado;
* o que falta;
* quais prompts devemos **não** gastar;
* e qual deve ser o **próximo prompt mínimo**.

