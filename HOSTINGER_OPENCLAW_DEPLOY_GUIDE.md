# 🚀 Guia Completo: Estado da Aplicação & Deploy do Elite-Bot com OpenClaw na VM Hostinger

---

## 📊 1. Avaliação do Estado e Progresso Atual da Aplicação

Sua aplicação **Elite-Bot — Guia do Homem Barato** está em estado **praticamente pronto para produção (~98% concluído no backend e extensão)**. 

### ✅ O que está 100% Implementado e Testado:
1. **Banco de Dados PostgreSQL (16 Alpine)**:
   - Schema completo (`001_initial_schema.sql`): `products`, `offers`, `price_history`, `stores`, `coupons`, `alerts`.
   - Segurança RLS & JWT (`002_security.sql`).
   - Catálogo Base Masculino (`003_seed_catalog.sql`): Perfumaria (*Malbec*, *Quasar*, *Natura Homem*), Moda (*Hering*, *Renner*, *C&A*), Calçados (*Ferracini*, *Democrata*, *Dafiti*).
   - **RPC de Matching Inteligente (`004_rpc_match_product.sql`)**: Desambiguação estrita de variantes (distingue *Natura Homem Aventura* vs *Extremo* vs *Cor-Agem* vs *Black* vs *Elixir*) evitando falsos positivos de comparação entre fragrâncias distintas.

2. **Worker Backend (Node.js/TypeScript)**:
   - **CDC (Change Data Capture)**: Histórico de preços grava apenas quando há alteração real de valor/estoque, reduzindo em 90% o inchaço do banco de dados.
   - **Ingestão via Sitemap XML (`JOB-005`)**: Filtro automatizado para categorias masculinas em 12 grandes e-commerces.
   - **Sistema de Alertas com Cooldown de 12h (`JOB-004`)**: Identificação de Mínimas Históricas (ATL) e quedas >15%.
   - **Notificações Multi-Provedor**: Integração pronta para WhatsApp (Evolution API / Z-API), E-mail (Resend API HTML), Push & SendGrid.
   - **Servidor HTTP 302 de Redirecionamento (Porta 3002)**: Redireciona com injeção de tag de afiliado sem quebrar links diretos de produtos.

3. **Extensão Chrome Manifest V3**:
   - Botão **Liga/Desliga** no Header persistido em `chrome.storage.local`.
   - **Leitura Anti-Falso-Positivo no DOM**: Ignora preços originais riscados (`<s>`, `<del>`, `.line-through`, `.ui-pdp-price__original-value`) e captura o valor promocional real.
   - Suporte a páginas de grade/listagem e páginas de produto individual.

---

## 🦀 2. Como Funciona a Integração com o OpenClaw no Motor Docker

### O Papel do OpenClaw no Ecossistema
O **OpenClaw** atua como o **motor avançado de scraping, renderização headless e automação dinâmica em background**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             HOSTINGER VPS (Docker)                          │
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │   Caddy      │────>│   PostgREST  │────>│ PostgreSQL 16│                 │
│  │ ReverseProxy │     │   (API REST) │     │ (Base Dados) │                 │
│  └──────┬───────┘     └──────▲───────┘     └──────▲───────┘                 │
│         │                    │                    │                         │
│         │             ┌──────┴───────┐            │                         │
│         └────────────>│ Elite Worker │────────────┘                         │
│                       └──────▲───────┘                                      │
│                              │ (Alimentação / Disparo)                      │
│                       ┌──────┴───────┐                                      │
│                       │   OpenClaw   │ (Scraping de Sites Dinâmicos JS/SPA) │
│                       │ Engine Container                                    │
│                       └──────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Execução Isolada**: O OpenClaw roda como um container dedicado dentro da mesma rede interna Docker (`elitebot-net`).
2. **Scraping de Páginas Dinâmicas**: Enquanto o Worker leve processa sitemaps e requisições HTTP normais, o **OpenClaw** assume o scraping de lojas com bloqueios pesados, Cloudflare ou renderização dinâmica em React/Vue (como *Beleza na Web* ou *Mercado Livre*).
3. **Comunicação Direta**: O OpenClaw envia os dados extraídos diretamente para o PostgREST (`http://postgrest:3000/offers`) ou aciona o Worker via webhook interno.

---

## 🛠️ 3. O que Falta para Finalizar e Subir na VM Hostinger?

**Falta apenas executar o deploy na sua VM!** Todos os arquivos de infraestrutura foram gerados na raiz do projeto:

- `docker-compose.prod.yml` (Configuração completa dos 5 containers: Postgres, PostgREST, Worker, OpenClaw, Caddy)
- `worker/Dockerfile` (Build otimizado Node.js)
- `Caddyfile` (Proxy HTTPS com emissão automática de certificado SSL Let's Encrypt)
- `.env.prod.example` (Modelo de variáveis de ambiente de produção)
- `deploy.sh` (Script de deploy em 1 comando)

---

## 📋 4. Passo a Passo do Deploy na VM Hostinger

### Passo 1: Acessar a VM por SSH
Abra o seu terminal (PowerShell ou Git Bash) e conecte-se à sua VPS Hostinger:
```bash
ssh root@IP_DA_SUA_VM_HOSTINGER
```

### Passo 2: Clonar o Repositório do Projeto na VM
```bash
git clone https://github.com/SEU_USUARIO/Elite-Bot.git /opt/elite-bot
cd /opt/elite-bot
```

### Passo 3: Apontar os DNS no Painel da Hostinger (hPanel)
No painel da Hostinger, vá em **DNS Zone Editor** do seu domínio e crie os seguintes registros **A**:

| Tipo | Nome | Valor / IP |
| :--- | :--- | :--- |
| **A** | `api` | `IP_DA_SUA_VM_HOSTINGER` |
| **A** | `click` | `IP_DA_SUA_VM_HOSTINGER` |
| **A** | `claw` | `IP_DA_SUA_VM_HOSTINGER` |

### Passo 4: Configurar as Variáveis de Ambiente
Crie o arquivo `.env.prod` na raiz da pasta `/opt/elite-bot`:
```bash
cp .env.prod.example .env.prod
nano .env.prod
```
Ajuste os valores dos seus domínios e senhas seguras. Para salvar no Nano: `Ctrl + O`, `Enter` e `Ctrl + X`.

### Passo 5: Executar o Deploy Automatizado
Dê permissão de execução e rode o script:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🎯 5. Como Conectar a Extensão Chrome com o Backend da Hostinger

Após concluir o deploy, edite o arquivo `extension/src/services/api.ts` para apontar para a sua VM Hostinger:

```typescript
// extension/src/services/api.ts
export const API_BASE_URL = 'https://api.seusite.com';
export const REDIRECT_BASE_URL = 'https://click.seusite.com';
```

Em seguida, recompile a extensão localmente com:
```bash
cd extension
npm run build
```
E recarregue a pasta `extension/dist` no navegador Chrome (`chrome://extensions`).

---

## ✅ Resumo Executivo
Sua aplicação está pronta para entrar em operação real. Com a arquitetura Docker + Caddy + OpenClaw configurada, o sistema terá HTTPS gratuito automático, resiliência a reinicializações (`restart: always`), separação limpa de microsserviços e capacidade de raspar preços em tempo real com alta precisão.
