# 🧪 Elite Bot — Guia de Testes Automatizados com Postman / Newman

> **Objetivo:** Oferecer um guia prático para testadores, desenvolvedores e avaliadores executarem a suíte de testes de validação da API REST do **Elite Bot** usando o **Postman** ou a CLI **Newman**.

---

## 📌 1. Visão Geral da Suíte de Testes

A suíte de testes garante que todos os contratos da API gerados pelo **PostgREST** estejam funcionais e seguros antes de qualquer integração com a Chrome Extension ou o Frontend.

```text
PostgreSQL (Porta 5432) ➔ PostgREST (Porta 3001) ➔ Postman / Newman Test Suite
```

### Categorias de Teste Mapeadas

| Nível | Categoria | Descrição |
|---|---|---|
| **P0** | **Leitura de Catálogo** | Valida a resposta pública dos endpoints `/categories`, `/brands`, `/stores`, `/products`. |
| **P1** | **Views Otimizadas** | Valida o retorno das Views de inteligência (`/best_product_offers`, `/product_deal_summary`). |
| **P2** | **Fluxo E2E da API** | Valida a jornada de busca de produto por slug e identificador (EAN/GTIN). |
| **SEC** | **Segurança & RLS** | Valida que a role `web_anon` é bloqueada ao tentar escrever e que `authenticated` respeita RLS por `auth.uid()`. |

---

## 🖼️ 2. Evidências dos Testes (Prints de Avaliação)

*Esta seção serve para incluir as capturas de tela comprovando a execução bem-sucedida dos testes.*

### 2.1 Suíte de Testes Executada no Postman Runner
> 📸 **[INSERIR PRINT AQUI]**: *Print da janela do Postman Runner com todos os testes passando em verde (`Pass - Status 200 OK`, `Array length >= 1`).*

### 2.2 Execução Automatizada via CLI (Newman)
> 📸 **[INSERIR PRINT AQUI]**: *Print do terminal executando `npx newman run` com a tabela de resultados sem falhas.*

---

## ⚙️ 3. Variáveis de Ambiente no Postman

Ao importar o ambiente no Postman, utilize as seguintes variáveis de referência:

| Variável | Valor Padrão (Local) | Descrição |
|---|---|---|
| `base_url` | `http://localhost:3001` | URL base onde a API PostgREST está respondendo. |
| `jwt_authenticated` | `eyJhbGciOi...` | Token JWT gerado para a role `authenticated` com claim `sub`. |
| `category_id` | *(Dinâmico)* | Preenchido automaticamente pelo script de teste no `TC-P0-01`. |
| `product_id` | *(Dinâmico)* | Preenchido automaticamente pelo script de teste no `TC-P0-04`. |

---

## 🚀 4. Como Executar os Testes no Postman (Interface Visual)

### Passo 1: Importar a Coleção e o Ambiente

1. Abra o **Postman**.
2. Clique no botão **Import** (canto superior esquerdo).
3. Selecione a pasta `postman/` do projeto e importe:
   - `postman/Elite-Bot.postman_collection.json`
   - `postman/Elite-Bot.postman_environment.json`

### Passo 2: Selecionar o Ambiente

No canto superior direito do Postman, altere a caixa de seleção de ambiente para **`Elite Bot - Local Environment`**.

### Passo 3: Executar a Suíte Completa (Collection Runner)

1. Clique com o botão direito na coleção **Elite Bot** ➔ **Run collection**.
2. Clique em **Run Elite Bot**.
3. O Postman executará todas as requisições sequencialmente e exibirá o relatório verde de **Passed Tests**.

---

## 💻 5. Execução Automatizada via Linha de Comando (Newman CLI)

Para integradores ou pipelines CI/CD, você pode rodar a suíte completa diretamente no terminal sem abrir o Postman:

```bash
# Executar a coleção utilizando o arquivo de ambiente
npx newman run postman/Elite-Bot.postman_collection.json \
  -e postman/Elite-Bot.postman_environment.json \
  --reporters cli
```

### Exemplo de Assertiva JS Usada nos Testes (`TC-P0-01`):

```javascript
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna um array com pelo menos 1 categoria", function () {
    const body = pm.response.json();
    pm.expect(body).to.be.an('array').with.length.gte(1);
});

pm.test("Salva a primeira categoria no ambiente", function () {
    const body = pm.response.json();
    if (body.length > 0) {
        pm.environment.set("category_id", body[0].id);
    }
});
```

---

## 🔗 6. Documentações Relacionadas

- [Especificação da API (`API_DOCUMENTATION.md`)](API_DOCUMENTATION.md)
- [Especificação Detalhada do Postman (`Specs/Elite-Bot-Postman-Specification.md`)](Specs/Elite-Bot-Postman-Specification.md)
