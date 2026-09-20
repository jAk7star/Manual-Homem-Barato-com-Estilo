# 🎨 Elite Bot — Especificação de UX, Fotografia Editorial & Design System para Google Stitch

> **Visão de Produto:** O **Elite Bot** é um assistente de inteligência de compras premium focado em moda masculina, calçados e perfumaria (**Aramis**, **C&A**, **Hering** e **oBoticário**). Em vez de utilizar um popup tradicional ou estética genérica de software ("Frankenstein dark-tech"), o produto utiliza **fotografia editorial de estilo de vida masculino** e possui **duas superfícies responsivas do mesmo Design System**.

---

## 🏛️ Arquitetura de UX: Uma Identidade, Duas Superfícies

```text
                    ELITE BOT DESIGN SYSTEM
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
    COMPACT EXPERIENCE                  EXPANDED EXPERIENCE
    (Chrome Side Panel)                    (Full Window)
             │                                   │
    Contexto rápido & decisivo           Análise detalhada & rica
      durante a navegação                 histórico & comparativos
```

### 1. Compact Experience (Chrome Side Panel)
* **Acionamento:** Abre **diretamente** ao clicar no ícone da extensão no Chrome (`chrome.sidePanel` com `openPanelOnActionClick: true`).
* **Propósito:** Experiência contextual de alta densidade sem ocultar a loja que o usuário está navegando.
* **Foco:** Identificação instantânea do produto, preço atual, Deal Score, ofertas rápidas, alerta de preço e gatilho para análise profunda.
* **Largura Responsiva:** ~360px – 420px (painel lateral fixo no navegador).

### 2. Expanded Experience (Full Window / Aba Completa)
* **Acionamento:** Abre em uma nova aba do navegador (`chrome.tabs.create`) quando o usuário clica em **"Ver análise completa →"** no Side Panel.
* **Propósito:** Experiência rica em tela cheia para decisões de compra complexas e análises profundas.
* **Foco:** Banners fotográficos editoriais de alta definição, pirâmide olfativa interativa, gráfico de histórico de preços completo (30d, 90d, 1 ano, total), matriz comparativa de lojas com frete/cashback/cupons e personalização de alertas.

---

## 📸 Fotografia Editorial Masculina & Direção Visuais (Anti-Frankenstein)

Para eliminar o visual poluído ("Frankenstein") gerado por modelos padrão do Stitch, a identidade visual é guiada pelas marcas de referência:

1. **Fotografia Hero Editorial:**
   - Utilização de **retratos fotográficos masculinos de estilo de vida** no Header e nos Banners Hero.
   - Aplicação de gradiente de superposição escuro (*dark vignette scrim overlay*) sobre as imagens para garantir legibilidade impecável dos textos e dados.
   - Assets oficiais gerados para o projeto:
     - **Moda Masculina / Alfaiataria:** `assets/editorial_fashion_male.jpg` (Modelo masculino em traje alfaiataria premium com iluminação sofisticada).
     - **Perfumaria Masculina:** `assets/editorial_fragrance_male.jpg` (Modelo masculino e frasco de perfume com luzes de âmbar e cobre).

2. **Tipografia & Respiro Editorial (Aramis / Hering / C&A):**
   - Títulos em **caixa alta refinada (uppercase)** com espaçamento entre letras (*letter-spacing / tracking-widest*).
   - Containeres limpos, sem bordas neons ou sombras 3D exageradas.
   - Respiro matemático de 8px entre os elementos para evitar a poluição de informação.

3. **Minimalismo de Textos & Ícones (Baixa Carga Cognitiva / Zero Distração):**
   - **Ícones Estritamente Funcionais:** Eliminação de ícones decorativos, emojis ou ícones duplicados antes de títulos. Ícones apenas para ações essenciais (ex: seta de link, sino de alerta, fechar/buscar).
   - **Micro-copy Direta & Dados Números:** Substituição de blocos descritivos por números limpos e diretos (ex: `R$ 149,90`, `82 BOM`, `↓12% em 30d`).
   - **Hierarquia Visual por Tipografia e Cor:** Separação de Seções via contraste de fontes (peso/tamanho/caixa-alta) e respiro, sem poluir com divisores pesados ou ícones decorativos.

