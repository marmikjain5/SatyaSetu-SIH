-- ====================================================================
-- SatyaDrishti PostgreSQL Database Schema
-- National Legal Metrology & Consumer Protection Intelligence System
-- ====================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MANUFACTURERS TABLE
CREATE TABLE IF NOT EXISTS manufacturers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cin VARCHAR(32) UNIQUE,
    gstin VARCHAR(32) UNIQUE,
    registered_address TEXT,
    risk_tier VARCHAR(32) NOT NULL DEFAULT 'Moderate', -- Critical, High, Moderate, Low
    risk_score INTEGER NOT NULL DEFAULT 50, -- 0 to 100
    repeat_offender_flag BOOLEAN NOT NULL DEFAULT FALSE,
    total_products_scanned INTEGER NOT NULL DEFAULT 0,
    active_violations INTEGER NOT NULL DEFAULT 0,
    notices_issued INTEGER NOT NULL DEFAULT 0,
    brands JSONB DEFAULT '[]'::jsonb,
    top_offense_types JSONB DEFAULT '[]'::jsonb,
    last_audit_date VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON manufacturers(name);
CREATE INDEX IF NOT EXISTS idx_manufacturers_cin ON manufacturers(cin);
CREATE INDEX IF NOT EXISTS idx_manufacturers_risk ON manufacturers(risk_tier, risk_score);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    manufacturer_id VARCHAR(64) REFERENCES manufacturers(id) ON DELETE SET NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    country_of_origin VARCHAR(128) NOT NULL DEFAULT 'India',
    mrp NUMERIC(12, 2) NOT NULL,
    listed_price NUMERIC(12, 2) NOT NULL,
    net_weight VARCHAR(128) NOT NULL,
    platform VARCHAR(64) NOT NULL, -- Amazon, Flipkart, Blinkit, Zepto, Meesho, Nykaa, etc.
    product_url TEXT,
    image_url TEXT,
    status VARCHAR(64) NOT NULL DEFAULT 'compliant', -- compliant, non-compliant, under-review, notice-issued
    compliance_score INTEGER NOT NULL DEFAULT 100, -- 0 to 100
    ocr_confidence NUMERIC(5, 2) NOT NULL DEFAULT 95.0,
    fssai_license_number VARCHAR(64),
    ingredients_list JSONB DEFAULT '[]'::jsonb,
    nutritional_info JSONB DEFAULT '{}'::jsonb,
    customer_care_contact TEXT,
    dietary_type VARCHAR(64) DEFAULT 'Vegetarian', -- Vegetarian, Non-Vegetarian, Exempt
    claims JSONB DEFAULT '[]'::jsonb,
    missing_mandatory_fields JSONB DEFAULT '[]'::jsonb,
    regulatory_acts JSONB DEFAULT '[]'::jsonb,
    last_scanned VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 3. OCR SCANS & EXTRACTED TEXT TABLE
