-- ============================================================
-- ELITE BOT
-- Migration: 002_security
-- Roles, permissões e Row-Level Security para PostgREST
-- ============================================================
-- Execute após: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- SCHEMA auth (necessário para a função auth.uid())
-- ============================================================

CREATE SCHEMA IF NOT EXISTS auth;


-- ============================================================
-- ROLES
-- ============================================================

-- Role anônima: leitura pública, sem autenticação
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'web_anon') THEN
        CREATE ROLE web_anon NOLOGIN;
    END IF;
END $$;

-- Role de usuário autenticado (recebe JWT com role=authenticated)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
END $$;

-- Role do authenticator: papel que o PostgREST usa para conectar ao banco
-- Ele troca para web_anon ou authenticated conforme o JWT
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'change_me_authenticator';
    END IF;
END $$;

GRANT web_anon      TO authenticator;
GRANT authenticated TO authenticator;


-- ============================================================
-- PERMISSÕES — web_anon (leitura pública)
-- ============================================================

GRANT USAGE ON SCHEMA public TO web_anon;

-- Catálogo — somente leitura
GRANT SELECT ON categories         TO web_anon;
GRANT SELECT ON brands             TO web_anon;
GRANT SELECT ON products           TO web_anon;
GRANT SELECT ON product_identifiers TO web_anon;
GRANT SELECT ON stores             TO web_anon;
GRANT SELECT ON offers             TO web_anon;
GRANT SELECT ON price_history      TO web_anon;
GRANT SELECT ON product_matches    TO web_anon;
GRANT SELECT ON deal_scores        TO web_anon;

-- Views públicas
GRANT SELECT ON best_product_offers   TO web_anon;
GRANT SELECT ON product_price_history TO web_anon;
GRANT SELECT ON product_deal_summary  TO web_anon;


-- ============================================================
-- PERMISSÕES — authenticated (usuário autenticado via JWT)
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated;

-- Herda tudo que web_anon pode ler
GRANT SELECT ON categories          TO authenticated;
GRANT SELECT ON brands              TO authenticated;
GRANT SELECT ON products            TO authenticated;
GRANT SELECT ON product_identifiers TO authenticated;
GRANT SELECT ON stores              TO authenticated;
GRANT SELECT ON offers              TO authenticated;
GRANT SELECT ON price_history       TO authenticated;
GRANT SELECT ON product_matches     TO authenticated;
GRANT SELECT ON deal_scores         TO authenticated;
GRANT SELECT ON best_product_offers    TO authenticated;
GRANT SELECT ON product_price_history  TO authenticated;
GRANT SELECT ON product_deal_summary   TO authenticated;

-- Dados privados — leitura e escrita limitadas por RLS
GRANT SELECT, INSERT ON users             TO authenticated;
GRANT SELECT, INSERT, UPDATE ON alerts    TO authenticated;
GRANT SELECT, INSERT ON affiliate_clicks  TO authenticated;


-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================
-- O JWT do PostgREST expõe o claim "sub" como o user_id.
-- A função auth.uid() abaixo extrai esse valor.
-- ============================================================

-- Função auxiliar para extrair o user_id do JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    )::UUID
$$;


-- ---- users ----

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuário só vê e insere o próprio registro
CREATE POLICY users_select_own
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY users_insert_own
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());


-- ---- alerts ----

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_select_own
    ON alerts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY alerts_insert_own
    ON alerts FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY alerts_update_own
    ON alerts FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- ---- affiliate_clicks ----

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado só insere cliques próprios
CREATE POLICY affiliate_clicks_insert_own
    ON affiliate_clicks FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IS NULL
        OR user_id = auth.uid()
    );

-- Leitura de cliques próprios (para histórico futuro)
CREATE POLICY affiliate_clicks_select_own
    ON affiliate_clicks FOR SELECT
    TO authenticated
    USING (
        user_id IS NULL
        OR user_id = auth.uid()
    );


