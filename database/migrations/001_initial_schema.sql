-- ============================================================
-- ELITE BOT
-- Migration: 001_initial_schema
-- Database: PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'product_gender'
    ) THEN
        CREATE TYPE product_gender AS ENUM (
            'male',
            'female',
            'unisex'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'availability_status'
    ) THEN
        CREATE TYPE availability_status AS ENUM (
            'in_stock',
            'out_of_stock',
            'pre_order',
            'unknown'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'identifier_type'
    ) THEN
        CREATE TYPE identifier_type AS ENUM (
            'ean',
            'gtin',
            'sku',
            'mpn',
            'brand_sku'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'match_type'
    ) THEN
        CREATE TYPE match_type AS ENUM (
            'ean',
            'gtin',
            'sku',
            'exact',
            'semantic',
            'manual'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'deal_classification'
    ) THEN
        CREATE TYPE deal_classification AS ENUM (
            'excellent',
            'good',
            'normal',
            'expensive'
        );
    END IF;
END $$;


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- BRANDS
-- ============================================================

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID REFERENCES categories(id)
        ON DELETE SET NULL,

    brand_id UUID REFERENCES brands(id)
        ON DELETE SET NULL,

    name VARCHAR(300) NOT NULL,
    slug VARCHAR(340) NOT NULL UNIQUE,

    description TEXT,

    product_type VARCHAR(100),

    gender product_gender NOT NULL DEFAULT 'male',

    size_value NUMERIC(12,3),
    size_unit VARCHAR(30),

    image_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- PRODUCT IDENTIFIERS
-- ============================================================

CREATE TABLE IF NOT EXISTS product_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    identifier_type identifier_type NOT NULL,
    identifier_value VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_product_identifier
        UNIQUE (identifier_type, identifier_value)
);


-- ============================================================
-- STORES
-- ============================================================

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,

    domain VARCHAR(255) NOT NULL,

    logo_url TEXT,

    affiliate_network VARCHAR(100),
    affiliate_base_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- OFFERS
-- ============================================================

CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    store_id UUID NOT NULL
        REFERENCES stores(id)
        ON DELETE CASCADE,

    external_product_id VARCHAR(255),

    product_url TEXT NOT NULL,
    affiliate_url TEXT,

    title VARCHAR(500),

    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),

    currency CHAR(3) NOT NULL DEFAULT 'BRL',

    availability availability_status
        NOT NULL DEFAULT 'unknown',

    seller_name VARCHAR(255),

    shipping_price NUMERIC(12,2)
        NOT NULL DEFAULT 0,

    last_checked_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_offer_price
        CHECK (price >= 0),

    CONSTRAINT chk_offer_original_price
        CHECK (
            original_price IS NULL
            OR original_price >= 0
        ),

    CONSTRAINT chk_offer_shipping
        CHECK (shipping_price >= 0)
);


-- ============================================================
-- PRICE HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    offer_id UUID NOT NULL
        REFERENCES offers(id)
        ON DELETE CASCADE,

    price NUMERIC(12,2) NOT NULL,

    original_price NUMERIC(12,2),

    shipping_price NUMERIC(12,2)
        NOT NULL DEFAULT 0,

    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_history_price
        CHECK (price >= 0),

    CONSTRAINT chk_history_shipping
        CHECK (shipping_price >= 0)
);


-- ============================================================
-- PRODUCT MATCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS product_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    offer_id UUID NOT NULL
        REFERENCES offers(id)
        ON DELETE CASCADE,

    match_type match_type NOT NULL,

    confidence NUMERIC(5,4)
        NOT NULL DEFAULT 0,

    verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_match_confidence
        CHECK (
            confidence >= 0
            AND confidence <= 1
        ),

    CONSTRAINT uq_product_offer_match
        UNIQUE (product_id, offer_id)
);


-- ============================================================
-- DEAL SCORES
-- ============================================================

CREATE TABLE IF NOT EXISTS deal_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    offer_id UUID NOT NULL
        REFERENCES offers(id)
        ON DELETE CASCADE,

    score NUMERIC(5,2) NOT NULL,

    classification deal_classification NOT NULL,

    current_price NUMERIC(12,2) NOT NULL,

    average_price NUMERIC(12,2),

    lowest_price NUMERIC(12,2),

    discount_percentage NUMERIC(7,2),

    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_deal_score
        CHECK (
            score >= 0
            AND score <= 100
        )
);


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    display_name VARCHAR(160),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    target_price NUMERIC(12,2) NOT NULL,

    currency CHAR(3) NOT NULL DEFAULT 'BRL',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_triggered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_alert_target_price
        CHECK (target_price >= 0)
);


-- ============================================================
-- AFFILIATE CLICKS
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    offer_id UUID NOT NULL
        REFERENCES offers(id)
        ON DELETE CASCADE,

    source VARCHAR(50) NOT NULL,

    campaign VARCHAR(150),

    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category
    ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_brand
    ON products(brand_id);

CREATE INDEX IF NOT EXISTS idx_products_type
    ON products(product_type);

CREATE INDEX IF NOT EXISTS idx_products_gender
    ON products(gender);

CREATE INDEX IF NOT EXISTS idx_identifiers_product
    ON product_identifiers(product_id);

CREATE INDEX IF NOT EXISTS idx_identifiers_value
    ON product_identifiers(identifier_value);