CREATE TABLE IF NOT EXISTS ocr_scans (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    raw_extracted_text TEXT NOT NULL,
    cleaned_text TEXT,
    ocr_engine VARCHAR(64) DEFAULT 'Tesseract.js v5 / Vision OCR',
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    extracted_parameters JSONB DEFAULT '{}'::jsonb, -- declared_mrp, net_quantity, mfg_date, expiry, usp
    bounding_boxes JSONB DEFAULT '[]'::jsonb,
    readability_scores JSONB DEFAULT '{}'::jsonb, -- font_size_mm, contrast_ratio, visibility_score
    status VARCHAR(32) NOT NULL DEFAULT 'completed', -- completed, processing, failed
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ocr_scans_product ON ocr_scans(product_id);
CREATE INDEX IF NOT EXISTS idx_ocr_scans_timestamp ON ocr_scans(scan_timestamp);

-- 4. VIOLATIONS & STATUTORY ENFORCEMENT LEDGER TABLE
CREATE TABLE IF NOT EXISTS violations (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(64) UNIQUE NOT NULL, -- e.g. CCPA/ENF/2025/NZ-0104
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    manufacturer_id VARCHAR(64) REFERENCES manufacturers(id) ON DELETE SET NULL,
    product_name VARCHAR(500) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    platform VARCHAR(64) NOT NULL,
    rule_code VARCHAR(64) NOT NULL, -- e.g. PCR-2011-R6(1)(a)
    section VARCHAR(255) NOT NULL,
    act_name VARCHAR(255) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
    description TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb, -- extracted_value, expected_standard, bounding_box
    penalty_estimate NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    status VARCHAR(64) NOT NULL DEFAULT 'Open', -- Open, Notice Issued, Hearing Scheduled, Resolved
    notice_id VARCHAR(64),
    assigned_officer VARCHAR(255) NOT NULL DEFAULT 'Zonal Compliance Officer',
    detected_at VARCHAR(64),
    resolved_at VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_violations_case ON violations(case_number);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity);
CREATE INDEX IF NOT EXISTS idx_violations_rule ON violations(rule_code);

-- 5. REGULATORY RULES TABLE (Gazette-Verified Statutory Rules)
-- ┌──────────────────────────────────────────────────────────────────────────────────────────┐
-- │ This table stores the ground-truth, gazette-verified statutory rules used by the backend │
-- │ validation engine. The frontend ragKnowledgeService.ts is a SEPARATE demo layer for      │
-- │ showing live rule ingestion and does NOT replace this table.                             │
-- └──────────────────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE IF NOT EXISTS regulatory_rules (
    id VARCHAR(64) PRIMARY KEY,                             -- e.g. "PCR-R6-1A"
    rule_code VARCHAR(128) UNIQUE NOT NULL,                 -- e.g. "PCR-2011-R6(1)(a)"
    act_name VARCHAR(255) NOT NULL,                         -- Full statutory act name
    section_clause VARCHAR(128) NOT NULL,                   -- Specific rule/section
    target_field VARCHAR(64) NOT NULL,                      -- OCR field key this rule evaluates
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    -- Product category scope: ALL, FOOD, COSMETICS, ELECTRONICS, APPAREL, NUTRACEUTICALS
    category_scope VARCHAR(64) NOT NULL DEFAULT 'ALL',
    -- Structured validation specification (thresholds, format regex, conditions, etc.)
    validation_spec JSONB NOT NULL DEFAULT '{}'::jsonb,
    severity VARCHAR(32) NOT NULL DEFAULT 'CRITICAL',       -- CRITICAL, HIGH, MEDIUM, LOW
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    is_conditional BOOLEAN NOT NULL DEFAULT FALSE,
    condition_description TEXT,
    min_fine_inr NUMERIC(12, 2) NOT NULL DEFAULT 25000,
    max_fine_inr NUMERIC(12, 2) NOT NULL DEFAULT 100000,
    imprisonment_months INTEGER NOT NULL DEFAULT 0,
    -- Gazette provenance
    gazette_notification_no VARCHAR(128),                   -- e.g. "G.S.R. 882(E)"
    gazette_date VARCHAR(64),                               -- Gazette publication date
    effective_from DATE NOT NULL,
    effective_to DATE,                                      -- NULL = currently active
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rules_target_field ON regulatory_rules(target_field);
CREATE INDEX IF NOT EXISTS idx_rules_active ON regulatory_rules(is_active, effective_from);
CREATE INDEX IF NOT EXISTS idx_rules_category ON regulatory_rules(category_scope);
CREATE INDEX IF NOT EXISTS idx_rules_severity ON regulatory_rules(severity);

-- 6. CONSUMER COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) UNIQUE NOT NULL, -- e.g. GRV-2025-0811
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    consumer_name VARCHAR(255) NOT NULL,
    consumer_email VARCHAR(255) NOT NULL,
    consumer_phone VARCHAR(64),
    product_name VARCHAR(500) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    platform VARCHAR(64) NOT NULL,
    order_number VARCHAR(64),
    product_url TEXT,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    ai_matched_rule VARCHAR(255),
    status VARCHAR(64) NOT NULL DEFAULT 'New', -- New, Triaged, Investigation, Notice Dispatched, Resolved
    sentiment_score NUMERIC(5, 2) DEFAULT 0.85,
    needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    extracted_evidence_summary JSONB DEFAULT '{}'::jsonb,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    assigned_officer VARCHAR(255),
    officer_decision_history JSONB DEFAULT '[]'::jsonb,
    submitted_at VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_ticket ON complaints(ticket_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(consumer_email);
