-- ============================================================
-- ELITE BOT
-- Migration: 003_seed_catalog
-- Purpose: Inserção de lojas, categorias, marcas, produtos,
--          identificadores EAN e ofertas iniciais.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATEGORIAS
-- ------------------------------------------------------------
INSERT INTO categories (name, slug)
VALUES
    ('Perfumes', 'perfumes'),
    ('Skincare', 'skincare'),
    ('Grooming', 'grooming'),
    ('Roupas', 'roupas'),
    ('Calçados', 'calcados')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name;

-- ------------------------------------------------------------
-- 2. MARCAS
-- ------------------------------------------------------------
INSERT INTO brands (name, slug)
VALUES
    ('Lattafa', 'lattafa'),
    ('O Boticário', 'o-boticario'),
    ('Natura', 'natura'),
    ('Nivea', 'nivea'),
    ('Giorgio Armani', 'giorgio-armani'),
    ('Hering', 'hering'),
    ('Democrata', 'democrata'),
    ('Ferracini', 'ferracini'),
    ('L''Oréal', 'loreal')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name;

-- ------------------------------------------------------------
-- 3. LOJAS
-- ------------------------------------------------------------
INSERT INTO stores (name, slug, domain, affiliate_network, affiliate_base_url, is_active)
VALUES
    ('Amazon Brasil', 'amazon-brasil', 'amazon.com.br', 'custom', 'https://www.amazon.com.br', TRUE),
    ('Mercado Livre', 'mercado-livre', 'mercadolivre.com.br', 'custom', 'https://www.mercadolivre.com.br', TRUE),
    ('Beleza na Web', 'beleza-na-web', 'belezanaweb.com.br', 'awin', 'https://www.belezanaweb.com.br', TRUE),
    ('O Boticário', 'o-boticario', 'oboticario.com.br', 'custom', 'https://www.boticario.com.br', TRUE),
    ('Natura', 'natura', 'natura.com.br', 'custom', 'https://www.natura.com.br', TRUE),
    ('Lojas Renner', 'lojas-renner', 'lojasrenner.com.br', 'lomadee', 'https://www.lojasrenner.com.br', TRUE),
    ('Hering', 'hering', 'hering.com.br', 'custom', 'https://www.hering.com.br', TRUE),
    ('C&A', 'cea', 'cea.com.br', 'lomadee', 'https://www.cea.com.br', TRUE),
    ('Dafiti', 'dafiti', 'dafiti.com.br', 'custom', 'https://www.dafiti.com.br', TRUE),
    ('Netshoes', 'netshoes', 'netshoes.com.br', 'custom', 'https://www.netshoes.com.br', TRUE),
    ('Democrata', 'democrata', 'democrata.com.br', 'custom', 'https://www.democrata.com.br', TRUE),
    ('Ferracini', 'ferracini', 'ferracini.com.br', 'custom', 'https://www.ferracini.com.br', TRUE)
ON CONFLICT (slug) DO UPDATE
SET domain = EXCLUDED.domain,
    affiliate_network = EXCLUDED.affiliate_network,
    affiliate_base_url = EXCLUDED.affiliate_base_url,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------
-- 4. PRODUTOS E IDENTIFICADORES (VIA SCRIPT PL/PGSQL)
-- ------------------------------------------------------------
DO $$
DECLARE
    v_cat_perfumes UUID;
    v_cat_skincare UUID;
    v_cat_grooming UUID;
    v_cat_roupas UUID;
    v_cat_calcados UUID;

    v_brand_lattafa UUID;
    v_brand_boticario UUID;
    v_brand_natura UUID;
    v_brand_nivea UUID;
    v_brand_armani UUID;
    v_brand_hering UUID;
    v_brand_democrata UUID;

    v_store_amazon UUID;
    v_store_ml UUID;
    v_store_bnw UUID;
    v_store_bot UUID;
    v_store_nat UUID;
    v_store_renner UUID;
    v_store_hering UUID;
    v_store_cea UUID;
    v_store_dafiti UUID;
    v_store_netshoes UUID;
    v_store_democrata UUID;
    v_store_ferracini UUID;

    v_prod_asad UUID;
    v_prod_malbec UUID;
    v_prod_kaiak UUID;
    v_prod_nivea_balm UUID;
    v_prod_hering_tshirt UUID;
    v_prod_democrata_shoe UUID;
