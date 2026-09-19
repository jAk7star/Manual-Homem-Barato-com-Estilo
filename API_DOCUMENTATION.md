# 🚀 Elite Bot — Documentação Técnica da API REST

> **Status:** MVP / Ativo  
> **Motor API:** [PostgREST 12](https://postgrest.org/) (ORM-less REST API sobre PostgreSQL 16)  
> **Host Local:** `http://localhost:3001`  
> **Gerenciador BD:** pgAdmin 4 (`http://localhost:5050`)

---

## 📌 1. Visão Geral da Arquitetura

O **Elite Bot** utiliza uma arquitetura reativa moderna em que o **PostgREST** expõe diretamente o esquema `public` do **PostgreSQL 16** como uma API HTTP RESTful resiliente, segura e de baixíssima latência.

```text
┌───────────────────────────────────────────────────┐
│     Clientes (Extension / Website / Worker)       │
└─────────────────────────┬─────────────────────────┘
                          │ HTTP REST (Porta 3001)
                          ▼
┌───────────────────────────────────────────────────┐
│                PostgREST Engine                   │
└─────────────────────────┬─────────────────────────┘
                          │ PostgreSQL Native Driver
                          ▼
┌───────────────────────────────────────────────────┐
│   PostgreSQL 16 (RLS + Auth Schema + Trigger SQL)  │
└─────────────────────────┬─────────────────────────┘
```

---

## 🖼️ 2. Evidências do Ambiente e Banco de Dados (Prints de Avaliação)

*Esta seção serve como comprovação visual de que a infraestrutura e o banco de dados estão operacionais e populados.*

### 2.1 Visão dos Containers no Docker Desktop
> 📸 **[INSERIR PRINT AQUI]**: *Print do Docker Desktop mostrando os containers `elitebot-postgres`, `elitebot-postgrest` e `elitebot-pgadmin` em execução.*

### 2.2 Conexão e Estrutura no pgAdmin 4
> 📸 **[INSERIR PRINT AQUI]**: *Print do pgAdmin 4 com a árvore expandida em `elitebot` ➔ `Schemas` ➔ `public` ➔ `Tabelas`.*

### 2.3 Registro de Seed Data (Query Tool)
> 📸 **[INSERIR PRINT AQUI]**: *Print do pgAdmin executando `SELECT * FROM public.categories;` mostrando as categorias cadastradas (`Perfumes`, `Cuidados com a pele`, `Roupas`).*

---

## ⚡ 3. Guia Rápido de Execução (Quickstart para Avaliadores)

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/) (com Docker Compose v2+)

### Passo a Passo

1. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

2. **Subir os serviços principais (PostgreSQL + PostgREST):**
   ```bash
   docker compose up -d
   ```

3. **Subir a ferramenta de administração (pgAdmin):**
   ```bash
   docker compose --profile tools up -d pgadmin
   ```

4. **Verificar a resposta da API:**
   ```bash
   curl -s http://localhost:3001/categories
   ```

---

## 🔐 4. Modelo de Segurança & Controle de Acesso (RLS / Roles)

O controle de acesso é aplicado de forma nativa dentro do PostgreSQL via **Row-Level Security (RLS)** e **Roles**:

| Role PostgreSQL | Autenticação | Permissões |
|---|---|---|
| `web_anon` | Nenhuma (Público) | Leitura de catálogos (`categories`, `brands`, `products`, `offers`) e Views. |
| `authenticated` | JWT Bearer Header | Leitura/Escrita isolada de dados próprios (`users`, `alerts`, `affiliate_clicks`). |
| `authenticator` | NOLOGIN / Login Interno | Papel utilizado pelo PostgREST para autenticar e alternar para `web_anon` ou `authenticated`. |

### Como o RLS Funciona no Banco (`002_security.sql`)
A função customizada `auth.uid()` extrai a chave `sub` contida nas claims do Token JWT do cabeçalho da requisição:

```sql
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::UUID
$$ LANGUAGE sql STABLE;

-- Exemplo de Política RLS aplicada à tabela de Alertas:
CREATE POLICY alerts_select_own ON alerts FOR SELECT
    TO authenticated USING (user_id = auth.uid());
```

---

## 📖 5. Especificação dos Endpoints REST

### 5.1 Catálogo Público (Role `web_anon`)

#### `GET /categories` — Listar Categorias
Retorna todas as categorias cadastradas no catálogo.

* **URL**: `http://localhost:3001/categories`
* **Método**: `GET`
* **Headers**: `Accept: application/json`
* **Status de Sucesso**: `200 OK`

