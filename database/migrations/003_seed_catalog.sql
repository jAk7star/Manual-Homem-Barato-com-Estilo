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
    v_store_hering UUID;
    v_store_democrata UUID;

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
    SELECT id INTO v_store_hering FROM stores WHERE slug = 'hering';
    SELECT id INTO v_store_democrata FROM stores WHERE slug = 'democrata';

    -- Limpa ofertas de teste antigas sem imagem
    DELETE FROM offers WHERE product_id IN (SELECT id FROM products WHERE image_url IS NULL);
    DELETE FROM products WHERE image_url IS NULL;

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

    -- Oferta Amazon Brasil
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_asad, v_store_amazon,
        'https://www.amazon.com.br/s?k=lattafa+asad+100ml',
        'Asad Lattafa Eau de Parfum Masculino 100ml na Amazon',
        179.90, 220.00, 'in_stock', 0.00, TRUE
    );

    -- Oferta Mercado Livre
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_asad, v_store_ml,
        'https://lista.mercadolivre.com.br/lattafa-asad-100ml',
        'Asad Lattafa EDP 100ml no Mercado Livre',
        189.90, 220.00, 'in_stock', 0.00, TRUE
    );

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

    -- Oferta O Boticário
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_malbec, v_store_bot,
        'https://www.boticario.com.br/busca?q=malbec+desodorante+colonia+100ml',
        'Malbec Desodorante Colônia 100ml',
        189.90, 209.90, 'in_stock', 0.00, TRUE
    );

    -- Oferta Beleza na Web
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_malbec, v_store_bnw,
        'https://www.belezanaweb.com.br/busca?q=malbec+o+boticario+100ml',
        'Malbec O Boticário Desodorante Colônia - Perfume Masculino 100ml',
        179.90, 209.90, 'in_stock', 0.00, TRUE
    );

    -- Oferta Amazon
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_malbec, v_store_amazon,
        'https://www.amazon.com.br/s?k=malbec+o+boticario+100ml',
        'Malbec O Boticário 100ml na Amazon',
        174.90, 209.90, 'in_stock', 0.00, TRUE
    );

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

    -- Oferta Natura
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_kaiak, v_store_nat,
        'https://www.natura.com.br/busca?q=kaiak+masculino+100ml',
        'Desodorante Colônia Kaiak Masculino 100ml',
        149.90, 179.90, 'in_stock', 0.00, TRUE
    );

    -- Oferta Mercado Livre
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_kaiak, v_store_ml,
        'https://lista.mercadolivre.com.br/kaiak-masculino-100ml',
        'Kaiak Masculino 100ml no Mercado Livre',
        119.90, 179.90, 'in_stock', 0.00, TRUE
    );

    -- ========================================================
    -- PRODUTO 4: Nivea Men Sensitive Bálsamo Pós-Barba 100ml
    -- ========================================================
    INSERT INTO products (
        category_id, brand_id, name, slug, description,
        product_type, gender, size_value, size_unit, image_url
    ) VALUES (
        v_cat_skincare, v_brand_nivea,
        'Nivea Men Sensitive Bálsamo Pós-Barba 100ml',
        'nivea-men-sensitive-balsamo-pos-barba-100ml',
        'Alívio imediato para peles sensíveis contra irritação e vermelhidão.',
        'Bálsamo Pós-Barba', 'male', 100, 'ml',
        'https://res.cloudinary.com/beleza-na-web/image/upload/f_auto,fl_progressive,q_auto/v1/imagens/products/NIVEA_POS_BARBA.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
    RETURNING id INTO v_prod_nivea_balm;

    -- Identificador EAN
    INSERT INTO product_identifiers (product_id, identifier_type, identifier_value)
    VALUES (v_prod_nivea_balm, 'ean', '7891051004128')
    ON CONFLICT (identifier_type, identifier_value) DO NOTHING;

    -- Oferta Beleza na Web
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_nivea_balm, v_store_bnw,
        'https://www.belezanaweb.com.br/busca?q=nivea+men+sensitive+pos+barba',
        'Nivea Men Sensitive Bálsamo Pós-Barba 100ml',
        34.90, 42.90, 'in_stock', 0.00, TRUE
    );

    -- ========================================================
    -- PRODUTO 5: Camiseta Masculina Básica Hering Algodão
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

    -- Oferta Hering
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_hering_tshirt, v_store_hering,
        'https://www.hering.com.br/busca?q=camiseta+masculina+algodao',
        'Camiseta Masculina Manga Curta em Malha de Algodão Hering',
        49.99, 69.99, 'in_stock', 0.00, TRUE
    );

    -- ========================================================
    -- PRODUTO 6: Sapato Social Democrata Air Casion Couro
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

    -- Oferta Democrata
    INSERT INTO offers (
        product_id, store_id, product_url, title, price, original_price, availability, shipping_price, is_active
    ) VALUES (
        v_prod_democrata_shoe, v_store_democrata,
        'https://www.democrata.com.br/busca?q=sapato+democrata+air+casion',
        'Sapato Democrata Air Casion Couro Masculino',
        279.90, 349.90, 'in_stock', 0.00, TRUE
    );

END $$;
