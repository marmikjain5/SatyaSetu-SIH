"""
SatyaDrishti Database Seeder Script
Populates PostgreSQL / SQLite database with complete dummy datasets for:
- Manufacturers
- Products with statutory declarations
- OCR Scans with extracted bounding boxes and parameters
- Violations Ledger records
- Consumer Complaints
"""

import sys
from pathlib import Path
from datetime import datetime

_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from database import engine, Base, SessionLocal
from models.db_models import (
    ManufacturerModel,
    ProductModel,
    OCRScanModel,
    ViolationModel,
    ComplaintModel,
    RegulatoryRuleModel,
)


def seed_database():
    print("==================================================")
    print("Initializing SatyaDrishti Database Schema...")
    Base.metadata.create_all(bind=engine)
    print("Schema initialized successfully.")

    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(ManufacturerModel).count() > 0:
            print("Database already contains records. Clearing existing records to re-seed...")
            db.query(OCRScanModel).delete()
            db.query(ViolationModel).delete()
            db.query(ComplaintModel).delete()
            db.query(ProductModel).delete()
            db.query(ManufacturerModel).delete()
            db.commit()

        # 1. SEED MANUFACTURERS
        print("Seeding Manufacturers...")
        manufacturers = [
            ManufacturerModel(
                id="mfg-1",
                name="NutriPro Labs Pvt Ltd",
                cin="U24233MH2016PTC284910",
                gstin="27AABCN8891P1ZX",
                registered_address="Plot 44, Industrial Area, Phase II, Andheri East, Mumbai, Maharashtra 400093",
                risk_tier="Critical",
                risk_score=88,
                repeat_offender_flag=True,
                total_products_scanned=24,
                active_violations=6,
                notices_issued=5,
                brands=["NutriPro", "MaxGain", "PureWhey"],
                top_offense_types=["Weight Deficit", "Misleading Protein Claims", "Origin Obfuscation"],
                last_audit_date="2025-02-24",
            ),
            ManufacturerModel(
                id="mfg-2",
                name="Tata Consumer Products Limited",
                cin="L15491WB1962PLC031426",
                gstin="19AABCT3421M1Z5",
                registered_address="1, Bishop Lefroy Road, Kolkata, West Bengal 700020",
                risk_tier="Low",
                risk_score=12,
                repeat_offender_flag=False,
                total_products_scanned=142,
                active_violations=0,
                notices_issued=0,
                brands=["Tata Tea", "Tata Salt", "Sampann"],
                top_offense_types=[],
                last_audit_date="2025-02-20",
            ),
            ManufacturerModel(
                id="mfg-3",
                name="OptiMax Nutrition Formulations",
                cin="U24231DL2018PTC339101",
                gstin="07AABCO4412K1Z9",
                registered_address="Sector 18, Udyog Vihar, Okhla Industrial Area, New Delhi 110020",
                risk_tier="Critical",
                risk_score=94,
                repeat_offender_flag=True,
                total_products_scanned=18,
                active_violations=8,
                notices_issued=7,
                brands=["OptiMax", "HyperMass"],
                top_offense_types=["Severe Weight Deficit", "Dual MRP Stickers", "Missing Customer Care"],
                last_audit_date="2025-02-26",
            ),
            ManufacturerModel(
                id="mfg-4",
                name="Himalayan Organics Health Ltd",
                cin="U24100HR2019PLC081234",
                gstin="06AABCH5512R1Z2",
                registered_address="Plot 12, Sector 29, Gurugram, Haryana 122001",
                risk_tier="High",
                risk_score=68,
                repeat_offender_flag=False,
                total_products_scanned=36,
                active_violations=3,
                notices_issued=2,
                brands=["Himalayan Organics", "NatureFit"],
                top_offense_types=["Font Size Deficit on PDP", "Unsubstantiated Timeline Claims"],
                last_audit_date="2025-02-18",
            ),
            ManufacturerModel(
                id="mfg-5",
                name="Imagine Marketing Ltd (boAt Lifestyle)",
                cin="U51909MH2013PLC240030",
                gstin="27AABCI6677K1Z4",
                registered_address="Unit 501, 5th Floor, Trade World, Kamala Mills, Lower Parel, Mumbai 400013",
                risk_tier="High",
                risk_score=62,
                repeat_offender_flag=False,
                total_products_scanned=88,
                active_violations=4,
                notices_issued=3,
                brands=["boAt"],
                top_offense_types=["Country of Origin Font Visibility", "Importer Details Missing"],
                last_audit_date="2025-02-22",
            ),
        ]
        db.add_all(manufacturers)
        db.commit()

        # 2. SEED PRODUCTS
        print("Seeding Products with Statutory Declarations...")
        products = [
            ProductModel(
                id="prod-1",
                sku="SKU-AMZ-NUTR-991",
                title="NutriPro 100% Gold Whey Protein Isolate - 2kg Double Rich Chocolate",
                brand="NutriPro",
                category="Nutritional Supplements & Health Foods",
                manufacturer_id="mfg-1",
                manufacturer_name="NutriPro Labs Pvt Ltd",
                country_of_origin="India",
                mrp=4999.00,
                listed_price=3499.00,
                net_weight="2 kg (Found: 1.84 kg)",
                platform="Amazon",
                product_url="https://amazon.in/dp/B08NUTR991",
                image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                status="non-compliant",
                compliance_score=42,
                ocr_confidence=98.4,
                fssai_license_number="11521999000142",
                ingredients_list=["Whey Protein Isolate", "Cocoa Powder", "Soy Lecithin", "Natural Flavors", "Sucralose"],
                nutritional_info={"perUnit": "Per 100g", "energyKcal": "380 kcal", "protein": "74.0g (Declared 82g)", "carbohydrates": "6.2g", "addedSugars": "0.0g", "totalFat": "2.4g", "sodium": "180mg"},
                customer_care_contact="support@nutriprolabs.in / +91-22-28491000",
                dietary_type="Vegetarian",
                claims=[{"text": "100% Whey Protein Isolate", "isMisleading": True, "reason": "Found protein content 74g vs declared 82g"}, {"text": "Zero Added Sugar", "isMisleading": False}],
                missing_mandatory_fields=["Unit Sale Price (USP)", "Packer Address"],
                regulatory_acts=["Legal Metrology Act, 2009 Sec 36(1)", "Packaged Commodities Rules 2011 Rule 6(1)(e)"],
                last_scanned="Today at 10:14 AM",
            ),
            ProductModel(
                id="prod-2",
                sku="SKU-FLP-ELEC-442",
                title="AeroBass Pro 500 Wireless ANC Earbuds with Spatial Audio (Midnight Black)",
                brand="boAt",
                category="Consumer Electronics & Peripherals",
                manufacturer_id="mfg-5",
                manufacturer_name="Imagine Marketing Ltd (boAt Lifestyle)",
                country_of_origin="PRC (Listed falsely as Made in India)",
                mrp=2999.00,
                listed_price=1299.00,
                net_weight="1 Unit (52g)",
                platform="Flipkart",
                product_url="https://flipkart.com/aerobass-pro-500",
                image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
                status="notice-issued",
                compliance_score=31,
                ocr_confidence=99.1,
                fssai_license_number=None,
                ingredients_list=[],
                nutritional_info={},
                customer_care_contact="care@boat-lifestyle.com / 022-69181920",
                dietary_type="Exempt",
                claims=[{"text": "Made in India", "isMisleading": True, "reason": "Barcode and packaging inspection proves Country of Origin: PRC"}],
                missing_mandatory_fields=["Importer Name & Address", "Country of Origin on PDP"],
                regulatory_acts=["Legal Metrology Rules 2011 Rule 6(1)(a)", "Consumer Protection (E-Commerce) Rules 2020"],
                last_scanned="Today at 09:45 AM",
            ),
            ProductModel(
                id="prod-3",
                sku="SKU-BLK-GROC-109",
                title="Tata Sampann Organic Unpolished Toor Dal (Yellow Pigeon Peas) - 1kg",
                brand="Tata Sampann",
                category="Edible Oils & FMCG Groceries",
                manufacturer_id="mfg-2",
                manufacturer_name="Tata Consumer Products Limited",
                country_of_origin="India",
                mrp=195.00,
                listed_price=172.00,
                net_weight="1 kg (1000g)",
                platform="Blinkit",
                product_url="https://blinkit.com/prn/tata-sampann-toor-dal",
                image_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
                status="compliant",
                compliance_score=98,
                ocr_confidence=99.8,
                fssai_license_number="10014031001025",
                ingredients_list=["100% Organic Unpolished Toor Dal (Pigeon Peas)"],
                nutritional_info={"perUnit": "Per 100g", "energyKcal": "343 kcal", "protein": "22.3g", "carbohydrates": "62.8g", "addedSugars": "0.0g", "totalFat": "1.5g", "sodium": "28mg"},
                customer_care_contact="feedback@tataconsumer.com / 1800-108-4488",
                dietary_type="Vegetarian",
                claims=[{"text": "100% Unpolished Organic", "isMisleading": False}],
                missing_mandatory_fields=[],
                regulatory_acts=[],
                last_scanned="Today at 08:30 AM",
            ),
            ProductModel(
                id="prod-4",
                sku="SKU-ZPT-COSM-774",
                title="Himalayan Organics Bhringraj & Red Onion Anti-Hairfall Ayurvedic Hair Oil 200ml",
                brand="Himalayan Organics",
                category="Cosmetics & Personal Care",
                manufacturer_id="mfg-4",
                manufacturer_name="Himalayan Organics Health Ltd",
                country_of_origin="India",
                mrp=599.00,
                listed_price=389.00,
                net_weight="200 ml",
                platform="Zepto",
                product_url="https://zepto.in/p/himalayan-organics-hair-oil",
                image_url="https://images.unsplash.com/photo-1608248597359-00995166f281?w=600",
                status="under-review",
                compliance_score=58,
                ocr_confidence=96.2,
                fssai_license_number="10819005000214",
                ingredients_list=["Red Onion Extract", "Bhringraj Oil", "Sesame Seed Oil", "Coconut Oil", "Vitamin E"],
                nutritional_info={},
                customer_care_contact="care@thehimalayanorganics.com / 1800-889-1002",
                dietary_type="Vegetarian",
                claims=[{"text": "100% Stops Hair Fall in 7 Days", "isMisleading": True, "reason": "Unsubstantiated timeline clinical claim"}],
                missing_mandatory_fields=["Batch Number Font Size < 1mm", "Best Before Clear Date Format"],
                regulatory_acts=["Drugs & Magic Remedies Act, 1954", "Legal Metrology Rules 2011 Rule 9"],
                last_scanned="Today at 09:12 AM",
            ),
        ]
        db.add_all(products)
        db.commit()

        # 3. SEED OCR SCANS
        print("Seeding OCR Scan Records...")
        scans = [
            OCRScanModel(
                id="scan-101",
                product_id="prod-1",
                image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                raw_extracted_text="NUTRIPRO 100% GOLD WHEY NET WT 2KG MRP RS 4999 INCL OF ALL TAXES MFD 01/2025 EXP 01/2027 PKG WT 1.84KG",
                cleaned_text="NutriPro 100% Gold Whey Protein Isolate. Net Weight 2kg. MRP: Rs 4999.00 (Incl. of all taxes). Actual weight: 1.84kg.",
                ocr_engine="Tesseract.js v5 / DeepVision Metrology OCR",
                confidence_score=98.4,
                extracted_parameters={
                    "declared_mrp": 4999.0,
                    "unit_sale_price": None,
                    "net_quantity": "2 kg",
                    "measured_weight": "1.84 kg",
                    "manufacturer": "NutriPro Labs Pvt Ltd",
                    "fssai_license": "11521999000142",
                    "mfg_date": "2025-01-10",
                },
                bounding_boxes=[
                    {"field": "MRP", "box": [120, 45, 240, 80], "confidence": 99.2},
                    {"field": "Net Quantity", "box": [310, 110, 430, 145], "confidence": 98.1},
                    {"field": "FSSAI Logo", "box": [500, 30, 580, 70], "confidence": 97.4},
                ],
                readability_scores={
                    "min_font_size_mm": 0.85,
                    "mandated_font_size_mm": 2.0,
                    "contrast_ratio": 4.2,
                    "visibility_score": 62,
                },
                status="completed",
                scan_timestamp=datetime.utcnow(),
            ),
            OCRScanModel(
                id="scan-102",
                product_id="prod-2",
                image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
                raw_extracted_text="AEROBASS PRO 500 WIRELESS EARBUDS MRP 2999 MADE IN PRC IMPORTER IMAGINE MARKETING LTD BARCODE 8901234567890",
                cleaned_text="AeroBass Pro 500 Wireless Earbuds. MRP: Rs 2999.00. Country of Origin: PRC. Importer: Imagine Marketing Ltd.",
                ocr_engine="Tesseract.js v5 / DeepVision Metrology OCR",
                confidence_score=99.1,
                extracted_parameters={
                    "declared_mrp": 2999.0,
                    "country_of_origin": "PRC",
                    "importer": "Imagine Marketing Ltd",
                    "barcode": "8901234567890",
                },
                bounding_boxes=[
                    {"field": "Origin", "box": [40, 80, 150, 110], "confidence": 99.5},
                    {"field": "MRP", "box": [200, 30, 290, 65], "confidence": 98.9},
                ],
                readability_scores={
                    "min_font_size_mm": 0.6,
                    "mandated_font_size_mm": 1.5,
                    "contrast_ratio": 3.1,
                    "visibility_score": 45,
                },
                status="completed",
                scan_timestamp=datetime.utcnow(),
            ),
        ]
        db.add_all(scans)
        db.commit()

        # 4. SEED VIOLATIONS
        print("Seeding Violations Ledger...")
        violations = [
            ViolationModel(
                id="viol-1",
                case_number="CCPA/ENF/2025/NZ-0104",
                product_id="prod-1",
                manufacturer_id="mfg-1",
                product_name="NutriPro 100% Gold Whey Protein Isolate - 2kg",
                brand="NutriPro",
                manufacturer="NutriPro Labs Pvt Ltd",
                platform="Amazon",
                rule_code="PCR-2011-R6(1)(e)",
                section="Rule 6(1)(e) - Net Quantity Declarations & Maximum Permissible Error",
                act_name="Legal Metrology Act, 2009",
                severity="critical",
                description="Physical label OCR measured container net weight at 1.84kg against declared 2.0kg. The 160g deficit (8%) significantly exceeds statutory MPE tolerance limits.",
                evidence={
                    "extractedValue": "Net Weight found: 1.84 kg (8% deficit)",
                    "expectedStandard": "2.0 kg ± 1.5% maximum permissible error (MPE)",
                    "ocrConfidence": 98.4,
                    "screenshotUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                },
                penalty_estimate=100000.0,
                status="Open",
                notice_id="SCN-2025-0104",
                assigned_officer="Inspector Rajesh Varma (North Zone)",
                detected_at="2025-02-26 10:14 IST",
            ),
            ViolationModel(
                id="viol-2",
                case_number="CCPA/ENF/2025/WZ-0219",
                product_id="prod-2",
                manufacturer_id="mfg-5",
                product_name="AeroBass Pro 500 Wireless ANC Earbuds",
                brand="boAt",
                manufacturer="Imagine Marketing Ltd (boAt Lifestyle)",
                platform="Flipkart",
                rule_code="PCR-2011-R6(1)(a)",
                section="Rule 6(1)(a) & E-Commerce Rules 2020 - Mandatory Country of Origin Disclosure",
                act_name="Legal Metrology Act, 2009",
                severity="critical",
                description="Online PDP listing declared product Country of Origin as 'India', whereas optical packaging barcode and importer declaration indicates 'PRC'.",
                evidence={
                    "extractedValue": "Packaging barcode reads Country of Origin: PRC",
                    "expectedStandard": "Accurate country of origin prominently displayed on digital catalog and outer packaging",
                    "ocrConfidence": 99.1,
                },
                penalty_estimate=50000.0,
                status="Notice Issued",
                notice_id="SCN-2025-0219",
                assigned_officer="Directorate General Enforcement Wing",
                detected_at="2025-02-25 16:30 IST",
            ),
        ]
        db.add_all(violations)
        db.commit()

        # 5. SEED COMPLAINTS
        print("Seeding Consumer Grievances...")
        complaints = [
            ComplaintModel(
                id="cmp-1",
                ticket_id="GRV-2025-0811",
                product_id="prod-1",
                consumer_name="Vikramaditya Sharma",
                consumer_email="vikram.sharma@gmail.com",
                consumer_phone="+91 98111 22334",
                product_name="NutriPro 100% Gold Whey Protein Isolate - 2kg",
                brand="NutriPro",
                platform="Amazon",
                order_number="OD-992-00412",
                product_url="https://amazon.in/dp/B08NUTR991",
                description="I weighed the container on precision electronic scales upon delivery. Total product weight was barely 1835 grams instead of 2000 grams. MRP sticker was also overprinted.",
                category="Weight Shortfall & Package Quantity",
                ai_matched_rule="PCR-2011-R6(1)(e): Net Quantity Under-declaration",
                status="Investigation",
                sentiment_score=0.92,
                needs_review=False,
                extracted_evidence_summary={
                    "declaredMrp": "₹4,999",
                    "receiptPrice": "₹4,999",
                    "netQuantity": "2 kg",
                    "measuredWeight": "1.835 kg",
                    "manufacturer": "NutriPro Labs Pvt Ltd",
                },
                evidence_urls=["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600"],
                assigned_officer="Inspector Rajesh Varma (Zonal Metrology)",
                submitted_at="2025-02-26 11:20 IST",
            ),
        ]
        db.add_all(complaints)
        db.commit()

        # 6. SEED STATUTORY REGULATORY RULES
        print("Seeding Gazette-Verified Statutory Rules...")
        seed_regulatory_rules(db)

        print("==================================================")
        print("Database seeding completed successfully!")
        print(f"Total Manufacturers:      {db.query(ManufacturerModel).count()}")
        print(f"Total Products:           {db.query(ProductModel).count()}")
        print(f"Total OCR Scans:          {db.query(OCRScanModel).count()}")
        print(f"Total Violations:         {db.query(ViolationModel).count()}")
        print(f"Total Complaints:         {db.query(ComplaintModel).count()}")
        print(f"Total Regulatory Rules:   {db.query(RegulatoryRuleModel).count()}")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


def seed_regulatory_rules(db):
    """
    Seeds the regulatory_rules table with all gazette-verified statutory rules.

    Sources:
    - Legal Metrology (Packaged Commodities) Rules, 2011 (as amended up to G.S.R. 779(E) 2022)
    - FSSAI Food Safety and Standards (Labelling and Display) Regulations, 2020
    - Consumer Protection Act, 2019 & E-Commerce Rules, 2020

    Architecture note: This is the BACKEND production rule store. The frontend
    ragKnowledgeService.ts is a separate live-demo ingestion layer — do not confuse them.
    """
    # Check if already seeded
    if db.query(RegulatoryRuleModel).count() > 0:
        print("  Regulatory rules already seeded — skipping.")
        return

    rules = [
        # ═══════════════════════════════════════════════════════════════════════
        # BLOCK A: Legal Metrology (Packaged Commodities) Rules, 2011
        # Gazette: G.S.R. 882(E), Ministry of Consumer Affairs, 24 Feb 2011
        # as amended by G.S.R. 779(E) dated 28 Oct 2022 (Unit Sale Price)
        # ═══════════════════════════════════════════════════════════════════════
        RegulatoryRuleModel(
            id="PCR-R6-1A",
            rule_code="PCR-2011-R6(1)(a)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 6(1)(a)",
            target_field="productName",
            title="Mandatory Generic/Common Name of Commodity",
            description=(
                "Every package shall bear the name of the commodity. The name shall be the "
                "generic or common name, not merely a brand name, and must be prominently "
                "displayed on the Principal Display Panel in legible characters."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "text_presence",
                "min_length": 3,
                "must_be_generic": True,
                "placement": "PDP",
                "note": "Brand name alone is insufficient. Generic commodity name required."
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=25000.0,
            max_fine_inr=100000.0,
            imprisonment_months=6,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1B",
            rule_code="PCR-2011-R6(1)(b)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 6(1)(b) & Rule 11",
            target_field="netQuantity",
            title="Net Quantity in Standard Metric Units Only",
            description=(
                "The net quantity of the commodity contained in the package shall be declared "
                "in terms of standard units of measurement: weight (g or kg), volume (ml or l), "
                "or numerical count. Declaration in non-metric units (oz, lbs, fluid oz) is "
                "strictly prohibited under Rule 11 of the Legal Metrology Act, 2009."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "net_quantity",
                "allowed_units": ["g", "kg", "ml", "l", "mg", "pieces", "units", "m", "cm"],
                "prohibited_units": ["oz", "lbs", "lb", "fluid oz", "fl oz", "pounds"],
                "mpe_table": {
                    "comment": "Maximum Permissible Error — Schedule I, Legal Metrology (Packaged Commodities) Rules, 2011",
                    "ranges_by_weight_g": [
                        {"from": 0, "to": 50, "mpe_percent": 9.0},
                        {"from": 50, "to": 100, "mpe_percent": 4.5},
                        {"from": 100, "to": 200, "mpe_percent": 4.5},
                        {"from": 200, "to": 300, "mpe_percent": 9.0, "mpe_g": 9},
                        {"from": 300, "to": 500, "mpe_percent": 3.0},
                        {"from": 500, "to": 1000, "mpe_percent": 1.5},
                        {"from": 1000, "to": 10000, "mpe_percent": 1.5},
                        {"from": 10000, "to": 25000, "mpe_percent": 1.0},
                        {"from": 25000, "to": None, "mpe_percent": 0.5}
                    ]
                }
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=25000.0,
            max_fine_inr=100000.0,
            imprisonment_months=6,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1C",
            rule_code="PCR-2011-R6(1)(c)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 6(1)(c)",
            target_field="mrp",
            title="Maximum Retail Price (MRP) Declaration — Inclusive of All Taxes",
            description=(
                "The retail sale price of the pre-packaged commodity shall be declared as "
                "\"Maximum Retail Price\" or \"MRP\", inclusive of all taxes (including local taxes), "
                "in Indian Rupees. The declaration must read as: "
                "\"MRP ₹ xx.xx (inclusive of all taxes)\" or equivalent. "
                "Selling above the declared MRP is a cognizable offence under Rule 18(2)."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "mrp_format",
                "required_prefix": ["MRP", "Maximum Retail Price", "Max. Retail Price"],
                "required_tax_clause": ["inclusive of all taxes", "incl. of all taxes", "incl all taxes"],
                "currency": "INR",
                "currency_symbols": ["₹", "Rs.", "Rs", "INR"],
                "must_be_positive": True
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=25000.0,
            max_fine_inr=100000.0,
            imprisonment_months=6,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1AA",
            rule_code="PCR-2022-R6(1)(aa)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2022)",
            section_clause="Rule 6(1)(aa) — inserted by G.S.R. 779(E)",
            target_field="unitSalePrice",
            title="Mandatory Unit Sale Price (USP) Per g/ml",
            description=(
                "Every pre-packaged commodity must declare the Unit Sale Price (USP) per gram "
                "or per milliliter to enable price comparison. USP = MRP ÷ Net Quantity, "
                "rounded to 2 decimal places. Exemption: USP declaration is NOT required if "
                "the USP equals the MRP (e.g., a 1g product priced at ₹1). The font height of "
                "USP declaration must be at least 50% of the MRP font height."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "unit_sale_price",
                "formula": "mrp / net_quantity_in_base_unit",
                "rounding_decimals": 2,
                "exemption": "USP equals MRP",
                "min_font_ratio_to_mrp": 0.5,
                "placement": "PDP, adjacent to MRP",
                "format": "₹ X.XX per g  OR  ₹ X.XX per ml"
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Not required if USP equals MRP (unit quantity = 1 base unit)",
            min_fine_inr=25000.0,
            max_fine_inr=100000.0,
            imprisonment_months=6,
            gazette_notification_no="G.S.R. 779(E)",
            gazette_date="2022-10-28",
            effective_from="2023-01-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1D",
            rule_code="PCR-2011-R6(1)(d)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 6(1)(d)",
            target_field="manufacturerAddress",
            title="Manufacturer / Packer / Importer Full Address",
            description=(
                "The name and complete address of the manufacturer or packer (or importer for "
                "imported commodities) must be declared. Address must include the street/plot, "
                "city or town, State, and 6-digit PIN Code. Registered office address alone is "
                "insufficient — the address of the manufacturing or packing premises is required."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "address_format",
                "required_components": ["street_or_plot", "city", "state", "pin_code"],
                "pin_code_regex": "^[1-9][0-9]{5}$",
                "for_imports": "Importer name and Indian address required additionally"
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=25000.0,
            max_fine_inr=50000.0,
            imprisonment_months=0,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1E",
            rule_code="PCR-2011-R6(1)(e)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 6(1)(e)",
            target_field="manufacturingDate",
            title="Date of Manufacture / Packing / Import",
            description=(
                "The month and year in which the commodity is manufactured, packed, or imported "
                "must be declared on the package. Acceptable formats: MM/YYYY or Month YYYY "
                "(e.g., 03/2024 or MAR/2024). The declaration must be prefixed with "
                "\"Mfg Date\", \"Date of Manufacture\", \"Pkg Date\", or equivalent."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "date_format",
                "accepted_formats": ["MM/YYYY", "MMM/YYYY", "DD/MM/YYYY", "Month YYYY"],
                "required_prefixes": ["Mfg Date", "Date of Manufacture", "Pkg Date", "Date of Packing", "Mfg.", "Mfd."],
                "must_not_be_future": True
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=25000.0,
            max_fine_inr=50000.0,
            imprisonment_months=0,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1F",
            rule_code="PCR-2011-R6(1)(f)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 6(1)(f)",
            target_field="customerCare",
            title="Consumer Care / Grievance Redressal Contact",
            description=(
                "The name, address, telephone number, and email address to be used for "
                "consumer complaints and redressal must be declared on the package. "
                "A toll-free number (prefix 1800) is strongly preferred but not mandated. "
                "Both a phone number and an active email address are required."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "consumer_care",
                "required_fields": ["phone_or_tollfree", "email"],
                "phone_regex": "(1800[\\s\\-]?\\d{3}[\\s\\-]?\\d{3,4}|(?:\\+91[\\s\\-]?)?[6-9]\\d{4}[\\s\\-]?\\d{5})",
                "email_regex": "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=25000.0,
            max_fine_inr=50000.0,
            imprisonment_months=0,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R6-1N",
            rule_code="PCR-2017-R6(1)(n)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2017)",
            section_clause="Rule 6(1)(n) — inserted by G.S.R. 1537(E)",
            target_field="countryOfOrigin",
            title="Country of Origin / Manufacture Declaration",
            description=(
                "Name of the country of origin or manufacture must be declared on every "
                "pre-packaged commodity in prominent, clearly legible uppercase characters. "
                "For goods made from multiple countries, all countries must be declared. "
                "Statements such as \"Made in India\", \"Country of Origin: INDIA\" satisfy this requirement. "
                "Mislabelling or obfuscation is treated as a cognizable offence."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "country_of_origin",
                "must_be_uppercase_or_prominent": True,
                "valid_declarations": ["Made in India", "Country of Origin: India", "Manufactured in India", "Product of India"],
                "for_imports": "Country name must match actual manufacturing country, obfuscation is offence"
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=50000.0,
            max_fine_inr=200000.0,
            imprisonment_months=12,
            gazette_notification_no="G.S.R. 1537(E)",
            gazette_date="2017-12-13",
            effective_from="2018-01-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R7-FONT",
            rule_code="PCR-2011-R7-TableI-II",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 7 — Table I (weight/volume) & Table II (length/area/count)",
            target_field="fontHeight",
            title="Minimum Numeral Height on Principal Display Panel",
            description=(
                "The minimum height of numerals and letters on the Principal Display Panel (PDP) "
                "is governed by Rule 7 Table I (for weight/volume commodities) and Table II "
                "(for length/area/count). The width of any numeral/letter must be ≥ 1/3 of its height "
                "(except for digit '1', 'I', 'i', 'l'). Clearance above/below the quantity "
                "declaration must equal numeral height; left/right clearance must be 2× height."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "font_height",
                "pdp_area_tiers_mm": [
                    {"area_cm2_max": 50, "min_height_mm": 1.0},
                    {"area_cm2_max": 100, "min_height_mm": 1.5},
                    {"area_cm2_max": 500, "min_height_mm": 2.5},
                    {"area_cm2_max": None, "min_height_mm": 4.0}
                ],
                "blown_moulded_embossed_min_mm": 2.0,
                "min_letter_height_mm": 1.0,
                "width_to_height_min_ratio": 0.333,
                "clearance_above_below": "= numeral_height",
                "clearance_left_right": "= 2 * numeral_height"
            },
            severity="MEDIUM",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=10000.0,
            max_fine_inr=50000.0,
            imprisonment_months=0,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="PCR-R18-DUALMRP",
            rule_code="PCR-2011-R18(1)",
            act_name="Legal Metrology (Packaged Commodities) Rules, 2011",
            section_clause="Rule 18(1) & 18(2)",
            target_field="mrp",
            title="Prohibition of Dual MRP & Overcharging Above MRP",
            description=(
                "No manufacturer, packer, or importer shall declare more than one retail sale "
                "price on the same package (dual MRP). Additionally, no person shall sell any "
                "pre-packaged commodity at a price exceeding the declared MRP (inclusive of all taxes). "
                "Both offences are compoundable under Section 36(1) of the Legal Metrology Act, 2009."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "dual_mrp_check",
                "max_mrp_declarations_per_package": 1,
                "sale_price_must_not_exceed_mrp": True,
                "penalty_section": "Section 36(1), Legal Metrology Act 2009"
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=2000.0,
            max_fine_inr=50000.0,
            imprisonment_months=0,
            gazette_notification_no="G.S.R. 882(E)",
            gazette_date="2011-02-24",
            effective_from="2011-04-01",
            effective_to=None,
            is_active=True,
        ),

        # ═══════════════════════════════════════════════════════════════════════
        # BLOCK B: FSSAI Food Safety & Standards (Labelling & Display) Regs, 2020
        # Gazette: FSSAI F.No. 1-116/FSSAI/Imports/2021, effective 01 Oct 2022
        # ═══════════════════════════════════════════════════════════════════════
        RegulatoryRuleModel(
            id="FSSAI-REG5-1",
            rule_code="FSSAI-2020-Reg5(1)",
            act_name="Food Safety and Standards (Labelling and Display) Regulations, 2020",
            section_clause="Regulation 5(1)",
            target_field="fssaiLicense",
            title="FSSAI Logo & 14-Digit License Number on Food Packages",
            description=(
                "All food business operators (FBOs) must display the FSSAI logo and a valid "
                "14-digit FSSAI license/registration number on every food product package. "
                "The license number must begin with 1 (for registration) or 2 (for license) "
                "and be exactly 14 numeric digits. Displaying an invalid or fabricated FSSAI "
                "number is a criminal offence under the FSS Act, 2006."
            ),
            category_scope="FOOD",
            validation_spec={
                "type": "fssai_license",
                "length": 14,
                "numeric_only": True,
                "valid_first_digit": ["1", "2"],
                "regex": "^[12]\\d{13}$",
                "must_display_logo": True,
                "penalty_act": "Section 26 & 31, Food Safety and Standards Act, 2006"
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Applies to all food and food products only",
            min_fine_inr=100000.0,
            max_fine_inr=500000.0,
            imprisonment_months=6,
            gazette_notification_no="FSSAI F.No. 1-116/FSSAI/Imports/2021",
            gazette_date="2022-09-01",
            effective_from="2022-10-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="FSSAI-REG5-2",
            rule_code="FSSAI-2020-Reg5(2)",
            act_name="Food Safety and Standards (Labelling and Display) Regulations, 2020",
            section_clause="Regulation 5(2)",
            target_field="ingredientsList",
            title="Ingredients List in Descending Order of Weight",
            description=(
                "Every packaged food product must list all ingredients on the label in descending "
                "order of their composition by weight or volume (m/m or v/v) at the time of "
                "manufacture. Compound ingredients that constitute more than 5% of the final "
                "product must also declare their sub-ingredients. Additives must be listed with "
                "their INS (International Numbering System) number and function class (e.g., "
                "\"Acidity Regulator (INS 330)\")."
            ),
            category_scope="FOOD",
            validation_spec={
                "type": "ingredients_list",
                "order": "descending_by_weight_volume",
                "compound_ingredient_threshold_percent": 5,
                "additive_format": "Function_class (INS NNN) or Function_class (Name)",
                "allergen_highlighting": "Bold or underline"
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Applies to all packaged food products",
            min_fine_inr=50000.0,
            max_fine_inr=200000.0,
            imprisonment_months=0,
            gazette_notification_no="FSSAI F.No. 1-116/FSSAI/Imports/2021",
            gazette_date="2022-09-01",
            effective_from="2022-10-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="FSSAI-REG5-3",
            rule_code="FSSAI-2020-Reg5(3)",
            act_name="Food Safety and Standards (Labelling and Display) Regulations, 2020",
            section_clause="Regulation 5(3) & Schedule VII",
            target_field="nutritionalInfo",
            title="Mandatory Nutritional Information Panel (Per 100g/100ml)",
            description=(
                "Every packaged food must display a Nutritional Information panel declaring per 100g or 100ml: "
                "(1) Energy in kcal, (2) Protein in g, (3) Carbohydrate in g including Total Sugars in g, "
                "(4) Added Sugars in g, (5) Total Fat in g including Saturated Fat in g and Trans Fat in g, "
                "(6) Sodium in mg. High Fat, Salt, and Sugar (HFSS) products must display a front-of-pack "
                "nutrition label as per Schedule VII criteria."
            ),
            category_scope="FOOD",
            validation_spec={
                "type": "nutritional_panel",
                "mandatory_nutrients": [
                    {"name": "Energy", "unit": "kcal"},
                    {"name": "Protein", "unit": "g"},
                    {"name": "Carbohydrate", "unit": "g"},
                    {"name": "Total Sugars", "unit": "g"},
                    {"name": "Added Sugars", "unit": "g"},
                    {"name": "Total Fat", "unit": "g"},
                    {"name": "Saturated Fat", "unit": "g"},
                    {"name": "Trans Fat", "unit": "g"},
                    {"name": "Sodium", "unit": "mg"}
                ],
                "per_unit": "per 100g or per 100ml",
                "hfss_front_of_pack": "Required if product meets Schedule VII HFSS criteria"
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Applies to all packaged food products except single-ingredient unprocessed foods",
            min_fine_inr=50000.0,
            max_fine_inr=200000.0,
            imprisonment_months=0,
            gazette_notification_no="FSSAI F.No. 1-116/FSSAI/Imports/2021",
            gazette_date="2022-09-01",
            effective_from="2022-10-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="FSSAI-REG5-4",
            rule_code="FSSAI-2020-Reg5(4)",
            act_name="Food Safety and Standards (Labelling and Display) Regulations, 2020",
            section_clause="Regulation 5(4)",
            target_field="vegNonVegIndicator",
            title="Veg / Non-Veg Symbol Display",
            description=(
                "Every packaged food must display the prescribed veg/non-veg symbol: "
                "VEGETARIAN: green filled circle inside a green square border. "
                "NON-VEGETARIAN: brown filled upward-pointing triangle inside a brown square border. "
                "The symbol must be on the PDP in close proximity to the product name."
            ),
            category_scope="FOOD",
            validation_spec={
                "type": "veg_non_veg_symbol",
                "veg_symbol": "Green circle in green square",
                "non_veg_symbol": "Brown triangle in brown square",
                "placement": "PDP, near product name",
                "exempt_categories": ["Raw agriculture produce", "Fresh fruits & vegetables"]
            },
            severity="MEDIUM",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Applies to all packaged food products. Exemptions for raw produce.",
            min_fine_inr=25000.0,
            max_fine_inr=100000.0,
            imprisonment_months=0,
            gazette_notification_no="FSSAI F.No. 1-116/FSSAI/Imports/2021",
            gazette_date="2022-09-01",
            effective_from="2022-10-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="FSSAI-REG5-8",
            rule_code="FSSAI-2020-Reg5(8)",
            act_name="Food Safety and Standards (Labelling and Display) Regulations, 2020",
            section_clause="Regulation 5(8) & Schedule IX",
            target_field="allergenDeclaration",
            title="Mandatory Allergen Warning Declaration",
            description=(
                "Products containing any of the Schedule IX prescribed allergens must declare "
                "\"Contains: [Allergen]\" or highlight allergen names in bold/underline in the "
                "ingredients list. Schedule IX allergens include: Cereals containing gluten "
                "(wheat, rye, barley, oats), Crustaceans, Eggs, Fish, Peanuts, Soybeans, "
                "Milk (including lactose), Tree nuts, Celery, Mustard, Sesame seeds, "
                "Sulphur dioxide (> 10 mg/kg), Lupin, Molluscs."
            ),
            category_scope="FOOD",
            validation_spec={
                "type": "allergen_declaration",
                "schedule_ix_allergens": [
                    "Gluten", "Wheat", "Rye", "Barley", "Oats",
                    "Crustaceans", "Eggs", "Fish", "Peanuts", "Soybeans",
                    "Milk", "Lactose", "Tree nuts", "Celery", "Mustard",
                    "Sesame", "Sulphur dioxide", "Sulphites", "Lupin", "Molluscs"
                ],
                "declaration_format": "Contains: [allergen_name]",
                "highlighting": "Bold or underline in ingredients list"
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Required when product contains any Schedule IX allergen",
            min_fine_inr=100000.0,
            max_fine_inr=500000.0,
            imprisonment_months=6,
            gazette_notification_no="FSSAI F.No. 1-116/FSSAI/Imports/2021",
            gazette_date="2022-09-01",
            effective_from="2022-10-01",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="FSSAI-REG5-10",
            rule_code="FSSAI-2020-Reg5(10)",
            act_name="Food Safety and Standards (Labelling and Display) Regulations, 2020",
            section_clause="Regulation 5(10)",
            target_field="expiryDate",
            title="Expiry / Best Before / Use By Date Declaration",
            description=(
                "Every packaged food must declare either \"Expiry Date\", \"Best Before\", or "
                "\"Use By\" date on the package. The declaration must be easily legible and "
                "either printed directly or on a separate sticker that is permanently affixed. "
                "For products with a shelf life ≤ 3 months, DD/MM/YYYY is required. "
                "For products > 3 months shelf life, MM/YYYY is acceptable."
            ),
            category_scope="FOOD",
            validation_spec={
                "type": "expiry_date",
                "accepted_labels": ["Expiry Date", "Best Before", "Use By", "BB", "Exp.", "BB Date"],
                "short_shelf_life_format": "DD/MM/YYYY (for shelf life <= 3 months)",
                "long_shelf_life_format": "MM/YYYY (for shelf life > 3 months)",
                "must_not_be_past": True
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Applies to all food products. Date must be declared on primary package.",
            min_fine_inr=50000.0,
            max_fine_inr=300000.0,
            imprisonment_months=6,
            gazette_notification_no="FSSAI F.No. 1-116/FSSAI/Imports/2021",
            gazette_date="2022-09-01",
            effective_from="2022-10-01",
            effective_to=None,
            is_active=True,
        ),

        # ═══════════════════════════════════════════════════════════════════════
        # BLOCK C: Consumer Protection Act, 2019 & E-Commerce Rules, 2020
        # Gazette: G.S.R. 462(E), Ministry of Consumer Affairs, 23 Jul 2020
        # ═══════════════════════════════════════════════════════════════════════
        RegulatoryRuleModel(
            id="CPA-SEC89",
            rule_code="CPA-2019-Sec89",
            act_name="Consumer Protection Act, 2019",
            section_clause="Section 89",
            target_field="productClaims",
            title="Prohibition of Misleading Advertisements & Unsubstantiated Claims",
            description=(
                "Section 89 of the Consumer Protection Act, 2019 prohibits any person from "
                "publishing a misleading advertisement that causes harm to consumers or is "
                "likely to be used to deceive the consumer. This covers: false claims about "
                "efficacy (e.g., \"cures diabetes\"), unsubstantiated health benefits, incorrect "
                "ingredient claims (e.g., \"100% natural\" with synthetic additives), and "
                "false country of origin declarations. Penalty is up to ₹10 Lakhs."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "claims_validation",
                "prohibited_unsubstantiated_terms": [
                    "cures", "treats", "prevents disease", "100% natural",
                    "no side effects", "clinically proven", "doctor recommended",
                    "7-day results", "magic", "miracle", "instant cure"
                ],
                "requires_substantiation_for": [
                    "nutritional claims", "health claims", "organic claims",
                    "country of origin claims", "weight loss claims"
                ],
                "penalty_per_offence_inr": 1000000
            },
            severity="CRITICAL",
            is_mandatory=True,
            is_conditional=False,
            min_fine_inr=1000000.0,
            max_fine_inr=5000000.0,
            imprisonment_months=24,
            gazette_notification_no="Act No. 35 of 2019",
            gazette_date="2020-07-20",
            effective_from="2020-07-20",
            effective_to=None,
            is_active=True,
        ),
        RegulatoryRuleModel(
            id="ECOM-R5-6",
            rule_code="ECOM-2020-R5-6",
            act_name="Consumer Protection (E-Commerce) Rules, 2020",
            section_clause="Rule 5(1) & Rule 6(1)",
            target_field="sellerDisclosure",
            title="E-Commerce Seller & Product Mandatory Disclosures",
            description=(
                "E-commerce marketplace entities must display on their platform for every "
                "product listed: (1) Legal name and registered address of seller/importer, "
                "(2) Country of Origin, (3) Expiry Date / Best Before, (4) MRP inclusive of "
                "all taxes, (5) Net Quantity, (6) Customer Care contact details. "
                "Marketplace entities bear joint liability for violations by sellers on their platform."
            ),
            category_scope="ALL",
            validation_spec={
                "type": "ecommerce_disclosure",
                "required_fields_on_listing": [
                    "seller_legal_name",
                    "seller_registered_address",
                    "country_of_origin",
                    "expiry_date_or_best_before",
                    "mrp_inclusive_of_taxes",
                    "net_quantity",
                    "customer_care_contact"
                ],
                "marketplace_liability": "Joint and several with seller"
            },
            severity="HIGH",
            is_mandatory=True,
            is_conditional=True,
            condition_description="Applies to all products listed for sale on e-commerce platforms",
            min_fine_inr=50000.0,
            max_fine_inr=500000.0,
            imprisonment_months=0,
            gazette_notification_no="G.S.R. 462(E)",
            gazette_date="2020-07-23",
            effective_from="2020-07-23",
            effective_to=None,
            is_active=True,
        ),
    ]

    db.add_all(rules)
    db.commit()
    print(f"  Seeded {len(rules)} gazette-verified statutory rules.")


if __name__ == "__main__":
    seed_database()