---

## 📐 Matriz de Densidade de Componentes

Um único Design System alimenta ambas as superfícies através de adaptação responsiva de layout e densidade (`mode="compact"` vs `mode="expanded"`):

| Componente | Compact Experience (Side Panel) | Expanded Experience (Full Window) |
|---|---|---|
| **Header / Hero Banner** | Banner fotográfico compacto com modelo masculino + logo "ELITE BOT". | Hero Banner fotográfico amplo com modelo masculino, categoria e busca. |
| **Product Header & Imagem** | Título compacto, badge de marca/categoria, imagem miniatura (80x80px). | Header amplo, galeria com imagens em alta definição e especificações completas. |
| **Deal Score** | Badge numérico compacto (ex: `82 BOM`) com cor situacional. | Card de Score expandido com velocímetro/gauge e explicação dos fatores. |
| **Preço & Ofertas** | Preço atual destacado + strikethrough original + top 3 ofertas da concorrência. | Matriz comparativa de todas as lojas, incluindo frete, cashback e cupons validados. |
| **Acordes Olfativos (Perfumes)** | Top 3 barras de acordes principais (ex: *Amadeirado*, *Âmbar*, *Fresco*). | Pirâmide Olfativa completa (Notas de Topo, Corpo e Fundo) + radar de notas. |
| **Tamanhos (Calçados/Vestuário)** | Pílulas de disponibilidade rápida (ex: `[39] [40] [41]`). | Grid interativo de tamanhos com alerta de estoque por numeração esgotada. |
| **Histórico de Preços** | Sparkline/micro-tendência de 30 dias (ex: `Menor preço em 30d ↓12%`). | Gráfico SVG/Canvas interativo com seletores de período (30d, 90d, 1y, total) e anotações. |
| **Ações Principais (CTA)** | Botão "Ver Oferta" + Link discreto "Ver análise completa →". | CTAs diretos por loja, exportação de relatório, e configuração avançada de alertas. |

---

## 🎨 Diretrizes de Design System: "Menswear & Fragrance Editorial"

### 1. Três Temas Oficiais do Sistema (`Dark`, `Light Sand`, `Obsidian`)

O **Elite Bot Design System** possui 3 paletas de cores nativas com tipografias e scrollbars especificamente pareadas para cada contexto:

| Tema | Fundo Base | Superfície Card | Acento Primário | Tipografia Pareada | Ícone Seletor |
|---|---|---|---|---|---|
| **Dark Charcoal (Padrão)** | `#0e0f12` | `#14151a` | Terracota `#C85A32` | `Inter` + `Space Grotesk` | 🌙 `Moon` |
| **Light Sand (Aramis & oBoticário)** | `#F7F5F0` | `#FFFFFF` | Cobre `#B84A28` | `Manrope` + `Plus Jakarta Sans` | ☀️ `Sun` |
| **Obsidian (Telemetria)** | `#0a0b0e` | `#121318` | Esmeralda `#10B981` | `Space Grotesk` + `font-mono` | 💎 `Gem` |

---

### 2. Botões Minimalistas de Ícones para Seleção de Temas
Em vez de botões com rótulos de texto extensos, os seletores de tema utilizam **botões minimalistas de ícones SVG**:
- 🌙 **Dark Charcoal:** Alterna para a paleta carvão fosco matte com tipografia `Inter`.
- ☀️ **Light Sand:** Alterna para a paleta clara sand com tipografia `Manrope` e texto de alto contraste `#1B1B18`.
- 💎 **Obsidian:** Alterna para a paleta obsidian com foco em telemetria e acento esmeralda.

---

