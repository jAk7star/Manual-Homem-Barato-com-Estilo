-- ============================================================
-- ELITE BOT
-- Migration: 004_rpc_match_product
-- Purpose: Função RPC para correspondência de produto por EAN ou Título com Validação Estrita de Variantes
--          Exposta no PostgREST como POST /rpc/match_product
-- ============================================================

CREATE OR REPLACE FUNCTION match_product(
    p_title TEXT,
    p_ean TEXT DEFAULT NULL,
    p_domain TEXT DEFAULT NULL
)
RETURNS TABLE (
    product_id UUID,
    name VARCHAR,
    slug VARCHAR,
    confidence NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prod_id UUID;
    v_prod_name VARCHAR;
    v_prod_slug VARCHAR;
BEGIN
    -- 1. Tenta Match Exato por EAN / GTIN se fornecido
    IF p_ean IS NOT NULL AND TRIM(p_ean) <> '' THEN
        SELECT p.id, p.name, p.slug INTO v_prod_id, v_prod_name, v_prod_slug
          FROM products p
          JOIN product_identifiers pi ON pi.product_id = p.id
         WHERE pi.identifier_value = TRIM(p_ean)
         LIMIT 1;

        IF v_prod_id IS NOT NULL THEN
            RETURN QUERY SELECT v_prod_id, v_prod_name, v_prod_slug, 100.0::NUMERIC;
            RETURN;
        END IF;
    END IF;

    -- 2. Match por Palavras-Chave de Título com Validação Estrita de Variantes
    IF p_title IS NOT NULL AND LENGTH(TRIM(p_title)) > 3 THEN
        SELECT p.id, p.name, p.slug INTO v_prod_id, v_prod_name, v_prod_slug
          FROM products p
         WHERE (
            LOWER(p_title) ILIKE '%' || LOWER(p.name) || '%'
            OR LOWER(p.name) ILIKE '%' || LOWER(TRIM(p_title)) || '%'
         )
         -- Preserva a distinção estrita entre variações de fragrâncias e produtos
         AND (
            (LOWER(p_title) NOT LIKE '%extremo%' OR LOWER(p.name) LIKE '%extremo%') AND
            (LOWER(p_title) NOT LIKE '%aventura%' OR LOWER(p.name) LIKE '%aventura%') AND
            (LOWER(p_title) NOT LIKE '%oceano%' OR LOWER(p.name) LIKE '%oceano%') AND
            (LOWER(p_title) NOT LIKE '%urbe%' OR LOWER(p.name) LIKE '%urbe%') AND
            (LOWER(p_title) NOT LIKE '%pulso%' OR LOWER(p.name) LIKE '%pulso%') AND
            (LOWER(p_title) NOT LIKE '%vital%' OR LOWER(p.name) LIKE '%vital%') AND
            (LOWER(p_title) NOT LIKE '%aero%' OR LOWER(p.name) LIKE '%aero%') AND
            (LOWER(p_title) NOT LIKE '%black%' OR LOWER(p.name) LIKE '%black%') AND
            (LOWER(p_title) NOT LIKE '%gold%' OR LOWER(p.name) LIKE '%gold%') AND
            (LOWER(p_title) NOT LIKE '%intense%' OR LOWER(p.name) LIKE '%intense%') AND
            (LOWER(p_title) NOT LIKE '%absoluto%' OR LOWER(p.name) LIKE '%absoluto%') AND
            (LOWER(p_title) NOT LIKE '%bleu%' OR LOWER(p.name) LIKE '%bleu%') AND
            (LOWER(p_title) NOT LIKE '%santal%' OR LOWER(p.name) LIKE '%santal%') AND
            (LOWER(p_title) NOT LIKE '%infinity%' OR LOWER(p.name) LIKE '%infinity%') AND
            (LOWER(p_title) NOT LIKE '%bomb%' OR LOWER(p.name) LIKE '%bomb%') AND
            (LOWER(p_title) NOT LIKE '%botanic%' OR LOWER(p.name) LIKE '%botanic%') AND
            (LOWER(p_title) NOT LIKE '%clash%' OR LOWER(p.name) LIKE '%clash%') AND
            (LOWER(p_title) NOT LIKE '%original%' OR LOWER(p.name) LIKE '%original%')
         )
         ORDER BY LENGTH(p.name) DESC
         LIMIT 1;

        IF v_prod_id IS NOT NULL THEN
            RETURN QUERY SELECT v_prod_id, v_prod_name, v_prod_slug, 95.0::NUMERIC;
            RETURN;
        END IF;
    END IF;

    -- 3. Nenhuma correspondência de alta confiança no escopo
    RETURN;
END;
$$;

-- Permissões de Acesso via PostgREST
GRANT EXECUTE ON FUNCTION match_product(TEXT, TEXT, TEXT) TO web_anon, authenticated;

