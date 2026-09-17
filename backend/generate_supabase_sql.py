"""
Generates a complete, single-file supabase_setup.sql combining:
1. PostgreSQL Schema definitions (tables, indexes, extensions).
2. Seed data INSERT statements for all tables.
"""

import sys
import json
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

# Set SQLite in-memory DB for exporting seed data
import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from database import engine, Base, SessionLocal
from seed_db import seed_database
from models.db_models import (
    ManufacturerModel,
    ProductModel,
    OCRScanModel,
    ViolationModel,
    ComplaintModel,
    RegulatoryRuleModel,
)

def sql_quote(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (dict, list)):
        json_str = json.dumps(val).replace("'", "''")
        return f"'{json_str}'::jsonb"
    # String escaping
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def dump_table_inserts(session, model, table_name, columns):
    rows = session.query(model).all()
    if not rows:
        return []
    
    lines = [f"\n-- ====================================================", f"-- SEED DATA: {table_name.upper()} ({len(rows)} records)", f"-- ===================================================="]
    for row in rows:
        vals = []
        for col in columns:
            val = getattr(row, col)
            vals.append(sql_quote(val))
        col_list = ", ".join(columns)
        val_list = ", ".join(vals)
        lines.append(f"INSERT INTO {table_name} ({col_list}) VALUES ({val_list}) ON CONFLICT (id) DO NOTHING;")
    return lines

def main():
    print("Initializing in-memory database and populating seed data...")
    seed_database()
    
    db = SessionLocal()
    
    # Read base schema.sql
    schema_path = _backend_dir / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    output_sql = [
        "-- ====================================================================",
        "-- SatyaDrishti Supabase Master SQL Setup Script",
        "-- Paste and run this ENTIRE script in Supabase SQL Editor",
        "-- (Dashboard -> SQL Editor -> New Query -> Run)",
        "-- ====================================================================\n",
        schema_sql,
        "\n\n-- ====================================================================",
        "-- SEED DATA INSERT STATEMENTS",
        "-- ===================================================================="
    ]

    # Dump Manufacturers
    mfg_cols = [
        "id", "name", "cin", "gstin", "registered_address", "risk_tier", "risk_score",
        "repeat_offender_flag", "total_products_scanned", "active_violations",
        "notices_issued", "brands", "top_offense_types", "last_audit_date"
    ]
    output_sql.extend(dump_table_inserts(db, ManufacturerModel, "manufacturers", mfg_cols))

    # Dump Products
    prod_cols = [
        "id", "sku", "title", "brand", "category", "manufacturer_id", "manufacturer_name",
        "country_of_origin", "mrp", "listed_price", "net_weight", "platform",
        "product_url", "image_url", "status", "compliance_score", "ocr_confidence",
        "fssai_license_number", "ingredients_list", "nutritional_info",
        "customer_care_contact", "dietary_type", "claims", "missing_mandatory_fields",
        "regulatory_acts", "last_scanned"
    ]
    output_sql.extend(dump_table_inserts(db, ProductModel, "products", prod_cols))

    # Dump OCR Scans
    ocr_cols = [
        "id", "product_id", "image_url", "raw_extracted_text", "cleaned_text",
        "ocr_engine", "confidence_score", "extracted_parameters", "bounding_boxes",
        "readability_scores", "status"
    ]
    output_sql.extend(dump_table_inserts(db, OCRScanModel, "ocr_scans", ocr_cols))

    # Dump Violations
    viol_cols = [
        "id", "case_number", "product_id", "manufacturer_id", "product_name",
        "brand", "manufacturer", "platform", "rule_code", "section", "act_name",
        "severity", "description", "evidence", "penalty_estimate", "status",
        "notice_id", "assigned_officer", "detected_at", "resolved_at"
    ]
    output_sql.extend(dump_table_inserts(db, ViolationModel, "violations", viol_cols))

    # Dump Regulatory Rules
    rule_cols = [
        "id", "rule_code", "act_name", "section_clause", "target_field", "title",
        "description", "category_scope", "validation_spec", "severity",
        "is_mandatory", "is_conditional", "condition_description", "min_fine_inr",
        "max_fine_inr", "imprisonment_months", "gazette_notification_no",
        "gazette_date", "effective_from", "effective_to", "is_active"
    ]
    # format dates as strings for postgres
    rule_rows = db.query(RegulatoryRuleModel).all()
    if rule_rows:
        output_sql.append("\n-- ====================================================")
        output_sql.append(f"-- SEED DATA: REGULATORY_RULES ({len(rule_rows)} records)")
        output_sql.append("-- ====================================================")
        for r in rule_rows:
            eff_from = r.effective_from.strftime('%Y-%m-%d') if hasattr(r.effective_from, 'strftime') else str(r.effective_from or '2011-11-01')
            eff_to = f"'{r.effective_to.strftime('%Y-%m-%d')}'" if hasattr(r.effective_to, 'strftime') and r.effective_to else (f"'{r.effective_to}'" if r.effective_to else "NULL")
            vals = [
                sql_quote(r.id), sql_quote(r.rule_code), sql_quote(r.act_name),
                sql_quote(r.section_clause), sql_quote(r.target_field), sql_quote(r.title),
                sql_quote(r.description), sql_quote(r.category_scope), sql_quote(r.validation_spec),
                sql_quote(r.severity), sql_quote(r.is_mandatory), sql_quote(r.is_conditional),
                sql_quote(r.condition_description), sql_quote(r.min_fine_inr), sql_quote(r.max_fine_inr),
                sql_quote(r.imprisonment_months), sql_quote(r.gazette_notification_no),
                sql_quote(r.gazette_date), f"'{eff_from}'::date", f"{eff_to}", sql_quote(r.is_active)
            ]
            output_sql.append(f"INSERT INTO regulatory_rules ({', '.join(rule_cols)}) VALUES ({', '.join(vals)}) ON CONFLICT (id) DO NOTHING;")

    # Dump Complaints
    comp_cols = [
        "id", "ticket_id", "product_id", "consumer_name", "consumer_email",
        "consumer_phone", "product_name", "brand", "platform", "order_number",
        "product_url", "description", "category", "ai_matched_rule", "status",
        "sentiment_score", "needs_review", "extracted_evidence_summary",
        "evidence_urls", "assigned_officer", "officer_decision_history", "submitted_at"
    ]
    output_sql.extend(dump_table_inserts(db, ComplaintModel, "complaints", comp_cols))

    db.close()

    root_out_path = Path(__file__).resolve().parent.parent / "supabase_setup.sql"
    with open(root_out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(output_sql))

    print(f"Successfully generated master Supabase SQL script at: {root_out_path}")

if __name__ == "__main__":
    main()
