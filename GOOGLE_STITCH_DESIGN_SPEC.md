# 🎨 Elite Bot — Especificação Visual de Nicho & Prompt Google Stitch (Anti-Vibecoding)

> **Objetivo:** Guia de Design System e Prompt para **Google Stitch**, baseado em e-commerces de referência real do nicho de moda masculina e perfumaria (**Aramis** e **Fragrantica**). Evita a estética genérica "dark tech / vibecoding" e foca em **Elegância Editorial Masculina + Inteligência Olfativa**.

---

## 📸 Análise das Referências Reais do Nicho

1. **Aramis (Editorial Menswear & Alfaiataria)**:
   - **Tipografia**: Headers em caixa alta refinada, espaçamento editorial equilibrado.
   - **Cores de Acento**: Tons de Cobre/Terracota (`#C85A32`) sobre fundos Off-White Sand (`#F9F8F6`) ou Dark Charcoal (`#121316`).
   - **Filtros de Tamanho**: Pílulas numéricas de tamanho de sapatos/roupas (`38`, `39`, `40`, `41`, `42`, `43`, `44`).
   - **Layout**: Banners limpos de desconto (*Special Week / até 50% OFF + 20% extra*).

2. **Fragrantica (Arquitetura Olfativa de Perfumes)**:
   - **Acordes Olfativos**: Barras horizontais de notas (*Amadeirado, Especiado Quente, Âmbar, Fresco, Baunilha, Tabaco, Couro*).
   - **Resumo Técnico**: Tipo de perfume (EDP, EDT, Parfum), notas de topo/corpo/fundo e avaliação dos usuários.

---

## 🎨 Design System: "Menswear & Fragrance Editorial"

### 1. Paleta de Cores Nativa do Nicho

| Elemento | Cor Hex / RGBA | Referência / Uso |
|---|---|---|
| **Fundo Dark (Popup/App)** | `#121316` | Fundo carvão fosco, elegante e não cansativo. |
| **Fundo Light (Modo Claro/Site)** | `#F9F8F6` | Off-white sand inspirado nos banners da Aramis. |
| **Acento Principal (Cobre/Terracota)** | `#C85A32` | Destaques de desconto, cupons e CTAs de oferta. |
| **Acento Secundário (Âmbar Warm)** | `#D97706` | Barras de notas amadeiradas e classificação de perfume. |
| **Superfície de Cards** | `#1A1C22` | Cards planos com bordas finas `#282B34` (sem neons exagerados). |
| **Texto Principal** | `#F3F4F6` | Alta legibilidade em fundos escuros. |

---

## 🤖 Prompt Atualizado para o Google Stitch (Nicho Real)

*Copie e cole este prompt no Google Stitch para gerar interfaces fiéis aos e-commerces masculinos de elite:*

```text
Design a sophisticated Chrome Extension Popup (width: 390px) and companion Web Interface for "Elite Bot", a smart shopping assistant for men's fashion, footwear, and fragrances, inspired by Aramis menswear and Fragrantica fragrance encyclopedia.

DESIGN AESTHETICS (STRICTLY NO GENERIC SCI-FI / CRYPTO VIBECODING):
- Style: Premium Men's Editorial & Olfactory Intelligence. Clean matte dark charcoal background (#121316) with subtle terracotta copper accents (#C85A32) and warm ambers (#D97706).
- Typography: Clean editorial sans-serif (Inter or Plus Jakarta Sans), uppercase section titles ("ALFAIATARIA", "PERFUMARIA", "ACORDES PRINCIPAIS").
- Card Design: Flat matte charcoal containers (#1A1C22) with thin 1px subtle divider lines (#282B34) and high-legibility crisp text.

KEY COMPONENTS TO DISPLAY:

1. HEADER & NICHE MODE:
   - Minimalist "ELITE BOT" header + active mode pill badge ("PERFUMARIA MASCULINA" or "VESTUÁRIO & CALÇADOS").

2. PRODUCT HERO CARD (FRAGRANCE / FASHION CASE):
   - Product Title (e.g., "Malbec Desodorante Colônia 100ml" or "Aramis Tênis Couro Urban").
   - Brand & Store Badge (e.g., "O Boticário" / "Aramis").
   - Price Display: Current Promo Price (R$ 149.90) in bold terracotta vs Original Price (R$ 189.90) strikethrough.

3. FRAGRANCE ACCORD BARS (When viewing a perfume, inspired by Fragrantica):
   - Mini horizontal accord bars: [Amadeirado (Amber)], [Especiado Quente (Terracotta)], [Fresco (Slate)].

4. SIZES SELECTOR PILLS (When viewing shoes/fashion, inspired by Aramis):
   - Circular size pills: [38] [39] [40] [41] [42] [43] [44] with selected state.

5. STORES COMPARISON GRID:
   - Row 1: O Boticário (R$ 149.90) + Pill CTA "Ir para Loja".
   - Row 2: Beleza na Web (R$ 169.90).
   - Row 3: Mercado Livre (R$ 175.00).

6. PRICE ALERT & COUPON BANNER:
   - Clean promo badge: "SPECIAL WEEK — Use Cupom: SPECIAL20 (+20% OFF)".
   - Price alert target input (e.g., "Avisar quando chegar a R$ 130,00").

OUTPUT:
A clean, realistic, high-fashion menswear e-commerce interface that feels authentic to Aramis and Fragrantica.
```

---

## 📐 Especificação dos Recursos Visuais Únicos de Nicho

### A. Pirâmide Olfativa / Acordes (`FragranceAccords`)
- Exibição de 3 a 5 barras coloridas representando os acordes principais do perfume:
  - **Amadeirado / Tabaco**: `#9A3412` (Terracota Escuro)
  - **Âmbar / Baunilha**: `#D97706` (Âmbar Dourado)
  - **Fresco / Cítrico**: `#0284C7` (Azul Oceano)

### B. Seletor de Tamanhos de Calçados (`SizeSelector`)
- Pílulas circulares `w-9 h-9 rounded-full`, fundo `#22252C`, texto `#E5E7EB`.
- Estado ativo: Fundo `#C85A32` (Cobre), texto `#FFFFFF` com fonte bold.

---
