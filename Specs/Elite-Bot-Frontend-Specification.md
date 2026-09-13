# Elite Bot — Frontend Specification

**Versão:** 0.1
**Status:** Draft / MVP
**Projeto:** Elite Bot / Guia do Homem Barato
**Depende de:** Elite Bot-Guia do Homem Barato.md (Spec Fundamental), Elite-Bot-Backend-Specification.md

---

# 1. Visão

O frontend do Elite Bot é composto por dois produtos:

1. **Chrome Extension** — interface principal de interação com o usuário no momento da compra
2. **Website (Guia do Homem Barato)** — canal de conteúdo, SEO e aquisição

Ambos consomem a mesma API (PostgREST) e partilham o mesmo sistema de design.

---

# 2. Stack

## Chrome Extension

```text
TypeScript
React 18
Tailwind CSS
Chrome Extensions Manifest V3
Vite (build)
```

## Website

```text
Next.js 14 (App Router)
React 18
TypeScript
Tailwind CSS
```

---

# 3. Estrutura de repositório

## 3.1 Chrome Extension

```text
extension/
├── manifest.json
├── src/
│   ├── popup/
│   │   ├── Popup.tsx           ← entrada do popup
│   │   ├── screens/
│   │   │   ├── Loading.tsx
│   │   │   ├── ProductFound.tsx
│   │   │   ├── ProductNotFound.tsx
│   │   │   └── AlertCreated.tsx
│   │   └── components/
│   │       ├── DealBadge.tsx
│   │       ├── OfferCard.tsx
│   │       ├── PriceSummary.tsx
│   │       ├── AlertForm.tsx
│   │       └── CtaButton.tsx
│   ├── content-script/
│   │   ├── index.ts            ← entry point injetado na página
│   │   └── extractors/
│   │       ├── title.ts
│   │       ├── brand.ts
│   │       ├── price.ts
│   │       └── ean.ts
│   ├── background/
│   │   └── index.ts            ← service worker
│   ├── services/
│   │   ├── api.ts              ← cliente HTTP para PostgREST
│   │   ├── auth.ts
│   │   └── storage.ts
│   └── styles/
│       └── global.css
├── public/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── popup.html
└── vite.config.ts
```

## 3.2 Website

```text
website/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                ← home
│   ├── blog/
│   │   ├── page.tsx            ← listagem de artigos
│   │   └── [slug]/
│   │       └── page.tsx        ← artigo individual
│   ├── categorias/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── produtos/
│   │   └── [slug]/
│   │       └── page.tsx        ← página de produto com histórico de preços
│   └── extensao/
│       └── page.tsx            ← landing page de instalação
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── PriceHistoryChart.tsx
│   ├── DealBadge.tsx
│   ├── OfferList.tsx
│   └── ExtensionCta.tsx
├── lib/
│   ├── api.ts
│   └── types.ts
└── public/
```

---

# 4. Chrome Extension — Detalhamento