**Exemplo de Resposta (JSON):**
```json
[
  {
    "id": "b39fa9de-4b13-4373-a339-69f48f9310a2",
    "name": "Perfumes",
    "slug": "perfumes",
    "created_at": "2026-09-17T21:40:26.434601+00:00",
    "updated_at": "2026-09-17T21:40:26.434601+00:00"
  },
  {
    "id": "e11b9b6f-c0e7-40a1-93ec-a665ca8fd2b8",
    "name": "Cuidados com a pele",
    "slug": "cuidados com a pele",
    "created_at": "2026-09-17T21:40:26.434601+00:00",
    "updated_at": "2026-09-17T21:40:26.434601+00:00"
  }
]
```

---

#### `GET /products` — Listar Produtos com Filtro e Join
Exemplo de consulta avançada combinando filtro de atributos e join com a tabela de categorias.

* **URL**: `http://localhost:3001/products?select=id,name,slug,categories(name)&gender=eq.male`
* **Método**: `GET`
* **Status de Sucesso**: `200 OK`

---

#### `GET /best_product_offers` — Consulta à View de Melhores Ofertas
Retorna os menores preços consolidados para cada produto ativo.

* **URL**: `http://localhost:3001/best_product_offers?order=current_price.asc&limit=10`
* **Método**: `GET`
* **Status de Sucesso**: `200 OK`

---

### 5.2 Escrita de Dados (Role `authenticated`)

#### `POST /alerts` — Cadastrar Alerta de Preço
Permite que um usuário autenticado crie um alerta quando um produto atingir determinado preço alvo.

* **URL**: `http://localhost:3001/alerts`
* **Método**: `POST`
* **Headers Required**: 
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
  - `Prefer: return=representation`
* **Status de Sucesso**: `201 Created`

**Payload de Requisição:**
```json
{
  "product_id": "b39fa9de-4b13-4373-a339-69f48f9310a2",
  "target_price": 199.90,
  "is_active": true
}
```

---

## 🛠️ 6. Convenções de Filtro e Paginação no PostgREST

A API oferece poderosos recursos nativos de consulta via parâmetros de URL:

| Operador | Descrição | Exemplo de Uso |
|---|---|---|
| `eq` | Igual a | `?slug=eq.perfumes` |
| `ilike` | Busca por texto (Case-insensitive) | `?name=ilike.*acqua*` |
| `gt` / `gte` | Maior que / Maior ou igual | `?current_price=gte.100.00` |
| `order` | Ordenação de colunas | `?order=name.asc` ou `?order=created_at.desc` |
| `limit` / `offset` | Paginação de resultados | `?limit=20&offset=40` |
| `select` | Seleção de campos e joins | `?select=name,price,stores(name)` |

---

## 🚨 7. Matriz de Erros e Tratamento de Exceções HTTP

O PostgREST intercepta exceções do banco de dados e retorna respostas padronizadas em JSON:

```json
{
  "code": "23505",
  "details": "Key (slug)=(perfumes) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint \"categories_slug_key\""
}
```

### Tabela de Códigos HTTP de Retorno

| Código | Descrição | Causa / Cenário no Banco |
|---|---|---|
| **`200 OK`** | Leitura de dados ou execução de função concluída com sucesso. | Query efetuada perfeitamente. |
| **`201 Created`** | Novo registro inserido com sucesso. | `INSERT` realizado. |
| **`204 No Content`** | Operação realizada com sucesso sem retorno de corpo. | `UPDATE` ou `DELETE` sem `Prefer: return=representation`. |
| **`400 Bad Request`** | Erro de sintaxe nos parâmetros de busca ou tipos incompatíveis. | Enviar um texto comum em campo esperado como `UUID`. |
| **`401 Unauthorized`** | Ausência de Token JWT em rotas restritas ou token expirado/inválido. | Header `Authorization` ausente ao chamar `/alerts`. |
| **`403 Forbidden`** | Permissão negada via Row-Level Security (RLS) ou tabela restrita. | `web_anon` tentando dar `INSERT` ou `DELETE` em `/categories`. |
| **`404 Not Found`** | Tabela, View ou recurso solicitado não existe no esquema exposed. | Chamada para rota inexistente como `/tabela_inexistente`. |
| **`409 Conflict`** | Violação de Constraint no banco de dados. | Tentativa de inserir registro com `slug` ou `id` duplicado (`23505`). |
| **`422 Unprocessable Entity`** | Valor de campo incompatível com restrição de tipo ou Enum. | Inserir um valor inválido no ENUM `product_gender`. |

---

## 🧪 8. Testes e Coleção Postman

A suíte completa de testes e cenários automatizados de API está documentada na pasta [`Specs/Elite-Bot-Postman-Specification.md`](Specs/Elite-Bot-Postman-Specification.md).
