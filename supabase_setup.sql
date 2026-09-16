-- ====================================================================
-- SatyaDrishti Supabase Master SQL Setup Script
-- Paste and run this ENTIRE script in Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- ====================================================================

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



-- ====================================================================
-- SEED DATA INSERT STATEMENTS
-- ====================================================================

-- ====================================================
-- SEED DATA: MANUFACTURERS (5 records)
-- ====================================================
INSERT INTO manufacturers (id, name, cin, gstin, registered_address, risk_tier, risk_score, repeat_offender_flag, total_products_scanned, active_violations, notices_issued, brands, top_offense_types, last_audit_date) VALUES ('mfg-1', 'NutriPro Labs Pvt Ltd', 'U24233MH2016PTC284910', '27AABCN8891P1ZX', 'Plot 44, Industrial Area, Phase II, Andheri East, Mumbai, Maharashtra 400093', 'Critical', 88, True, 24, 6, 5, '["NutriPro", "MaxGain", "PureWhey"]'::jsonb, '["Weight Deficit", "Misleading Protein Claims", "Origin Obfuscation"]'::jsonb, '2025-02-24') ON CONFLICT (id) DO NOTHING;
INSERT INTO manufacturers (id, name, cin, gstin, registered_address, risk_tier, risk_score, repeat_offender_flag, total_products_scanned, active_violations, notices_issued, brands, top_offense_types, last_audit_date) VALUES ('mfg-2', 'Tata Consumer Products Limited', 'L15491WB1962PLC031426', '19AABCT3421M1Z5', '1, Bishop Lefroy Road, Kolkata, West Bengal 700020', 'Low', 12, False, 142, 0, 0, '["Tata Tea", "Tata Salt", "Sampann"]'::jsonb, '[]'::jsonb, '2025-02-20') ON CONFLICT (id) DO NOTHING;
INSERT INTO manufacturers (id, name, cin, gstin, registered_address, risk_tier, risk_score, repeat_offender_flag, total_products_scanned, active_violations, notices_issued, brands, top_offense_types, last_audit_date) VALUES ('mfg-3', 'OptiMax Nutrition Formulations', 'U24231DL2018PTC339101', '07AABCO4412K1Z9', 'Sector 18, Udyog Vihar, Okhla Industrial Area, New Delhi 110020', 'Critical', 94, True, 18, 8, 7, '["OptiMax", "HyperMass"]'::jsonb, '["Severe Weight Deficit", "Dual MRP Stickers", "Missing Customer Care"]'::jsonb, '2025-02-26') ON CONFLICT (id) DO NOTHING;
INSERT INTO manufacturers (id, name, cin, gstin, registered_address, risk_tier, risk_score, repeat_offender_flag, total_products_scanned, active_violations, notices_issued, brands, top_offense_types, last_audit_date) VALUES ('mfg-4', 'Himalayan Organics Health Ltd', 'U24100HR2019PLC081234', '06AABCH5512R1Z2', 'Plot 12, Sector 29, Gurugram, Haryana 122001', 'High', 68, False, 36, 3, 2, '["Himalayan Organics", "NatureFit"]'::jsonb, '["Font Size Deficit on PDP", "Unsubstantiated Timeline Claims"]'::jsonb, '2025-02-18') ON CONFLICT (id) DO NOTHING;
INSERT INTO manufacturers (id, name, cin, gstin, registered_address, risk_tier, risk_score, repeat_offender_flag, total_products_scanned, active_violations, notices_issued, brands, top_offense_types, last_audit_date) VALUES ('mfg-5', 'Imagine Marketing Ltd (boAt Lifestyle)', 'U51909MH2013PLC240030', '27AABCI6677K1Z4', 'Unit 501, 5th Floor, Trade World, Kamala Mills, Lower Parel, Mumbai 400013', 'High', 62, False, 88, 4, 3, '["boAt"]'::jsonb, '["Country of Origin Font Visibility", "Importer Details Missing"]'::jsonb, '2025-02-22') ON CONFLICT (id) DO NOTHING;