CREATE INDEX IF NOT EXISTS idx_offers_product
    ON offers(product_id);

CREATE INDEX IF NOT EXISTS idx_offers_store
    ON offers(store_id);

CREATE INDEX IF NOT EXISTS idx_offers_price
    ON offers(price);

CREATE INDEX IF NOT EXISTS idx_offers_active
    ON offers(is_active);

CREATE INDEX IF NOT EXISTS idx_offers_product_active_price
    ON offers(product_id, is_active, price);

CREATE INDEX IF NOT EXISTS idx_price_history_offer
    ON price_history(offer_id);

CREATE INDEX IF NOT EXISTS idx_price_history_captured
    ON price_history(captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_matches_product
    ON product_matches(product_id);

CREATE INDEX IF NOT EXISTS idx_matches_offer
    ON product_matches(offer_id);

CREATE INDEX IF NOT EXISTS idx_deal_scores_offer
    ON deal_scores(offer_id);

CREATE INDEX IF NOT EXISTS idx_deal_scores_calculated
    ON deal_scores(calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_user
    ON alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_product
    ON alerts(product_id);

CREATE INDEX IF NOT EXISTS idx_alerts_active
    ON alerts(is_active);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_offer
    ON affiliate_clicks(offer_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user
    ON affiliate_clicks(user_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date
    ON affiliate_clicks(clicked_at DESC);


-- ============================================================
-- VIEWS
-- ============================================================

-- ============================================================
-- BEST PRODUCT OFFERS
-- ============================================================

CREATE OR REPLACE VIEW best_product_offers AS
SELECT
    o.product_id,
    o.id AS offer_id,
    o.store_id,
    s.name AS store_name,
    s.domain AS store_domain,

    o.price,
    o.shipping_price,

    (o.price + o.shipping_price) AS total_price,

    o.currency,
    o.availability,

    o.product_url,
    o.affiliate_url,

    ds.score,
    ds.classification,

    o.last_checked_at

FROM offers o

JOIN stores s
    ON s.id = o.store_id

LEFT JOIN LATERAL (
    SELECT
        d.score,
        d.classification
    FROM deal_scores d
    WHERE d.offer_id = o.id
    ORDER BY d.calculated_at DESC
    LIMIT 1
) ds ON TRUE

WHERE
    o.is_active = TRUE
    AND s.is_active = TRUE;


-- ============================================================
-- PRODUCT PRICE HISTORY
-- ============================================================

CREATE OR REPLACE VIEW product_price_history AS
SELECT
    p.id AS product_id,
    p.name AS product_name,

    o.id AS offer_id,
    s.id AS store_id,
    s.name AS store_name,

    ph.price,
    ph.original_price,
    ph.shipping_price,

    (ph.price + ph.shipping_price) AS total_price,

    ph.captured_at

FROM price_history ph

JOIN offers o
    ON o.id = ph.offer_id

JOIN products p
    ON p.id = o.product_id

JOIN stores s
    ON s.id = o.store_id;


-- ============================================================
-- PRODUCT DEAL SUMMARY
-- ============================================================

CREATE OR REPLACE VIEW product_deal_summary AS

WITH offer_stats AS (

    SELECT
        o.product_id,

        MIN(o.price + o.shipping_price)
            AS current_best_price,

        AVG(o.price + o.shipping_price)
            AS current_average_price

    FROM offers o

    WHERE o.is_active = TRUE

    GROUP BY o.product_id
),

history_stats AS (

    SELECT
        o.product_id,

        AVG(ph.price + ph.shipping_price)
            AS historical_average_price,

        MIN(ph.price + ph.shipping_price)
            AS historical_lowest_price

    FROM price_history ph

    JOIN offers o
        ON o.id = ph.offer_id

    GROUP BY o.product_id
),

best_score AS (

    SELECT DISTINCT ON (o.product_id)

        o.product_id,

        ds.score,
        ds.classification

    FROM offers o

    JOIN deal_scores ds
        ON ds.offer_id = o.id

    ORDER BY
        o.product_id,
        ds.score DESC,
        ds.calculated_at DESC
)

SELECT
    os.product_id,

    os.current_best_price,

    COALESCE(
        hs.historical_average_price,
        os.current_average_price
    ) AS average_price,

    hs.historical_lowest_price
        AS lowest_price,

    bs.score,
    bs.classification

FROM offer_stats os

LEFT JOIN history_stats hs
    ON hs.product_id = os.product_id

LEFT JOIN best_score bs
    ON bs.product_id = os.product_id;


-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories (name, slug)
VALUES
    ('Perfumes', 'perfumes'),
    ('Skincare', 'skincare'),
    ('Roupas', 'roupas')
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- TRIGGER: UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_categories_updated_at
ON categories;

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS trg_brands_updated_at
ON brands;

CREATE TRIGGER trg_brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS trg_products_updated_at
ON products;

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS trg_stores_updated_at
ON stores;

CREATE TRIGGER trg_stores_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS trg_offers_updated_at
ON offers;

CREATE TRIGGER trg_offers_updated_at
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS trg_users_updated_at
ON users;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS trg_alerts_updated_at
ON alerts;

CREATE TRIGGER trg_alerts_updated_at
BEFORE UPDATE ON alerts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();