### 3. Scrollbar Minimalista por Tema
Para evitar o scrollbar nativo grosso do navegador (que polui a interface no Side Panel e Widescreen):
- **Trilho:** Transparente (`background: transparent`).
- **Thumb:** Fino (5px) com bordas arredondadas e cor nativa de cada acento (`rgba(200,90,50,0.3)` no Dark, `rgba(184,74,40,0.3)` no Light Sand e `rgba(16,185,129,0.3)` no Obsidian).

---

### 4. Adaptação Fluida de Dimensões (Side Panel vs Widescreen)
- **Fluidez Nativa:** Não utilizar limites estáticos como `w-[390px]` no `<body>` ou em `<html>`.
- **Side Panel (~390px):** Empilha os elementos verticalmente em 1 coluna com espaçamento de 8px e scrollbar fino.
- **Widescreen (Full Window 1200px+):** Expande autonomamente a grade para 12 colunas (`grid-cols-12`) aproveitando a largura da aba do navegador.

---

## 🤖 Briefing & Prompts Oficiais para Google Stitch

### Briefing Global para o Google Stitch
> **Design the Elite Bot as a clean, premium men's shopping intelligence product inspired by Aramis, C&A, Hering, and O Boticário with two responsive surfaces:**
>
> **1. Compact Experience — Chrome Side Panel:** A narrow, contextual interface used while browsing a product page. Features a hero banner with photography of a stylish male figure, product price, Deal Score, best offer summary, fragrance accords or size pills, and quick actions.
>
> **2. Expanded Experience — Full Window:** A larger web interface for deeper product analysis, full-width editorial male lifestyle imagery, multiple offer comparison matrix, interactive price history chart, fragrance pyramid, and alerts.
>
> **STRICT VISUAL DIRECTION:** Use clean editorial fashion photography of male figures in the header/hero cards with dark vignette overlays.
> **STRICTLY FORBIDDEN:** Generic sci-fi HUD elements, neon glows, crypto tech aesthetic, crowded Frankenstein dashboard layouts, or 3D rounded glossy buttons. Keep containers flat matte charcoal with generous whitespace.

---

### Prompt 1: Expanded Experience (Full Window)
*Desenhe primeiro a versão expandida no Stitch para estabelecer todos os componentes visuais completos:*

```text
Design the Expanded Experience (Full Window Web Interface) for "Elite Bot", a premium shopping assistant for men's fashion, shoes, and fragrances inspired by Aramis, C&A, Hering, and O Boticário.

DESIGN AESTHETICS & PHOTOGRAPHY:
- Editorial Male Lifestyle Imagery: Include high-fashion editorial male portrait banners (handsome modern man in a tailored blazer or holding a luxury cologne bottle) with a dark gradient vignette scrim overlay for crisp text readability.
- Style: Clean Men's Fashion Editorial & Olfactory Intelligence. Clean matte dark charcoal background (#121316) with subtle terracotta copper accents (#C85A32) and warm ambers (#D97706).
- Typography: Clean editorial sans-serif (Inter / Plus Jakarta Sans), uppercase section titles ("ALFAIATARIA", "PERFUMARIA MASCULINA", "PIRÂMIDE OLFATIVA", "HISTÓRICO DE PREÇOS").
- STRICTLY NO: Neon glows, sci-fi HUD lines, rounded glossy 3D buttons, or overcrowded SaaS grids.

KEY COMPONENTS TO SHOW:
1. EDITORIAL HEADER & HERO BANNER:
   - "ELITE BOT" logo + Niche Badge ("PERFUMARIA & FASHION MASCULINA") + User profile & search bar.
   - Background photography banner featuring a handsome male model in editorial lighting with a subtle dark vignette overlay.
2. PRODUCT HERO SECTION:
   - Product title: "Malbec Desodorante Colônia 100ml".
   - Brand & Store badge: "O Boticário".
   - Price section: Current Price (R$ 149.90) in bold terracotta, Original Price (R$ 189.90) strikethrough.
   - Deal Score gauge card: Large score display (82/100 - "BOM PREÇO") with metric breakdown pills.
3. FRAGRANCE OLFACTIVE PYRAMID CARD (Fragrantica inspired):
   - Top Notes: Bergamota, Limão, Folhas Verdes.
   - Heart Notes: Patchouli, Cedro, Pimenta Preta.
   - Base Notes: Âmbar, Musgo de Carvalho, Couro.
   - Main Accord Bars: Horizontal amber/terracotta/slate bars showing dominant scents.
4. SIZES SELECTOR (For shoes/clothing case):
   - Circular size pills [38] [39] [40] [41] [42] [43] [44] with stock status.
5. INTERACTIVE PRICE HISTORY CHART:
   - Timeframe toggles [30d] [90d] [1 ano] [Tudo].
   - Smooth line chart with lowest price indicator dot and target alert threshold line.
6. STORES COMPARISON MATRIX:
   - Multi-column table: Store Name, Price, Shipping Cost, Cashback %, Coupon Code ("SPECIAL20"), and "Ir para Loja" CTA.

OUTPUT: A high-end menswear and fragrance dashboard featuring authentic male photography, dark-mode luxury, and editorial elegance.
```