-- ====================================================
-- SEED DATA: PRODUCTS (4 records)
-- ====================================================
INSERT INTO products (id, sku, title, brand, category, manufacturer_id, manufacturer_name, country_of_origin, mrp, listed_price, net_weight, platform, product_url, image_url, status, compliance_score, ocr_confidence, fssai_license_number, ingredients_list, nutritional_info, customer_care_contact, dietary_type, claims, missing_mandatory_fields, regulatory_acts, last_scanned) VALUES ('prod-1', 'SKU-AMZ-NUTR-991', 'NutriPro 100% Gold Whey Protein Isolate - 2kg Double Rich Chocolate', 'NutriPro', 'Nutritional Supplements & Health Foods', 'mfg-1', 'NutriPro Labs Pvt Ltd', 'India', 4999.0, 3499.0, '2 kg (Found: 1.84 kg)', 'Amazon', 'https://amazon.in/dp/B08NUTR991', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 'non-compliant', 42, 98.4, '11521999000142', '["Whey Protein Isolate", "Cocoa Powder", "Soy Lecithin", "Natural Flavors", "Sucralose"]'::jsonb, '{"perUnit": "Per 100g", "energyKcal": "380 kcal", "protein": "74.0g (Declared 82g)", "carbohydrates": "6.2g", "addedSugars": "0.0g", "totalFat": "2.4g", "sodium": "180mg"}'::jsonb, 'support@nutriprolabs.in / +91-22-28491000', 'Vegetarian', '[{"text": "100% Whey Protein Isolate", "isMisleading": true, "reason": "Found protein content 74g vs declared 82g"}, {"text": "Zero Added Sugar", "isMisleading": false}]'::jsonb, '["Unit Sale Price (USP)", "Packer Address"]'::jsonb, '["Legal Metrology Act, 2009 Sec 36(1)", "Packaged Commodities Rules 2011 Rule 6(1)(e)"]'::jsonb, 'Today at 10:14 AM') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, sku, title, brand, category, manufacturer_id, manufacturer_name, country_of_origin, mrp, listed_price, net_weight, platform, product_url, image_url, status, compliance_score, ocr_confidence, fssai_license_number, ingredients_list, nutritional_info, customer_care_contact, dietary_type, claims, missing_mandatory_fields, regulatory_acts, last_scanned) VALUES ('prod-2', 'SKU-FLP-ELEC-442', 'AeroBass Pro 500 Wireless ANC Earbuds with Spatial Audio (Midnight Black)', 'boAt', 'Consumer Electronics & Peripherals', 'mfg-5', 'Imagine Marketing Ltd (boAt Lifestyle)', 'PRC (Listed falsely as Made in India)', 2999.0, 1299.0, '1 Unit (52g)', 'Flipkart', 'https://flipkart.com/aerobass-pro-500', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 'notice-issued', 31, 99.1, NULL, '[]'::jsonb, '{}'::jsonb, 'care@boat-lifestyle.com / 022-69181920', 'Exempt', '[{"text": "Made in India", "isMisleading": true, "reason": "Barcode and packaging inspection proves Country of Origin: PRC"}]'::jsonb, '["Importer Name & Address", "Country of Origin on PDP"]'::jsonb, '["Legal Metrology Rules 2011 Rule 6(1)(a)", "Consumer Protection (E-Commerce) Rules 2020"]'::jsonb, 'Today at 09:45 AM') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, sku, title, brand, category, manufacturer_id, manufacturer_name, country_of_origin, mrp, listed_price, net_weight, platform, product_url, image_url, status, compliance_score, ocr_confidence, fssai_license_number, ingredients_list, nutritional_info, customer_care_contact, dietary_type, claims, missing_mandatory_fields, regulatory_acts, last_scanned) VALUES ('prod-3', 'SKU-BLK-GROC-109', 'Tata Sampann Organic Unpolished Toor Dal (Yellow Pigeon Peas) - 1kg', 'Tata Sampann', 'Edible Oils & FMCG Groceries', 'mfg-2', 'Tata Consumer Products Limited', 'India', 195.0, 172.0, '1 kg (1000g)', 'Blinkit', 'https://blinkit.com/prn/tata-sampann-toor-dal', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', 'compliant', 98, 99.8, '10014031001025', '["100% Organic Unpolished Toor Dal (Pigeon Peas)"]'::jsonb, '{"perUnit": "Per 100g", "energyKcal": "343 kcal", "protein": "22.3g", "carbohydrates": "62.8g", "addedSugars": "0.0g", "totalFat": "1.5g", "sodium": "28mg"}'::jsonb, 'feedback@tataconsumer.com / 1800-108-4488', 'Vegetarian', '[{"text": "100% Unpolished Organic", "isMisleading": false}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'Today at 08:30 AM') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, sku, title, brand, category, manufacturer_id, manufacturer_name, country_of_origin, mrp, listed_price, net_weight, platform, product_url, image_url, status, compliance_score, ocr_confidence, fssai_license_number, ingredients_list, nutritional_info, customer_care_contact, dietary_type, claims, missing_mandatory_fields, regulatory_acts, last_scanned) VALUES ('prod-4', 'SKU-ZPT-COSM-774', 'Himalayan Organics Bhringraj & Red Onion Anti-Hairfall Nourishing Hair Oil 200ml', 'Himalayan Organics', 'Cosmetics & Personal Care', 'mfg-4', 'Himalayan Organics Health Ltd', 'India', 599.0, 389.0, '200 ml', 'Zepto', 'https://zepto.in/p/himalayan-organics-hair-oil', 'https://images.unsplash.com/photo-1608248597359-00995166f281?w=600', 'under-review', 58, 96.2, '10819005000214', '["Red Onion Extract", "Bhringraj Oil", "Sesame Seed Oil", "Coconut Oil", "Vitamin E"]'::jsonb, '{}'::jsonb, 'care@thehimalayanorganics.com / 1800-889-1002', 'Vegetarian', '[{"text": "100% Stops Hair Fall in 7 Days", "isMisleading": true, "reason": "Unsubstantiated timeline clinical claim"}]'::jsonb, '["Batch Number Font Size < 1mm", "Best Before Clear Date Format"]'::jsonb, '["Legal Metrology (Packaged Commodities) Rules 2011 Rule 9", "Consumer Protection Act 2019 (Misleading Advertisements)"]'::jsonb, 'Today at 09:12 AM') ON CONFLICT (id) DO NOTHING;