BEGIN
    -- Busca IDs das Categorias
    SELECT id INTO v_cat_perfumes FROM categories WHERE slug = 'perfumes';
    SELECT id INTO v_cat_skincare FROM categories WHERE slug = 'skincare';
    SELECT id INTO v_cat_grooming FROM categories WHERE slug = 'grooming';
    SELECT id INTO v_cat_roupas FROM categories WHERE slug = 'roupas';
    SELECT id INTO v_cat_calcados FROM categories WHERE slug = 'calcados';

    -- Busca IDs das Marcas
    SELECT id INTO v_brand_lattafa FROM brands WHERE slug = 'lattafa';
    SELECT id INTO v_brand_boticario FROM brands WHERE slug = 'o-boticario';
    SELECT id INTO v_brand_natura FROM brands WHERE slug = 'natura';
    SELECT id INTO v_brand_nivea FROM brands WHERE slug = 'nivea';
    SELECT id INTO v_brand_armani FROM brands WHERE slug = 'giorgio-armani';
    SELECT id INTO v_brand_hering FROM brands WHERE slug = 'hering';
    SELECT id INTO v_brand_democrata FROM brands WHERE slug = 'democrata';

    -- Busca IDs das Lojas
    SELECT id INTO v_store_amazon FROM stores WHERE slug = 'amazon-brasil';
    SELECT id INTO v_store_ml FROM stores WHERE slug = 'mercado-livre';
    SELECT id INTO v_store_bnw FROM stores WHERE slug = 'beleza-na-web';
    SELECT id INTO v_store_bot FROM stores WHERE slug = 'o-boticario';
    SELECT id INTO v_store_nat FROM stores WHERE slug = 'natura';
    SELECT id INTO v_store_renner FROM stores WHERE slug = 'lojas-renner';
    SELECT id INTO v_store_hering FROM stores WHERE slug = 'hering';
    SELECT id INTO v_store_cea FROM stores WHERE slug = 'cea';
    SELECT id INTO v_store_dafiti FROM stores WHERE slug = 'dafiti';
    SELECT id INTO v_store_netshoes FROM stores WHERE slug = 'netshoes';
    SELECT id INTO v_store_democrata FROM stores WHERE slug = 'democrata';
    SELECT id INTO v_store_ferracini FROM stores WHERE slug = 'ferracini';

    -- Limpa ofertas de teste antigas
    TRUNCATE TABLE offers CASCADE;
    DELETE FROM products WHERE TRUE;

    -- ========================================================
    -- PRODUTO 1: Asad Lattafa Eau de Parfum 100ml
    -- ========================================================
    INSERT INTO products (
        category_id, brand_id, name, slug, description,
        product_type, gender, size_value, size_unit, image_url
    ) VALUES (
        v_cat_perfumes, v_brand_lattafa,
        'Asad Lattafa Eau de Parfum 100ml',
        'asad-lattafa-eau-de-parfum-100ml',
        'Perfume oriental amadeirado marcante com notas de pimenta preta, abacaxi, café, tabaco e baunilha.',
        'Eau de Parfum', 'male', 100, 'ml',
        'https://m.media-amazon.com/images/I/61S-+u3h7vL._AC_SL1500_.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
    RETURNING id INTO v_prod_asad;

    -- Identificador EAN
    INSERT INTO product_identifiers (product_id, identifier_type, identifier_value)
    VALUES (v_prod_asad, 'ean', '6291108735374')
    ON CONFLICT (identifier_type, identifier_value) DO NOTHING;

    -- 5 Ofertas Diretas para Asad Lattafa
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES
    (v_prod_asad, v_store_amazon, 'https://www.amazon.com.br/dp/B0C399F72D', 'Asad Lattafa EDP 100ml na Amazon', 179.90, 220.00, 'in_stock', 0.00, TRUE),
    (v_prod_asad, v_store_ml, 'https://www.mercadolivre.com.br/perfume-lattafa-asad-edp-100ml-para-masculino/p/MLB24037568', 'Asad Lattafa EDP 100ml no Mercado Livre', 189.90, 220.00, 'in_stock', 0.00, TRUE),
    (v_prod_asad, v_store_bnw, 'https://www.belezanaweb.com.br/lattafa-asad-eau-de-parfum-perfume-masculino-100ml/', 'Asad Lattafa EDP 100ml na Beleza na Web', 199.90, 230.00, 'in_stock', 0.00, TRUE),
    (v_prod_asad, v_store_dafiti, 'https://www.dafiti.com.br/Perfume-Lattafa-Asad-Eau-De-Parfum-Masculino-100ml-9812401.html', 'Asad Lattafa EDP 100ml na Dafiti', 204.90, 240.00, 'in_stock', 0.00, TRUE),
    (v_prod_asad, v_store_netshoes, 'https://www.netshoes.com.br/perfume-lattafa-asad-edp-masculino-100ml-D24-9120-006', 'Asad Lattafa EDP 100ml na Netshoes', 209.90, 250.00, 'in_stock', 0.00, TRUE);

    -- ========================================================
    -- PRODUTO 2: Malbec Desodorante Colônia 100ml
    -- ========================================================
    INSERT INTO products (
        category_id, brand_id, name, slug, description,
        product_type, gender, size_value, size_unit, image_url
    ) VALUES (
        v_cat_perfumes, v_brand_boticario,
        'Malbec Desodorante Colônia 100ml',
        'malbec-desodorante-colonia-100ml',
        'Fragrância marcante e icônica com notas amadeiradas inspiradas nos vinhos.',
        'Desodorante Colônia', 'male', 100, 'ml',
        'https://res.cloudinary.com/beleza-na-web/image/upload/f_auto,fl_progressive,q_auto/v1/imagens/products/B25145/MALBEC_DES_COL_100ml_B25145_conceito.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
    RETURNING id INTO v_prod_malbec;

    -- Identificador EAN
    INSERT INTO product_identifiers (product_id, identifier_type, identifier_value)
    VALUES (v_prod_malbec, 'ean', '7891033251458')
    ON CONFLICT (identifier_type, identifier_value) DO NOTHING;

    -- 5 Ofertas Diretas para Malbec
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES
    (v_prod_malbec, v_store_amazon, 'https://www.amazon.com.br/dp/B0777G5ZKZ', 'Malbec O Boticário 100ml na Amazon', 174.90, 209.90, 'in_stock', 0.00, TRUE),
    (v_prod_malbec, v_store_bnw, 'https://www.belezanaweb.com.br/malbec-o-boticario-desodorante-colonia-perfume-masculino-100ml/', 'Malbec O Boticário 100ml na Beleza na Web', 179.90, 209.90, 'in_stock', 0.00, TRUE),
    (v_prod_malbec, v_store_ml, 'https://www.mercadolivre.com.br/malbec-desodorante-colnia-100ml-o-boticario/p/MLB15184920', 'Malbec O Boticário 100ml no Mercado Livre', 184.90, 209.90, 'in_stock', 0.00, TRUE),
    (v_prod_malbec, v_store_bot, 'https://www.boticario.com.br/malbec-desodorante-colonia-100ml/', 'Malbec Desodorante Colônia 100ml no O Boticário', 189.90, 209.90, 'in_stock', 0.00, TRUE),
    (v_prod_malbec, v_store_netshoes, 'https://www.netshoes.com.br/malbec-desodorante-colonia-100ml-o-boticario-D24-8812-002', 'Malbec O Boticário 100ml na Netshoes', 194.90, 209.90, 'in_stock', 0.00, TRUE);

    -- ========================================================
    -- PRODUTO 3: Kaiak Masculino Desodorante Colônia 100ml
    -- ========================================================
    INSERT INTO products (
        category_id, brand_id, name, slug, description,
        product_type, gender, size_value, size_unit, image_url
    ) VALUES (
        v_cat_perfumes, v_brand_natura,
        'Kaiak Masculino Desodorante Colônia 100ml',
        'kaiak-masculino-desodorante-colonia-100ml',
        'O hiper frescor da água em combinação com notas aromáticas e amadeiradas.',
        'Desodorante Colônia', 'male', 100, 'ml',
        'https://eaudeparfum.com.br/wp-content/uploads/2023/05/kaiak-colonia-masculina.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
    RETURNING id INTO v_prod_kaiak;

    -- Identificador EAN
    INSERT INTO product_identifiers (product_id, identifier_type, identifier_value)
    VALUES (v_prod_kaiak, 'ean', '7899563200154')
    ON CONFLICT (identifier_type, identifier_value) DO NOTHING;

    -- 5 Ofertas Diretas para Kaiak
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES
    (v_prod_kaiak, v_store_ml, 'https://www.mercadolivre.com.br/desodorante-colnia-kaiak-masculino-100ml-natura/p/MLB15185012', 'Kaiak Masculino 100ml no Mercado Livre', 119.90, 179.90, 'in_stock', 0.00, TRUE),
    (v_prod_kaiak, v_store_amazon, 'https://www.amazon.com.br/dp/B0797H8M9P', 'Kaiak Masculino 100ml na Amazon', 129.90, 179.90, 'in_stock', 0.00, TRUE),
    (v_prod_kaiak, v_store_bnw, 'https://www.belezanaweb.com.br/natura-kaiak-desodorante-colonia-perfume-masculino-100ml/', 'Kaiak Masculino 100ml na Beleza na Web', 139.90, 179.90, 'in_stock', 0.00, TRUE),
    (v_prod_kaiak, v_store_nat, 'https://www.natura.com.br/p/desodorante-colonia-kaiak-masculino-100-ml/2255', 'Desodorante Colônia Kaiak Masculino 100ml na Natura', 149.90, 179.90, 'in_stock', 0.00, TRUE),
    (v_prod_kaiak, v_store_netshoes, 'https://www.netshoes.com.br/kaiak-masculino-desodorante-colonia-100ml-natura-D24-9012-004', 'Kaiak Masculino 100ml na Netshoes', 154.90, 179.90, 'in_stock', 0.00, TRUE);

    -- ========================================================
    -- PRODUTO 4: Camiseta Masculina Básica Hering 100% Algodão
    -- ========================================================
    INSERT INTO products (
        category_id, brand_id, name, slug, description,
        product_type, gender, size_value, size_unit, image_url
    ) VALUES (
        v_cat_roupas, v_brand_hering,
        'Camiseta Masculina Básica Hering 100% Algodão',
        'camiseta-masculina-basica-hering-100-algodao',
        'Camiseta básica essencial para o guarda-roupa masculino.',
        'Camiseta', 'male', 1, 'un',
        'https://hering.vtexassets.com/arquivos/ids/654321/camiseta-basica.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
    RETURNING id INTO v_prod_hering_tshirt;

    -- Identificador SKU / EAN
    INSERT INTO product_identifiers (product_id, identifier_type, identifier_value)
    VALUES (v_prod_hering_tshirt, 'ean', '7891543210987')
    ON CONFLICT (identifier_type, identifier_value) DO NOTHING;

    -- 5 Ofertas Diretas para Camiseta Hering
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES
    (v_prod_hering_tshirt, v_store_renner, 'https://www.lojasrenner.com.br/p/camiseta-masculina-basica-em-algodao/-/A-549102931-br', 'Camiseta Masculina Básica na Renner', 39.90, 59.90, 'in_stock', 0.00, TRUE),
    (v_prod_hering_tshirt, v_store_cea, 'https://www.cea.com.br/camiseta-masculina-basica-gola-careca-manga-curta-algodao-preta-9971029-preto/p', 'Camiseta Masculina Básica na C&A', 45.99, 69.90, 'in_stock', 0.00, TRUE),
    (v_prod_hering_tshirt, v_store_ml, 'https://www.mercadolivre.com.br/camiseta-masculina-basica-hering-100-algodao/p/MLB19203940', 'Camiseta Hering 100% Algodão no Mercado Livre', 47.90, 69.90, 'in_stock', 0.00, TRUE),
    (v_prod_hering_tshirt, v_store_hering, 'https://www.hering.com.br/camiseta-masculina-manga-curta-em-malha-de-algodao-04711asn/p', 'Camiseta Masculina Algodão Hering Loja Oficial', 49.99, 69.90, 'in_stock', 0.00, TRUE),
    (v_prod_hering_tshirt, v_store_amazon, 'https://www.amazon.com.br/dp/B07X81920K', 'Camiseta Masculina Hering 100% Algodão na Amazon', 52.90, 69.90, 'in_stock', 0.00, TRUE);

    -- ========================================================
    -- PRODUTO 5: Sapato Social Democrata Air Casion Couro
    -- ========================================================
    INSERT INTO products (
        category_id, brand_id, name, slug, description,
        product_type, gender, size_value, size_unit, image_url
    ) VALUES (
        v_cat_calcados, v_brand_democrata,
        'Sapato Social Democrata Air Casion Masculino Couro',
        'sapato-social-democrata-air-casion-masculino-couro',
        'Sapato social em couro legítimo com tecnologia de amortecimento Air.',
        'Sapato Social', 'male', 41, 'br',
        'https://democrata.vtexassets.com/arquivos/ids/123456/sapato-democrata.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
    RETURNING id INTO v_prod_democrata_shoe;

    -- Identificador EAN
    INSERT INTO product_identifiers (product_id, identifier_type, identifier_value)
    VALUES (v_prod_democrata_shoe, 'ean', '7899876543210')
    ON CONFLICT (identifier_type, identifier_value) DO NOTHING;

    -- 5 Ofertas Diretas para Sapato Democrata
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES
    (v_prod_democrata_shoe, v_store_democrata, 'https://www.democrata.com.br/sapato-social-democrata-air-casion-couro-preto/p', 'Sapato Democrata Air Casion Couro Loja Oficial', 279.90, 349.90, 'in_stock', 0.00, TRUE),
    (v_prod_democrata_shoe, v_store_ferracini, 'https://www.ferracini.com.br/sapato-social-masculino-couro-preto/p', 'Sapato Social Couro Noir Ferracini', 289.90, 359.90, 'in_stock', 0.00, TRUE),
    (v_prod_democrata_shoe, v_store_dafiti, 'https://www.dafiti.com.br/Sapato-Social-Democrata-Air-Casion-Couro-8948123.html', 'Sapato Social Democrata Air Casion na Dafiti', 299.90, 359.90, 'in_stock', 0.00, TRUE),
    (v_prod_democrata_shoe, v_store_netshoes, 'https://www.netshoes.com.br/sapato-social-democrata-air-casion-couro-noir-D24-8192-006', 'Sapato Social Democrata Couro na Netshoes', 319.90, 359.90, 'in_stock', 0.00, TRUE),
    (v_prod_democrata_shoe, v_store_ml, 'https://www.mercadolivre.com.br/sapato-social-democrata-air-casion-couro/p/MLB28194012', 'Sapato Social Democrata Air Casion no Mercado Livre', 339.90, 359.90, 'in_stock', 0.00, TRUE);

END $$;