## 4.1 manifest.json (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "Elite Bot",
  "version": "1.0.0",
  "description": "Encontre as melhores ofertas para evoluir seu estilo.",
  "permissions": [
    "storage",
    "notifications",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://*/*"
  ],
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://*/*"],
      "js": ["content-script/index.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

---

## 4.2 Content Script

Executa automaticamente em páginas de e-commerce.

### Responsabilidades

- detectar se a página é um produto;
- extrair: título, marca, preço, EAN/GTIN (quando disponível);
- enviar dados para o Background via `chrome.runtime.sendMessage`;
- não modificar o DOM da página.

### Interface de mensagem

```typescript
// content-script → background
interface ProductDataMessage {
  type: 'PRODUCT_DATA';
  payload: {
    title: string;
    brand?: string;
    price?: number;
    ean?: string;
    url: string;
  };
}
```

### Extractors

Cada extractor é uma função pura que recebe `document` e retorna o valor ou `null`.

```typescript
// src/content-script/extractors/title.ts
export function extractTitle(doc: Document): string | null

// src/content-script/extractors/brand.ts
export function extractBrand(doc: Document): string | null

// src/content-script/extractors/price.ts
export function extractPrice(doc: Document): number | null

// src/content-script/extractors/ean.ts
export function extractEan(doc: Document): string | null
```

### Estratégia de extração

Prioridade de extração:

```text
1. Metadados estruturados (JSON-LD / Open Graph / meta tags)
2. Microdata (schema.org/Product)
3. Seletores CSS específicos por loja (extensível via config)
4. Heurística no título/texto da página
```

---

## 4.3 Background Service Worker

Responsável por toda comunicação com a API e persistência local.

### Responsabilidades

- receber mensagens do Content Script;
- chamar a API com os dados do produto;
- armazenar resultado em `chrome.storage.local`;
- enviar resultado ao Popup via `chrome.runtime.sendMessage`;
- registrar cliques de afiliados;
- gerenciar abertura de URLs de afiliado em nova aba;
- enviar notificações do sistema.

### Interface de mensagens

```typescript
// Tipos de mensagens suportados pelo Background
type BackgroundMessage =
  | { type: 'PRODUCT_DATA'; payload: ProductDataPayload }
  | { type: 'GET_CACHED_RESULT' }
  | { type: 'OPEN_AFFILIATE'; payload: { url: string; offer_id: string } }
  | { type: 'CREATE_ALERT'; payload: AlertPayload }

// Tipos de respostas do Background
type BackgroundResponse =
  | { type: 'DEAL_RESULT'; payload: DealResult }
  | { type: 'CACHED_RESULT'; payload: DealResult | null }
  | { type: 'ALERT_CREATED'; payload: { id: string } }
  | { type: 'ERROR'; message: string }
```

### Armazenamento local

```typescript
// chrome.storage.local
interface LocalStorage {
  last_result: DealResult | null;    // último resultado para o popup
  last_url: string | null;           // URL que gerou o último resultado
  user_id: string | null;            // ID anônimo do usuário
  auth_token: string | null;         // JWT
}
```

---

## 4.4 Popup

Interface visual principal. Largura fixa de **360px**.

### Estados do Popup

O Popup tem 4 estados exclusivos:

```text
LOADING
  └── Spinner + "Analisando produto..."

PRODUCT_FOUND
  └── Tela principal com deal, ofertas e CTA

PRODUCT_NOT_FOUND
  └── Mensagem de produto não identificado

ALERT_CREATED
  └── Confirmação de alerta criado
```

---

### Tela: LOADING

```text
┌──────────────────────────────────┐
│  ● Elite Bot                     │
│                                  │
│         ◌ Analisando...          │
│                                  │
└──────────────────────────────────┘
```

---

### Tela: PRODUCT_FOUND

```text
┌──────────────────────────────────┐
│  ● Elite Bot                     │
│                                  │
│  Dior Sauvage EDT 100ml          │
│  Dior                            │
│                                  │
│  ┌────────────────────────────┐  │
│  │  🟢 EXCELENTE OFERTA  92  │  │
│  └────────────────────────────┘  │
│                                  │
│  Preço atual nesta loja          │
│  R$ 449,90                       │
│                                  │
│  Melhor oferta encontrada        │
│  R$ 379,90   Loja Exemplo        │
│                                  │
│  Você economiza                  │
│  R$ 70,00                        │
│                                  │
│  ┌────────────────────────────┐  │
│  │     VER MELHOR OFERTA      │  │
│  └────────────────────────────┘  │
│                                  │
│  Histórico                       │
│  Média: R$ 420,00                │
│  Menor: R$ 359,90                │
│                                  │
│  ── Outras ofertas ─────────     │
│  Loja B          R$ 389,90  →   │
│  Loja C          R$ 399,00  →   │
│                                  │
│  ─────────────────────────────   │
│  🔔 Criar alerta de preço        │
│  [ R$ ________ ]  [Salvar]      │
└──────────────────────────────────┘
```

---

### Tela: PRODUCT_NOT_FOUND

```text
┌──────────────────────────────────┐
│  ● Elite Bot                     │
│                                  │
│  Produto não encontrado.         │
│                                  │
│  Abra a página de um produto     │
│  para comparar preços.           │
│                                  │
│  ┌────────────────────────────┐  │
│  │   VER GUIA DO HOMEM BARATO │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

### Tela: ALERT_CREATED

```text
┌──────────────────────────────────┐
│  ● Elite Bot                     │
│                                  │
│  ✓ Alerta criado!                │
│                                  │
│  Vamos te avisar quando          │
│  Dior Sauvage EDT 100ml          │
│  chegar a R$ 350,00.             │
│                                  │
│  ┌────────────────────────────┐  │
│  │        ENTENDIDO            │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

## 4.5 Componentes do Popup

### `DealBadge`

Exibe a classificação do deal com cor correspondente.

```typescript
interface DealBadgeProps {
  classification: 'excellent' | 'good' | 'normal' | 'expensive';
  score: number;
}
```

| classification | Cor | Label |
|---|---|---|
| `excellent` | Verde `#16a34a` | EXCELENTE OFERTA |
| `good` | Azul `#2563eb` | BOA OFERTA |
| `normal` | Cinza `#6b7280` | PREÇO NORMAL |
| `expensive` | Vermelho `#dc2626` | PREÇO ALTO |

---

### `PriceSummary`

```typescript
interface PriceSummaryProps {
  currentPrice: number;       // preço na página atual
  bestPrice: number;          // melhor preço encontrado
  bestStoreName: string;
  saving: number;             // economia em R$
  averagePrice: number;
  lowestPrice: number;
  currency?: string;          // default 'BRL'
}
```

---

### `OfferCard`

```typescript
interface OfferCardProps {
  storeName: string;
  price: number;
  shippingPrice: number;
  totalPrice: number;
  affiliateUrl: string;
  currency?: string;
}
```

---

### `AlertForm`

```typescript
interface AlertFormProps {
  productName: string;
  onSubmit: (targetPrice: number) => void;
  loading?: boolean;
}
```

Validações:
- preço deve ser positivo;
- preço deve ser menor que o melhor preço atual;
- campo obrigatório antes de enviar.

---

### `CtaButton`

```typescript
interface CtaButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}
```

---

# 5. Website — Detalhamento

## 5.1 Páginas

### Home (`/`)

Objetivo: apresentar o produto, converter em instalação da extensão.

Seções:

```text
1. Hero
   └── Proposta de valor + CTA de instalação

2. Como funciona
   └── 3 passos: Identifica → Compara → Avalia

3. Categorias em destaque
   └── Perfumes / Skincare / Roupas

4. Últimas ofertas
   └── Grid de ProductCard

5. CTA final
   └── "Instale o Elite Bot no Chrome"
```

---

### Blog (`/blog`)

Listagem de artigos em grid.

```typescript
interface ArticleCard {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
}
```

---

### Artigo (`/blog/[slug]`)

Página de artigo individual com:
- título, autor, data;
- conteúdo rich text;
- produtos relacionados ao final.

---

### Categoria (`/categorias/[slug]`)

Lista de produtos de uma categoria com filtros básicos:
- ordenação por menor preço / melhor deal;
- filtro por marca.

---

### Produto (`/produtos/[slug]`)

Página de produto com:

```text
┌─────────────────────────────────────────┐
│  [imagem]   Nome do produto             │
│             Marca                       │
│                                         │
│             🟢 EXCELENTE OFERTA  92     │
│                                         │
│             Melhor preço: R$ 379,90     │
│             Média histórica: R$ 420,00  │
│             Menor já visto: R$ 359,90   │
│                                         │
│  ── Ofertas disponíveis ───────────     │
│  [OfferList]                            │
│                                         │
│  ── Histórico de preços ───────────     │
│  [PriceHistoryChart]                    │
└─────────────────────────────────────────┘
```

---

### Landing da Extensão (`/extensao`)

Página dedicada para conversão de instalação:

```text
1. Hero: "Nunca mais pague caro por perfumes e skincare"
2. Screenshots da extensão em uso
3. Como instalar (3 passos)
4. CTA: "Adicionar ao Chrome — É grátis"
5. FAQ
```

---

## 5.2 Componentes do Website

### `ProductCard`

```typescript
interface ProductCardProps {
  name: string;
  slug: string;
  brand: string;
  imageUrl?: string;
  bestPrice: number;
  classification: DealClassification;
  score: number;
  currency?: string;
}
```

---

### `OfferList`

```typescript
interface OfferListProps {
  offers: Offer[];
  onOfferClick: (offer: Offer) => void;
}
```

Cada linha exibe: loja, preço, frete, total, botão "Ver oferta".

---

### `PriceHistoryChart`

```typescript
interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
  currency?: string;
}

interface PriceHistoryPoint {
  capturedAt: string;   // ISO date
  price: number;
  storeName: string;
}
```

Gráfico de linha simples mostrando evolução do preço ao longo do tempo.

---

### `DealBadge`

Componente compartilhado — mesma lógica e aparência da versão da Extension.

---

### `ExtensionCta`

Banner/botão que leva para a Chrome Web Store.

```typescript
interface ExtensionCtaProps {
  variant?: 'banner' | 'button' | 'hero';
}
```

---

# 6. Tipos compartilhados

Definidos em `lib/types.ts` (website) e `src/types.ts` (extension), mantidos em sincronia.

```typescript
type DealClassification = 'excellent' | 'good' | 'normal' | 'expensive';

interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  slug: string;
}

interface Offer {
  offerId: string;
  storeName: string;
  price: number;
  shippingPrice: number;
  totalPrice: number;
  currency: string;
  affiliateUrl?: string;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
}

interface Deal {
  score: number;
  classification: DealClassification;
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  saving: number;
}

interface DealResult {
  product: Product;
  deal: Deal;
  offers: Offer[];
}

interface AlertPayload {
  productId: string;
  targetPrice: number;
  currency?: string;
}

interface PriceHistoryPoint {
  capturedAt: string;
  price: number;
  shippingPrice: number;
  totalPrice: number;
  storeName: string;
}
```

---

# 7. Integração com a API

## 7.1 Identificação de produto

A Extension envia os dados extraídos da página para o endpoint de identificação.

```text
POST /rpc/identify_product
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "title": "Dior Sauvage Eau de Toilette 100ml",
  "brand": "Dior",
  "price": 449.90,
  "ean": "3348901250146",
  "url": "https://loja.com/produto"
}
```

## 7.2 Busca de deals por produto

```text
GET /product_deal_summary?product_id=eq.<uuid>
Authorization: Bearer <jwt>
```

## 7.3 Busca de melhores ofertas

```text
GET /best_product_offers?product_id=eq.<uuid>&order=total_price.asc
Authorization: Bearer <jwt>
```

## 7.4 Histórico de preços

```text
GET /product_price_history?product_id=eq.<uuid>&order=captured_at.desc&limit=90
Authorization: Bearer <jwt>
```

## 7.5 Criar alerta

```text
POST /alerts
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "product_id": "<uuid>",
  "target_price": 350.00,
  "currency": "BRL"
}
```

## 7.6 Registrar clique de afiliado

```text
POST /affiliate_clicks
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "offer_id": "<uuid>",
  "source": "extension",
  "campaign": null
}
```

---

# 8. Fluxos de UI

## 8.1 Fluxo principal — Extension

```text
Usuário abre página de produto
         ↓
Content Script extrai dados
         ↓
Envia para Background
         ↓
Background chama API
         ↓
Popup abre em estado LOADING
         ↓
Background recebe resposta
         ↓
      ┌──┴──┐
   sucesso  erro
      ↓       ↓
PRODUCT_  PRODUCT_
 FOUND   NOT_FOUND
```

## 8.2 Fluxo de alerta — Extension

```text
Usuário preenche AlertForm
         ↓
Validação client-side
         ↓
Background chama POST /alerts
         ↓
Popup exibe ALERT_CREATED
```

## 8.3 Fluxo de compra — Extension

```text
Usuário clica "VER MELHOR OFERTA"
         ↓
Background chama POST /affiliate_clicks
         ↓
Background abre affiliate_url em nova aba
```

---

# 9. Sistema de design

## 9.1 Paleta de cores

| Token | Hex | Uso |
|---|---|---|
| `brand-primary` | `#0f172a` | Fundo header, textos principais |
| `brand-accent` | `#2563eb` | CTA primário, links |
| `deal-excellent` | `#16a34a` | Badge excelente oferta |
| `deal-good` | `#2563eb` | Badge boa oferta |
| `deal-normal` | `#6b7280` | Badge preço normal |
| `deal-expensive` | `#dc2626` | Badge preço alto |
| `surface` | `#f8fafc` | Fundo de cards |
| `border` | `#e2e8f0` | Bordas |
| `text-primary` | `#0f172a` | Texto principal |
| `text-muted` | `#64748b` | Texto secundário |

## 9.2 Tipografia

```text
Família principal: Inter (sans-serif)
Família monospace: JetBrains Mono (preços, scores)

Escala:
  text-xs   → 12px   labels, meta
  text-sm   → 14px   corpo secundário
  text-base → 16px   corpo principal
  text-lg   → 18px   subtítulos
  text-xl   → 20px   títulos de cards
  text-2xl  → 24px   títulos de seção
  text-4xl  → 36px   hero
```

## 9.3 Dimensões do Popup

```text
width:  360px  (fixo)
min-height: 300px
max-height: 600px (scroll interno)
border-radius: 12px
padding: 16px
```

---

# 10. Segurança

- A Extension **nunca** armazena credenciais administrativas
- O JWT do usuário é armazenado apenas em `chrome.storage.local`
- Todas as chamadas à API incluem `Authorization: Bearer <jwt>`
- A Extension **não** executa código arbitrário recebido da API
- O Content Script **não** modifica o DOM das páginas visitadas
- Links de afiliado são sempre abertos via `chrome.tabs.create` pelo Background — nunca via `window.open` no Content Script

---

# 11. Acessibilidade

- Todos os botões interativos têm `aria-label` descritivo
- O Popup é navegável por teclado (Tab, Enter, Esc)
- Contraste mínimo de 4.5:1 para texto sobre fundo (WCAG AA)
- O DealBadge não usa apenas cor para transmitir informação — inclui texto
- Imagens de produto têm `alt` descritivo

---

# 12. MVP Scope

## Entram na V1

- [ ] Content Script com extração de título, marca, preço e EAN
- [ ] Background Service Worker com chamadas à API
- [ ] Popup com estados: Loading, ProductFound, ProductNotFound, AlertCreated
- [ ] Componentes: DealBadge, PriceSummary, OfferCard, AlertForm, CtaButton
- [ ] Registro de clique de afiliado ao abrir oferta
- [ ] Criação de alerta de preço
- [ ] Website: Home, Produto, Extensão (landing)
- [ ] Website: PriceHistoryChart
- [ ] Website: OfferList com links afiliados

## Não entram na V1

- [ ] Login/cadastro de usuário com e-mail
- [ ] Histórico de produtos visualizados pelo usuário
- [ ] Notificações push (browser)
- [ ] Página de gerenciamento de alertas
- [ ] Comparativo lado a lado de produtos
- [ ] Modo escuro
- [ ] Blog com CMS
- [ ] Internacionalização

---

# 13. Critério de pronto do Frontend MVP

O frontend estará pronto quando:

```text
1. Content Script extrai dados corretamente de pelo menos
   uma loja de perfumes (ex: Sephora, Beleza na Web)

2. Popup exibe ProductFound com dados reais da API

3. Usuário consegue clicar em "VER MELHOR OFERTA"
   e ser redirecionado via URL afiliada

4. Usuário consegue criar um alerta de preço

5. Website exibe página de produto com histórico de preços

6. Website exibe landing page da extensão com CTA funcional
```

---

# 14. Traceability

| Componente / Tela | Origem na Spec Fundamental |
|---|---|
| Content Script | §5.1, §7.1 Content Script |
| Background Service Worker | §7.1 Background Service |
| Popup — ProductFound | §7.1 Popup (wireframe) |
| DealBadge | §13 AG-004 Deal Agent |
| AlertForm | §19 Fluxo de alerta |
| CtaButton affiliate | §18 Fluxo de compra |
| Website — Produto | §5.2, §8 Stack Website |
| PriceHistoryChart | F-004 Price History |
| Sistema de design | §7 Stack Frontend |
| Tipos compartilhados | §23 Contrato de resposta principal |