-- ====================================================
-- SEED DATA: OCR_SCANS (2 records)
-- ====================================================
INSERT INTO ocr_scans (id, product_id, image_url, raw_extracted_text, cleaned_text, ocr_engine, confidence_score, extracted_parameters, bounding_boxes, readability_scores, status) VALUES ('scan-101', 'prod-1', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 'NUTRIPRO 100% GOLD WHEY NET WT 2KG MRP RS 4999 INCL OF ALL TAXES MFD 01/2025 EXP 01/2027 PKG WT 1.84KG', 'NutriPro 100% Gold Whey Protein Isolate. Net Weight 2kg. MRP: Rs 4999.00 (Incl. of all taxes). Actual weight: 1.84kg.', 'Tesseract.js v5 / DeepVision Metrology OCR', 98.4, '{"declared_mrp": 4999.0, "unit_sale_price": null, "net_quantity": "2 kg", "measured_weight": "1.84 kg", "manufacturer": "NutriPro Labs Pvt Ltd", "fssai_license": "11521999000142", "mfg_date": "2025-01-10"}'::jsonb, '[{"field": "MRP", "box": [120, 45, 240, 80], "confidence": 99.2}, {"field": "Net Quantity", "box": [310, 110, 430, 145], "confidence": 98.1}, {"field": "FSSAI Logo", "box": [500, 30, 580, 70], "confidence": 97.4}]'::jsonb, '{"min_font_size_mm": 0.85, "mandated_font_size_mm": 2.0, "contrast_ratio": 4.2, "visibility_score": 62}'::jsonb, 'completed') ON CONFLICT (id) DO NOTHING;
INSERT INTO ocr_scans (id, product_id, image_url, raw_extracted_text, cleaned_text, ocr_engine, confidence_score, extracted_parameters, bounding_boxes, readability_scores, status) VALUES ('scan-102', 'prod-2', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 'AEROBASS PRO 500 WIRELESS EARBUDS MRP 2999 MADE IN PRC IMPORTER IMAGINE MARKETING LTD BARCODE 8901234567890', 'AeroBass Pro 500 Wireless Earbuds. MRP: Rs 2999.00. Country of Origin: PRC. Importer: Imagine Marketing Ltd.', 'Tesseract.js v5 / DeepVision Metrology OCR', 99.1, '{"declared_mrp": 2999.0, "country_of_origin": "PRC", "importer": "Imagine Marketing Ltd", "barcode": "8901234567890"}'::jsonb, '[{"field": "Origin", "box": [40, 80, 150, 110], "confidence": 99.5}, {"field": "MRP", "box": [200, 30, 290, 65], "confidence": 98.9}]'::jsonb, '{"min_font_size_mm": 0.6, "mandated_font_size_mm": 1.5, "contrast_ratio": 3.1, "visibility_score": 45}'::jsonb, 'completed') ON CONFLICT (id) DO NOTHING;