---

### Prompt 2: Compact Experience (Chrome Side Panel)
*Utilize este prompt para adaptar a densidade dos componentes para a experiência no Side Panel:*

```text
Design the Compact Experience (Chrome Side Panel, width: 390px) for "Elite Bot", sharing the exact same visual identity and male editorial photography as the Full Window experience.

DESIGN AESTHETICS:
- Identical dark charcoal matte palette (#121316), terracotta accents (#C85A32), editorial male photography header overlay, and clean typography.
- STRICTLY NO sci-fi neon elements or cluttered Frankenstein layouts. Clean matte containers with generous whitespace.

KEY COMPONENTS TO DISPLAY:
1. EDITORIAL HEADER: Compact banner with high-fashion male portrait photography + dark vignette overlay + "ELITE BOT" logo.
2. COMPACT PRODUCT HERO:
   - Product title ("Malbec Desodorante Colônia 100ml").
   - Current Price (R$ 149.90) vs Original Price (R$ 189.90).
   - Deal Score Pill: Compact badge ("82 BOM").
3. QUICK NICHE INSIGHT:
   - Fragrance: Top 3 Accord Bars (Amadeirado, Âmbar, Fresco).
   - Apparel/Shoes: Quick size availability pills ([39] [40] [41]).
4. BEST OFFERS SUMMARY (Top 3 stores in compact card rows):
   - Store 1: O Boticário — R$ 149,90 [Ver Oferta]
   - Store 2: Beleza na Web — R$ 169,90 [Ver Oferta]
   - Store 3: Mercado Livre — R$ 175,00 [Ver Oferta]
5. PRICE TREND & ALERT BANNER:
   - Micro trend badge: "Menor preço em 30d (↓12%)".
   - Quick price alert CTA button.
6. FOOTER ACTION:
   - Prominent textual link with arrow: "Ver análise completa →" (opens Full Window experience).

OUTPUT: A clean, dense, elegant Chrome Side Panel interface with editorial male photography that seamlessly complements the store webpage on the left.
```

---

## ⚡ Guia de Implementação Técnica (Chrome Extension Manifest V3)

Para configurar a extensão Chrome para abrir o **Side Panel** diretamente ao clicar no ícone:

### 1. Configuração no `manifest.json`
```json
{
  "manifest_version": 3,
  "name": "Elite Bot — Guia do Homem Barato",
  "permissions": [
    "sidePanel",
    "storage",
    "activeTab",
    "tabs"
  ],
  "side_panel": {
    "default_path": "index.html"
  },
  "action": {
    "default_title": "Abrir Elite Bot Side Panel"
  }
}
```

### 2. Comportamento no `background.js`
```javascript
// Configura o Side Panel para abrir diretamente ao clicar no ícone da extensão
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listener para abrir a experiência expandida em uma nova aba
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'OPEN_EXPANDED_VIEW') {
    const url = chrome.runtime.getURL(`index.html?mode=expanded&productId=${message.productId}`);
    chrome.tabs.create({ url });
  }
});
```