-- ====================================================
-- SEED DATA: VIOLATIONS (2 records)
-- ====================================================
INSERT INTO violations (id, case_number, product_id, manufacturer_id, product_name, brand, manufacturer, platform, rule_code, section, act_name, severity, description, evidence, penalty_estimate, status, notice_id, assigned_officer, detected_at, resolved_at) VALUES ('viol-1', 'CCPA/ENF/2025/NZ-0104', 'prod-1', 'mfg-1', 'NutriPro 100% Gold Whey Protein Isolate - 2kg', 'NutriPro', 'NutriPro Labs Pvt Ltd', 'Amazon', 'PCR-2011-R6(1)(e)', 'Rule 6(1)(e) - Net Quantity Declarations & Maximum Permissible Error', 'Legal Metrology Act, 2009', 'critical', 'Physical label OCR measured container net weight at 1.84kg against declared 2.0kg. The 160g deficit (8%) significantly exceeds statutory MPE tolerance limits.', '{"extractedValue": "Net Weight found: 1.84 kg (8% deficit)", "expectedStandard": "2.0 kg \u00b1 1.5% maximum permissible error (MPE)", "ocrConfidence": 98.4, "screenshotUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600"}'::jsonb, 100000.0, 'Open', 'SCN-2025-0104', 'Inspector Rajesh Varma (North Zone)', '2025-02-26 10:14 IST', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO violations (id, case_number, product_id, manufacturer_id, product_name, brand, manufacturer, platform, rule_code, section, act_name, severity, description, evidence, penalty_estimate, status, notice_id, assigned_officer, detected_at, resolved_at) VALUES ('viol-2', 'CCPA/ENF/2025/WZ-0219', 'prod-2', 'mfg-5', 'AeroBass Pro 500 Wireless ANC Earbuds', 'boAt', 'Imagine Marketing Ltd (boAt Lifestyle)', 'Flipkart', 'PCR-2011-R6(1)(a)', 'Rule 6(1)(a) & E-Commerce Rules 2020 - Mandatory Country of Origin Disclosure', 'Legal Metrology Act, 2009', 'critical', 'Online PDP listing declared product Country of Origin as ''India'', whereas optical packaging barcode and importer declaration indicates ''PRC''.', '{"extractedValue": "Packaging barcode reads Country of Origin: PRC", "expectedStandard": "Accurate country of origin prominently displayed on digital catalog and outer packaging", "ocrConfidence": 99.1}'::jsonb, 50000.0, 'Notice Issued', 'SCN-2025-0219', 'Directorate General Enforcement Wing', '2025-02-25 16:30 IST', NULL) ON CONFLICT (id) DO NOTHING;

-- ====================================================
-- SEED DATA: REGULATORY_RULES (18 records)
-- ====================================================
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1A', 'PCR-2011-R6(1)(a)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 6(1)(a)', 'productName', 'Mandatory Generic/Common Name of Commodity', 'Every package shall bear the name of the commodity. The name shall be the generic or common name, not merely a brand name, and must be prominently displayed on the Principal Display Panel in legible characters.', 'ALL', '{"type": "text_presence", "min_length": 3, "must_be_generic": true, "placement": "PDP", "note": "Brand name alone is insufficient. Generic commodity name required."}'::jsonb, 'CRITICAL', True, False, NULL, 25000.0, 100000.0, 6, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1B', 'PCR-2011-R6(1)(b)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 6(1)(b) & Rule 11', 'netQuantity', 'Net Quantity in Standard Metric Units Only', 'The net quantity of the commodity contained in the package shall be declared in terms of standard units of measurement: weight (g or kg), volume (ml or l), or numerical count. Declaration in non-metric units (oz, lbs, fluid oz) is strictly prohibited under Rule 11 of the Legal Metrology Act, 2009.', 'ALL', '{"type": "net_quantity", "allowed_units": ["g", "kg", "ml", "l", "mg", "pieces", "units", "m", "cm"], "prohibited_units": ["oz", "lbs", "lb", "fluid oz", "fl oz", "pounds"], "mpe_table": {"comment": "Maximum Permissible Error \u2014 Schedule I, Legal Metrology (Packaged Commodities) Rules, 2011", "ranges_by_weight_g": [{"from": 0, "to": 50, "mpe_percent": 9.0}, {"from": 50, "to": 100, "mpe_percent": 4.5}, {"from": 100, "to": 200, "mpe_percent": 4.5}, {"from": 200, "to": 300, "mpe_percent": 9.0, "mpe_g": 9}, {"from": 300, "to": 500, "mpe_percent": 3.0}, {"from": 500, "to": 1000, "mpe_percent": 1.5}, {"from": 1000, "to": 10000, "mpe_percent": 1.5}, {"from": 10000, "to": 25000, "mpe_percent": 1.0}, {"from": 25000, "to": null, "mpe_percent": 0.5}]}}'::jsonb, 'CRITICAL', True, False, NULL, 25000.0, 100000.0, 6, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1C', 'PCR-2011-R6(1)(c)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 6(1)(c)', 'mrp', 'Maximum Retail Price (MRP) Declaration — Inclusive of All Taxes', 'The retail sale price of the pre-packaged commodity shall be declared as "Maximum Retail Price" or "MRP", inclusive of all taxes (including local taxes), in Indian Rupees. The declaration must read as: "MRP ₹ xx.xx (inclusive of all taxes)" or equivalent. Selling above the declared MRP is a cognizable offence under Rule 18(2).', 'ALL', '{"type": "mrp_format", "required_prefix": ["MRP", "Maximum Retail Price", "Max. Retail Price"], "required_tax_clause": ["inclusive of all taxes", "incl. of all taxes", "incl all taxes"], "currency": "INR", "currency_symbols": ["\u20b9", "Rs.", "Rs", "INR"], "must_be_positive": true}'::jsonb, 'CRITICAL', True, False, NULL, 25000.0, 100000.0, 6, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1AA', 'PCR-2022-R6(1)(aa)', 'Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2022)', 'Rule 6(1)(aa) — inserted by G.S.R. 779(E)', 'unitSalePrice', 'Mandatory Unit Sale Price (USP) Per g/ml', 'Every pre-packaged commodity must declare the Unit Sale Price (USP) per gram or per milliliter to enable price comparison. USP = MRP ÷ Net Quantity, rounded to 2 decimal places. Exemption: USP declaration is NOT required if the USP equals the MRP (e.g., a 1g product priced at ₹1). The font height of USP declaration must be at least 50% of the MRP font height.', 'ALL', '{"type": "unit_sale_price", "formula": "mrp / net_quantity_in_base_unit", "rounding_decimals": 2, "exemption": "USP equals MRP", "min_font_ratio_to_mrp": 0.5, "placement": "PDP, adjacent to MRP", "format": "\u20b9 X.XX per g  OR  \u20b9 X.XX per ml"}'::jsonb, 'HIGH', True, True, 'Not required if USP equals MRP (unit quantity = 1 base unit)', 25000.0, 100000.0, 6, 'G.S.R. 779(E)', '2022-10-28', '2023-01-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1D', 'PCR-2011-R6(1)(d)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 6(1)(d)', 'manufacturerAddress', 'Manufacturer / Packer / Importer Full Address', 'The name and complete address of the manufacturer or packer (or importer for imported commodities) must be declared. Address must include the street/plot, city or town, State, and 6-digit PIN Code. Registered office address alone is insufficient — the address of the manufacturing or packing premises is required.', 'ALL', '{"type": "address_format", "required_components": ["street_or_plot", "city", "state", "pin_code"], "pin_code_regex": "^[1-9][0-9]{5}$", "for_imports": "Importer name and Indian address required additionally"}'::jsonb, 'HIGH', True, False, NULL, 25000.0, 50000.0, 0, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1E', 'PCR-2011-R6(1)(e)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 6(1)(e)', 'manufacturingDate', 'Date of Manufacture / Packing / Import', 'The month and year in which the commodity is manufactured, packed, or imported must be declared on the package. Acceptable formats: MM/YYYY or Month YYYY (e.g., 03/2024 or MAR/2024). The declaration must be prefixed with "Mfg Date", "Date of Manufacture", "Pkg Date", or equivalent.', 'ALL', '{"type": "date_format", "accepted_formats": ["MM/YYYY", "MMM/YYYY", "DD/MM/YYYY", "Month YYYY"], "required_prefixes": ["Mfg Date", "Date of Manufacture", "Pkg Date", "Date of Packing", "Mfg.", "Mfd."], "must_not_be_future": true}'::jsonb, 'HIGH', True, False, NULL, 25000.0, 50000.0, 0, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1F', 'PCR-2011-R6(1)(f)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 6(1)(f)', 'customerCare', 'Consumer Care / Grievance Redressal Contact', 'The name, address, telephone number, and email address to be used for consumer complaints and redressal must be declared on the package. A toll-free number (prefix 1800) is strongly preferred but not mandated. Both a phone number and an active email address are required.', 'ALL', '{"type": "consumer_care", "required_fields": ["phone_or_tollfree", "email"], "phone_regex": "(1800[\\s\\-]?\\d{3}[\\s\\-]?\\d{3,4}|(?:\\+91[\\s\\-]?)?[6-9]\\d{4}[\\s\\-]?\\d{5})", "email_regex": "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"}'::jsonb, 'HIGH', True, False, NULL, 25000.0, 50000.0, 0, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R6-1N', 'PCR-2017-R6(1)(n)', 'Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2017)', 'Rule 6(1)(n) — inserted by G.S.R. 1537(E)', 'countryOfOrigin', 'Country of Origin / Manufacture Declaration', 'Name of the country of origin or manufacture must be declared on every pre-packaged commodity in prominent, clearly legible uppercase characters. For goods made from multiple countries, all countries must be declared. Statements such as "Made in India", "Country of Origin: INDIA" satisfy this requirement. Mislabelling or obfuscation is treated as a cognizable offence.', 'ALL', '{"type": "country_of_origin", "must_be_uppercase_or_prominent": true, "valid_declarations": ["Made in India", "Country of Origin: India", "Manufactured in India", "Product of India"], "for_imports": "Country name must match actual manufacturing country, obfuscation is offence"}'::jsonb, 'CRITICAL', True, False, NULL, 50000.0, 200000.0, 12, 'G.S.R. 1537(E)', '2017-12-13', '2018-01-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R7-FONT', 'PCR-2011-R7-TableI-II', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 7 — Table I (weight/volume) & Table II (length/area/count)', 'fontHeight', 'Minimum Numeral Height on Principal Display Panel', 'The minimum height of numerals and letters on the Principal Display Panel (PDP) is governed by Rule 7 Table I (for weight/volume commodities) and Table II (for length/area/count). The width of any numeral/letter must be ≥ 1/3 of its height (except for digit ''1'', ''I'', ''i'', ''l''). Clearance above/below the quantity declaration must equal numeral height; left/right clearance must be 2× height.', 'ALL', '{"type": "font_height", "pdp_area_tiers_mm": [{"area_cm2_max": 50, "min_height_mm": 1.0}, {"area_cm2_max": 100, "min_height_mm": 1.5}, {"area_cm2_max": 500, "min_height_mm": 2.5}, {"area_cm2_max": null, "min_height_mm": 4.0}], "blown_moulded_embossed_min_mm": 2.0, "min_letter_height_mm": 1.0, "width_to_height_min_ratio": 0.333, "clearance_above_below": "= numeral_height", "clearance_left_right": "= 2 * numeral_height"}'::jsonb, 'MEDIUM', True, False, NULL, 10000.0, 50000.0, 0, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('PCR-R18-DUALMRP', 'PCR-2011-R18(1)', 'Legal Metrology (Packaged Commodities) Rules, 2011', 'Rule 18(1) & 18(2)', 'mrp', 'Prohibition of Dual MRP & Overcharging Above MRP', 'No manufacturer, packer, or importer shall declare more than one retail sale price on the same package (dual MRP). Additionally, no person shall sell any pre-packaged commodity at a price exceeding the declared MRP (inclusive of all taxes). Both offences are compoundable under Section 36(1) of the Legal Metrology Act, 2009.', 'ALL', '{"type": "dual_mrp_check", "max_mrp_declarations_per_package": 1, "sale_price_must_not_exceed_mrp": true, "penalty_section": "Section 36(1), Legal Metrology Act 2009"}'::jsonb, 'CRITICAL', True, False, NULL, 2000.0, 50000.0, 0, 'G.S.R. 882(E)', '2011-02-24', '2011-04-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('FSSAI-REG5-1', 'FSSAI-2020-Reg5(1)', 'Food Safety and Standards (Labelling and Display) Regulations, 2020', 'Regulation 5(1)', 'fssaiLicense', 'FSSAI Logo & 14-Digit License Number on Food Packages', 'All food business operators (FBOs) must display the FSSAI logo and a valid 14-digit FSSAI license/registration number on every food product package. The license number must begin with 1 (for registration) or 2 (for license) and be exactly 14 numeric digits. Displaying an invalid or fabricated FSSAI number is a criminal offence under the FSS Act, 2006.', 'FOOD', '{"type": "fssai_license", "length": 14, "numeric_only": true, "valid_first_digit": ["1", "2"], "regex": "^[12]\\d{13}$", "must_display_logo": true, "penalty_act": "Section 26 & 31, Food Safety and Standards Act, 2006"}'::jsonb, 'CRITICAL', True, True, 'Applies to all food and food products only', 100000.0, 500000.0, 6, 'FSSAI F.No. 1-116/FSSAI/Imports/2021', '2022-09-01', '2022-10-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('FSSAI-REG5-2', 'FSSAI-2020-Reg5(2)', 'Food Safety and Standards (Labelling and Display) Regulations, 2020', 'Regulation 5(2)', 'ingredientsList', 'Ingredients List in Descending Order of Weight', 'Every packaged food product must list all ingredients on the label in descending order of their composition by weight or volume (m/m or v/v) at the time of manufacture. Compound ingredients that constitute more than 5% of the final product must also declare their sub-ingredients. Additives must be listed with their INS (International Numbering System) number and function class (e.g., "Acidity Regulator (INS 330)").', 'FOOD', '{"type": "ingredients_list", "order": "descending_by_weight_volume", "compound_ingredient_threshold_percent": 5, "additive_format": "Function_class (INS NNN) or Function_class (Name)", "allergen_highlighting": "Bold or underline"}'::jsonb, 'HIGH', True, True, 'Applies to all packaged food products', 50000.0, 200000.0, 0, 'FSSAI F.No. 1-116/FSSAI/Imports/2021', '2022-09-01', '2022-10-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('FSSAI-REG5-3', 'FSSAI-2020-Reg5(3)', 'Food Safety and Standards (Labelling and Display) Regulations, 2020', 'Regulation 5(3) & Schedule VII', 'nutritionalInfo', 'Mandatory Nutritional Information Panel (Per 100g/100ml)', 'Every packaged food must display a Nutritional Information panel declaring per 100g or 100ml: (1) Energy in kcal, (2) Protein in g, (3) Carbohydrate in g including Total Sugars in g, (4) Added Sugars in g, (5) Total Fat in g including Saturated Fat in g and Trans Fat in g, (6) Sodium in mg. High Fat, Salt, and Sugar (HFSS) products must display a front-of-pack nutrition label as per Schedule VII criteria.', 'FOOD', '{"type": "nutritional_panel", "mandatory_nutrients": [{"name": "Energy", "unit": "kcal"}, {"name": "Protein", "unit": "g"}, {"name": "Carbohydrate", "unit": "g"}, {"name": "Total Sugars", "unit": "g"}, {"name": "Added Sugars", "unit": "g"}, {"name": "Total Fat", "unit": "g"}, {"name": "Saturated Fat", "unit": "g"}, {"name": "Trans Fat", "unit": "g"}, {"name": "Sodium", "unit": "mg"}], "per_unit": "per 100g or per 100ml", "hfss_front_of_pack": "Required if product meets Schedule VII HFSS criteria"}'::jsonb, 'HIGH', True, True, 'Applies to all packaged food products except single-ingredient unprocessed foods', 50000.0, 200000.0, 0, 'FSSAI F.No. 1-116/FSSAI/Imports/2021', '2022-09-01', '2022-10-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('FSSAI-REG5-4', 'FSSAI-2020-Reg5(4)', 'Food Safety and Standards (Labelling and Display) Regulations, 2020', 'Regulation 5(4)', 'vegNonVegIndicator', 'Veg / Non-Veg Symbol Display', 'Every packaged food must display the prescribed veg/non-veg symbol: VEGETARIAN: green filled circle inside a green square border. NON-VEGETARIAN: brown filled upward-pointing triangle inside a brown square border. The symbol must be on the PDP in close proximity to the product name.', 'FOOD', '{"type": "veg_non_veg_symbol", "veg_symbol": "Green circle in green square", "non_veg_symbol": "Brown triangle in brown square", "placement": "PDP, near product name", "exempt_categories": ["Raw agriculture produce", "Fresh fruits & vegetables"]}'::jsonb, 'MEDIUM', True, True, 'Applies to all packaged food products. Exemptions for raw produce.', 25000.0, 100000.0, 0, 'FSSAI F.No. 1-116/FSSAI/Imports/2021', '2022-09-01', '2022-10-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('FSSAI-REG5-8', 'FSSAI-2020-Reg5(8)', 'Food Safety and Standards (Labelling and Display) Regulations, 2020', 'Regulation 5(8) & Schedule IX', 'allergenDeclaration', 'Mandatory Allergen Warning Declaration', 'Products containing any of the Schedule IX prescribed allergens must declare "Contains: [Allergen]" or highlight allergen names in bold/underline in the ingredients list. Schedule IX allergens include: Cereals containing gluten (wheat, rye, barley, oats), Crustaceans, Eggs, Fish, Peanuts, Soybeans, Milk (including lactose), Tree nuts, Celery, Mustard, Sesame seeds, Sulphur dioxide (> 10 mg/kg), Lupin, Molluscs.', 'FOOD', '{"type": "allergen_declaration", "schedule_ix_allergens": ["Gluten", "Wheat", "Rye", "Barley", "Oats", "Crustaceans", "Eggs", "Fish", "Peanuts", "Soybeans", "Milk", "Lactose", "Tree nuts", "Celery", "Mustard", "Sesame", "Sulphur dioxide", "Sulphites", "Lupin", "Molluscs"], "declaration_format": "Contains: [allergen_name]", "highlighting": "Bold or underline in ingredients list"}'::jsonb, 'CRITICAL', True, True, 'Required when product contains any Schedule IX allergen', 100000.0, 500000.0, 6, 'FSSAI F.No. 1-116/FSSAI/Imports/2021', '2022-09-01', '2022-10-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('FSSAI-REG5-10', 'FSSAI-2020-Reg5(10)', 'Food Safety and Standards (Labelling and Display) Regulations, 2020', 'Regulation 5(10)', 'expiryDate', 'Expiry / Best Before / Use By Date Declaration', 'Every packaged food must declare either "Expiry Date", "Best Before", or "Use By" date on the package. The declaration must be easily legible and either printed directly or on a separate sticker that is permanently affixed. For products with a shelf life ≤ 3 months, DD/MM/YYYY is required. For products > 3 months shelf life, MM/YYYY is acceptable.', 'FOOD', '{"type": "expiry_date", "accepted_labels": ["Expiry Date", "Best Before", "Use By", "BB", "Exp.", "BB Date"], "short_shelf_life_format": "DD/MM/YYYY (for shelf life <= 3 months)", "long_shelf_life_format": "MM/YYYY (for shelf life > 3 months)", "must_not_be_past": true}'::jsonb, 'CRITICAL', True, True, 'Applies to all food products. Date must be declared on primary package.', 50000.0, 300000.0, 6, 'FSSAI F.No. 1-116/FSSAI/Imports/2021', '2022-09-01', '2022-10-01'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('CPA-SEC89', 'CPA-2019-Sec89', 'Consumer Protection Act, 2019', 'Section 89', 'productClaims', 'Prohibition of Misleading Advertisements & Unsubstantiated Claims', 'Section 89 of the Consumer Protection Act, 2019 prohibits any person from publishing a misleading advertisement that causes harm to consumers or is likely to be used to deceive the consumer. This covers: false claims about efficacy (e.g., "cures diabetes"), unsubstantiated health benefits, incorrect ingredient claims (e.g., "100% natural" with synthetic additives), and false country of origin declarations. Penalty is up to ₹10 Lakhs.', 'ALL', '{"type": "claims_validation", "prohibited_unsubstantiated_terms": ["cures", "treats", "prevents disease", "100% natural", "no side effects", "clinically proven", "doctor recommended", "7-day results", "magic", "miracle", "instant cure"], "requires_substantiation_for": ["nutritional claims", "health claims", "organic claims", "country of origin claims", "weight loss claims"], "penalty_per_offence_inr": 1000000}'::jsonb, 'CRITICAL', True, False, NULL, 1000000.0, 5000000.0, 24, 'Act No. 35 of 2019', '2020-07-20', '2020-07-20'::date, NULL, True) ON CONFLICT (id) DO NOTHING;
INSERT INTO regulatory_rules (id, rule_code, act_name, section_clause, target_field, title, description, category_scope, validation_spec, severity, is_mandatory, is_conditional, condition_description, min_fine_inr, max_fine_inr, imprisonment_months, gazette_notification_no, gazette_date, effective_from, effective_to, is_active) VALUES ('ECOM-R5-6', 'ECOM-2020-R5-6', 'Consumer Protection (E-Commerce) Rules, 2020', 'Rule 5(1) & Rule 6(1)', 'sellerDisclosure', 'E-Commerce Seller & Product Mandatory Disclosures', 'E-commerce marketplace entities must display on their platform for every product listed: (1) Legal name and registered address of seller/importer, (2) Country of Origin, (3) Expiry Date / Best Before, (4) MRP inclusive of all taxes, (5) Net Quantity, (6) Customer Care contact details. Marketplace entities bear joint liability for violations by sellers on their platform.', 'ALL', '{"type": "ecommerce_disclosure", "required_fields_on_listing": ["seller_legal_name", "seller_registered_address", "country_of_origin", "expiry_date_or_best_before", "mrp_inclusive_of_taxes", "net_quantity", "customer_care_contact"], "marketplace_liability": "Joint and several with seller"}'::jsonb, 'HIGH', True, True, 'Applies to all products listed for sale on e-commerce platforms', 50000.0, 500000.0, 0, 'G.S.R. 462(E)', '2020-07-23', '2020-07-23'::date, NULL, True) ON CONFLICT (id) DO NOTHING;

-- ====================================================
-- SEED DATA: COMPLAINTS (1 records)
-- ====================================================
INSERT INTO complaints (id, ticket_id, product_id, consumer_name, consumer_email, consumer_phone, product_name, brand, platform, order_number, product_url, description, category, ai_matched_rule, status, sentiment_score, needs_review, extracted_evidence_summary, evidence_urls, assigned_officer, officer_decision_history, submitted_at) VALUES ('cmp-1', 'GRV-2025-0811', 'prod-1', 'Vikramaditya Sharma', 'vikram.sharma@gmail.com', '+91 98111 22334', 'NutriPro 100% Gold Whey Protein Isolate - 2kg', 'NutriPro', 'Amazon', 'OD-992-00412', 'https://amazon.in/dp/B08NUTR991', 'I weighed the container on precision electronic scales upon delivery. Total product weight was barely 1835 grams instead of 2000 grams. MRP sticker was also overprinted.', 'Weight Shortfall & Package Quantity', 'PCR-2011-R6(1)(e): Net Quantity Under-declaration', 'Investigation', 0.92, False, '{"declaredMrp": "\u20b94,999", "receiptPrice": "\u20b94,999", "netQuantity": "2 kg", "measuredWeight": "1.835 kg", "manufacturer": "NutriPro Labs Pvt Ltd"}'::jsonb, '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600"]'::jsonb, 'Inspector Rajesh Varma (Zonal Metrology)', '[]'::jsonb, '2025-02-26 11:20 IST') ON CONFLICT (id) DO NOTHING;