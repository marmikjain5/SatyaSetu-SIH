"""
SatyaDrishti Deterministic Statutory Validation Service

Implements production-grade compliance validation against gazette-verified statutory rules.

Statutory Sources:
  - Legal Metrology (Packaged Commodities) Rules, 2011 [G.S.R. 882(E)]
  - Legal Metrology Act, 2009 — Section 36(1) penalty compounding
  - G.S.R. 779(E) — Unit Sale Price amendment, effective 1 Jan 2023
  - G.S.R. 1537(E) — Country of Origin amendment, effective 1 Jan 2018
  - FSSAI Food Safety & Standards (Labelling & Display) Regulations, 2020
    [F.No. 1-116/FSSAI/Imports/2021], effective 1 Oct 2022
  - Consumer Protection Act, 2019 — Section 89 penalty provisions
  - Consumer Protection (E-Commerce) Rules, 2020 [G.S.R. 462(E)]
"""

import re
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from enum import Enum


# ─── Result Types ───────────────────────────────────────────────────────────

class ViolationSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class ValidationFinding:
    """A single statutory validation finding for one field."""
    rule_id: str
    rule_code: str
    section_clause: str
    act_name: str
    target_field: str
    title: str
    status: str             # pass | fail | warning | not_applicable
    severity: ViolationSeverity
    evidence: str           # Extracted value or "(Not detected)"
    expected_standard: str  # What the rule requires
    recommendation: str
    min_fine_inr: float
    max_fine_inr: float
    imprisonment_months: int
    estimated_penalty_inr: float = 0.0


@dataclass
class StatutoryAuditReport:
    """Complete statutory audit report for one product scan."""
    scan_id: str
    evaluation_date: str
    product_category: str
    overall_status: str     # compliant | non-compliant | warning
    compliance_score: float  # 0–100
    findings: List[ValidationFinding] = field(default_factory=list)
    total_estimated_penalty_inr: float = 0.0
    violation_count: int = 0
    warning_count: int = 0
    pass_count: int = 0
    missing_declarations: List[str] = field(default_factory=list)
    auto_notice_required: bool = False


# ─── Schedule I: Maximum Permissible Error Table ────────────────────────────
# Source: Legal Metrology (Packaged Commodities) Rules, 2011 — Schedule I
# Rule 6(1)(b) — mandatory for all packed commodities

MPE_TABLE_BY_WEIGHT_G: List[Tuple[float, Optional[float], float, Optional[float]]] = [
    # (from_g, to_g, mpe_percent, fixed_mpe_g)
    # to_g = None means "above this value"
    (0.0,    50.0,    9.0,   None),   # 0–50g: 9%
    (50.0,   100.0,   4.5,   None),   # 50–100g: 4.5%
    (100.0,  200.0,   4.5,   None),   # 100–200g: 4.5%
    (200.0,  300.0,   None,  9.0),    # 200–300g: fixed ±9g
    (300.0,  500.0,   3.0,   None),   # 300–500g: 3%
    (500.0,  1000.0,  1.5,   None),   # 500g–1kg: 1.5%
    (1000.0, 10000.0, 1.5,   None),   # 1kg–10kg: 1.5%
    (10000.0,25000.0, 1.0,   None),   # 10kg–25kg: 1.0%
    (25000.0, None,   0.5,   None),   # >25kg: 0.5%
]

# Rule 7 Table I — Minimum Numeral Height by PDP Area
# Source: Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 7 Table I
PDP_FONT_HEIGHT_TABLE: List[Tuple[Optional[float], float]] = [
    # (max_area_cm2, min_height_mm)
    (50.0,    1.0),
    (100.0,   1.5),
    (500.0,   2.5),
    (None,    4.0),  # Above 500cm²
]

# For blown/moulded/embossed declarations — minimum regardless of area
PDP_BLOWN_MOULDED_MIN_MM = 2.0


def get_mpe_allowance_g(declared_weight_g: float) -> float:
    """
    Returns the Maximum Permissible Error (MPE) in grams for a given declared weight.
    Source: Schedule I, Legal Metrology (Packaged Commodities) Rules, 2011.
    """
    for from_g, to_g, mpe_pct, fixed_g in MPE_TABLE_BY_WEIGHT_G:
        if to_g is None or declared_weight_g < to_g:
            if declared_weight_g >= from_g:
                if fixed_g is not None:
                    return float(fixed_g)
                return declared_weight_g * mpe_pct / 100.0
    # Default: last tier (>25kg → 0.5%)
    return declared_weight_g * 0.005


def get_required_font_height_mm(pdp_area_cm2: float, is_blown_moulded: bool = False) -> float:
    """
    Returns the minimum required numeral height (in mm) for a given PDP area.
    Source: Rule 7 Table I, Legal Metrology (Packaged Commodities) Rules, 2011.
    """
    if is_blown_moulded:
        return PDP_BLOWN_MOULDED_MIN_MM

    for max_area, min_height in PDP_FONT_HEIGHT_TABLE:
        if max_area is None or pdp_area_cm2 <= max_area:
            return min_height
    return 4.0  # Default: largest tier


# ─── Individual Statutory Validators ────────────────────────────────────────

def validate_product_name(value: str) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(a) [G.S.R. 882(E)]"""
    if not value or len(value.strip()) < 3:
        return (
            "fail",
            value or "(Not detected)",
            "Generic/common commodity name must be declared (minimum 3 characters). Brand name alone is insufficient.",
        )
    return ("pass", value, "Generic/common name of commodity declared.")


def validate_mrp(value: str, raw_text: str = "") -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(c) [G.S.R. 882(E)]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            'MRP in format "MRP ₹ XX.XX (inclusive of all taxes)" must be declared.',
        )
    # Check for tax inclusivity statement
    combined = f"{value} {raw_text}".lower()
    has_tax_clause = bool(re.search(
        r'incl(?:usive)?\.?\s*(?:of\s*)?all\s*taxes|all\s*taxes\s*incl',
        combined, re.IGNORECASE
    ))
    if not has_tax_clause:
        return (
            "warning",
            value,
            'MRP must include "inclusive of all taxes" or "(incl. of all taxes)" clause per Rule 6(1)(c).',
        )
    return ("pass", value, "MRP declared inclusive of all taxes.")


def validate_unit_sale_price(value: str, mrp_str: str = "", net_qty_str: str = "") -> Tuple[str, str, str]:
    """
    Rule: PCR-2022-R6(1)(aa) [G.S.R. 779(E), effective 1 Jan 2023]
    USP = MRP ÷ Net Quantity, rounded to 2 decimal places.
    Format: "₹ X.XX per g" or "₹ X.XX per ml"
    Exemption: Not required if USP equals MRP.
    """
    if not value:
        return (
            "fail",
            "(Not detected)",
            'Unit Sale Price (USP) per g or per ml must be declared adjacent to MRP. '
            'Format: "₹ X.XX per g" | Rule 6(1)(aa), G.S.R. 779(E)',
        )
    # Validate USP format
    pattern = r'[₹Rs.]+?\s*\d+(\.\d{1,2})?\s*per\s*(g|ml|kg|l)\b'
    if not re.search(pattern, value, re.IGNORECASE):
        return (
            "warning",
            value,
            'USP format must be "₹ X.XX per g" or "₹ X.XX per ml" with currency symbol and unit.',
        )
    return ("pass", value, "USP declared in correct format (Rule 6(1)(aa)).")


def validate_net_quantity(value: str) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(b) & Rule 11 [G.S.R. 882(E)]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            "Net quantity in standard metric units (g, kg, ml, l) is mandatory per Rule 6(1)(b).",
        )
    # Check for prohibited imperial units
    imperial_match = re.search(r'\b(oz|lbs?|pounds?|fluid\s*oz|fl\.?\s*oz)\b', value, re.IGNORECASE)
    if imperial_match:
        return (
            "fail",
            value,
            f'Imperial unit "{imperial_match.group(0)}" is prohibited. Only metric units (g, kg, ml, l) allowed per Rule 11.',
        )
    # Check for valid metric units
    if not re.search(r'\b(\d+\.?\d*)\s*(g|kg|ml|l|mg|pieces?|units?|nos?|pcs?)\b', value, re.IGNORECASE):
        return (
            "warning",
            value,
            "Net quantity must include a numeric value and a standard metric unit (g, kg, ml, l).",
        )
    return ("pass", value, "Net quantity declared in standard metric units.")


def validate_mpe(declared_weight_g: float, actual_weight_g: float) -> Tuple[str, str, str]:
    """
    Rule: PCR-2011-R6(1)(b) Schedule I — Maximum Permissible Error
    Compares actual vs declared weight against the MPE table.
    """
    mpe_g = get_mpe_allowance_g(declared_weight_g)
    shortfall = declared_weight_g - actual_weight_g

    if shortfall > mpe_g:
        return (
            "fail",
            f"Declared: {declared_weight_g}g | Actual: {actual_weight_g}g | Shortfall: {shortfall:.2f}g",
            f"Shortfall {shortfall:.2f}g exceeds Maximum Permissible Error of {mpe_g:.2f}g "
            f"({(mpe_g/declared_weight_g*100):.1f}%) for {declared_weight_g}g package. [Schedule I]",
        )
    return (
        "pass",
        f"Declared: {declared_weight_g}g | Actual: {actual_weight_g}g | Within MPE: {mpe_g:.2f}g",
        "Actual weight within Maximum Permissible Error tolerance.",
    )


def validate_manufacturer_address(value: str) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(d) [G.S.R. 882(E)]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            "Full manufacturer/packer address with city, state, and 6-digit PIN code is mandatory.",
        )
    if not re.search(r'[1-9][0-9]{5}', value):
        return (
            "warning",
            value,
            "Address must include a valid 6-digit Indian PIN code per Rule 6(1)(d).",
        )
    return ("pass", value, "Manufacturer/packer address with PIN code declared.")


def validate_date_field(value: str, is_mandatory: bool = True, must_not_be_past: bool = False) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(e) [Manufacturing/Packing Date] & FSSAI-2020-Reg5(10) [Expiry]"""
    if not value:
        status = "fail" if is_mandatory else "warning"
        return (
            status,
            "(Not detected)",
            "Date in MM/YYYY, MMM/YYYY, or DD/MM/YYYY format is required.",
        )
    # Validate date formats
    date_pattern = r"""
        (?:
            (?:\d{2}\/\d{2}\/\d{4}) |   # DD/MM/YYYY
            (?:\d{2}\/\d{4})         |   # MM/YYYY
            (?:[A-Z]{3}\/\d{4})      |   # MMM/YYYY
            (?:\d{2}\-\d{2}\-\d{4}) |   # DD-MM-YYYY
            (?:\d{2}\-\d{4})             # MM-YYYY
        )
    """
    if not re.search(date_pattern, value, re.VERBOSE | re.IGNORECASE):
        return (
            "warning",
            value,
            "Date must follow formats: DD/MM/YYYY, MM/YYYY, or MMM/YYYY.",
        )

    if must_not_be_past:
        # Try to parse and check if date is in the past
        try:
            date_match = re.search(r'(\d{2})[\/\-](\d{4})', value)
            if date_match:
                month, year = int(date_match.group(1)), int(date_match.group(2))
                expiry = date(year, month, 1)
                if expiry < date.today():
                    return (
                        "fail",
                        value,
                        f"Expiry/Best Before date {value} is in the past. Product is expired.",
                    )
        except (ValueError, OverflowError):
            pass

    return ("pass", value, "Date declaration in valid format.")


def validate_country_of_origin(value: str) -> Tuple[str, str, str]:
    """Rule: PCR-2017-R6(1)(n) [G.S.R. 1537(E), effective 1 Jan 2018]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            "Country of Origin must be declared prominently per Rule 6(1)(n) [G.S.R. 1537(E)].",
        )
    return ("pass", value, "Country of Origin declared.")


def validate_customer_care(value: str) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(f) [G.S.R. 882(E)]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            "Consumer care contact (phone + email) is mandatory per Rule 6(1)(f).",
        )
    has_phone = bool(re.search(
        r'1800[\s\-]?\d{3}[\s\-]?\d{3,4}|(?:\+91[\s\-]?)?[6-9]\d{4}[\s\-]?\d{5}',
        value
    ))
    has_email = bool(re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', value))
    if not has_phone and not has_email:
        return (
            "warning",
            value,
            "Consumer care details must include a phone number (preferably toll-free 1800-XXX-XXXX) and email.",
        )
    return ("pass", value, "Consumer care contact declared with phone/email.")


def validate_fssai_license(value: str) -> Tuple[str, str, str]:
    """Rule: FSSAI-2020-Reg5(1) [F.No. 1-116/FSSAI/Imports/2021]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            "FSSAI logo and 14-digit license number are mandatory for food products [FSSAI Reg 5(1)].",
        )
    digits_only = re.sub(r'\D', '', value)
    if not re.match(r'^[12]\d{13}$', digits_only):
        return (
            "fail",
            value,
            f"FSSAI license must be exactly 14 digits starting with 1 (registration) or 2 (license). "
            f"Got: '{digits_only}' ({len(digits_only)} digits).",
        )
    return ("pass", value, f"Valid 14-digit FSSAI license number: {digits_only}.")


def validate_batch_number(value: str) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(g) [G.S.R. 882(E)]"""
    if not value:
        return (
            "fail",
            "(Not detected)",
            "Batch/Lot number is mandatory for product traceability per Rule 6(1)(g).",
        )
    if len(value.strip()) < 3:
        return (
            "warning",
            value,
            "Batch number should be at least 3 characters and traceable to manufacturing records.",
        )
    return ("pass", value, "Batch/Lot number declared.")


def validate_importer_details(value: str, country_of_origin: str) -> Tuple[str, str, str]:
    """Rule: PCR-2011-R6(1)(d) — Imported Packages [G.S.R. 882(E)]"""
    is_imported = bool(country_of_origin) and not re.search(r'\bindia\b', country_of_origin, re.IGNORECASE)
    if not is_imported:
        return ("not_applicable", "(Domestic product)", "Importer details not required for domestic goods.")
    if not value:
        return (
            "fail",
            "(Not detected)",
            "Importer name and complete Indian address (with PIN code) are mandatory for imported goods per Rule 6(1)(d).",
        )
    if not re.search(r'[1-9][0-9]{5}', value):
        return (
            "warning",
            value,
            "Importer's Indian address must include a valid 6-digit PIN code.",
        )
    return ("pass", value, "Importer details declared with Indian address.")


# ─── Penalty Estimation ─────────────────────────────────────────────────────

def estimate_statutory_penalty(
    min_fine: float,
    max_fine: float,
    severity: ViolationSeverity,
    is_repeat_offender: bool = False,
) -> float:
    """
    Estimates the compoundable statutory penalty under:
    - Section 36(1), Legal Metrology Act, 2009 (for PCR violations)
    - Section 89, Consumer Protection Act, 2019 (for misleading claims)

    Severity-based interpolation:
    - CRITICAL: 80% of maximum fine (90% for repeat offenders)
    - HIGH: 60% of maximum fine
    - MEDIUM: 40% of maximum fine
    - LOW: minimum fine
    """
    scale = {
        ViolationSeverity.CRITICAL: 0.80,
        ViolationSeverity.HIGH: 0.60,
        ViolationSeverity.MEDIUM: 0.40,
        ViolationSeverity.LOW: 0.0,
    }.get(severity, 0.40)

    if is_repeat_offender and severity == ViolationSeverity.CRITICAL:
        scale = 0.90

    penalty = min_fine + (max_fine - min_fine) * scale
    return round(penalty, 2)


# ─── Composite Score Computation ────────────────────────────────────────────

def compute_compliance_score(findings: List[ValidationFinding]) -> float:
    """
    Computes a weighted compliance score (0–100).
    Weights by severity:
      CRITICAL → 4.0, HIGH → 2.5, MEDIUM → 1.5, LOW → 0.5
    pass = full weight, warning = 50% weight, fail = 0 weight.
    """
    applicable = [f for f in findings if f.status != "not_applicable"]
    if not applicable:
        return 100.0

    WEIGHTS = {
        ViolationSeverity.CRITICAL: 4.0,
        ViolationSeverity.HIGH: 2.5,
        ViolationSeverity.MEDIUM: 1.5,
        ViolationSeverity.LOW: 0.5,
    }

    total_weight = 0.0
    earned_weight = 0.0
    for f in applicable:
        w = WEIGHTS.get(f.severity, 1.0)
        total_weight += w
        if f.status == "pass":
            earned_weight += w
        elif f.status == "warning":
            earned_weight += w * 0.5

    return round((earned_weight / total_weight) * 100, 1) if total_weight > 0 else 100.0


# ─── Main Validation Entry Point ────────────────────────────────────────────

def validate_product_compliance(
    extracted_fields: Dict[str, str],
    scan_id: str = "scan-001",
    product_category: str = "ALL",
    is_repeat_offender: bool = False,
    evaluation_date: Optional[str] = None,
) -> StatutoryAuditReport:
    """
    Production-grade deterministic statutory validation against gazette-verified rules.

    Parameters
    ----------
    extracted_fields : dict
        Extracted field values keyed by field key (e.g., {"mrp": "₹ 250", "netQuantity": "500g"})
    scan_id : str
        Identifier for this scan session.
    product_category : str
        Product category for conditional rule applicability (e.g., "FOOD", "ALL").
    is_repeat_offender : bool
        Whether the manufacturer is a repeat offender (affects penalty estimation).
    evaluation_date : str, optional
        ISO date string for temporal rule evaluation (default: today).

    Returns
    -------
    StatutoryAuditReport
        Complete statutory audit report with findings, score, and penalty.
    """
    eval_date = evaluation_date or datetime.today().strftime("%Y-%m-%d")
    findings: List[ValidationFinding] = []

    def add_finding(
        rule_id: str, rule_code: str, section: str, act: str, field_key: str,
        title: str, status: str, severity: ViolationSeverity,
        evidence: str, expected: str, recommendation: str,
        min_fine: float, max_fine: float, imprisonment: int,
    ) -> None:
        penalty = estimate_statutory_penalty(min_fine, max_fine, severity, is_repeat_offender) \
            if status == "fail" else 0.0
        findings.append(ValidationFinding(
            rule_id=rule_id, rule_code=rule_code, section_clause=section, act_name=act,
            target_field=field_key, title=title, status=status, severity=severity,
            evidence=evidence, expected_standard=expected, recommendation=recommendation,
            min_fine_inr=min_fine, max_fine_inr=max_fine, imprisonment_months=imprisonment,
            estimated_penalty_inr=penalty,
        ))

    g = extracted_fields  # shorthand

    # ── PCR-2011-R6(1)(a): Product Name ──────────────────────────────────
    s, ev, rec = validate_product_name(g.get("productName", ""))
    add_finding("PCR-R6-1A", "PCR-2011-R6(1)(a)", "Rule 6(1)(a)", "Legal Metrology (Packaged Commodities) Rules, 2011",
                "productName", "Mandatory Generic/Common Name of Commodity",
                s, ViolationSeverity.CRITICAL, ev,
                "Generic/common commodity name prominently displayed on PDP.", rec, 25000, 100000, 6)

    # ── PCR-2011-R6(1)(c): MRP ───────────────────────────────────────────
    raw_text = g.get("rawText", "")
    s, ev, rec = validate_mrp(g.get("mrp", ""), raw_text)
    add_finding("PCR-R6-1C", "PCR-2011-R6(1)(c)", "Rule 6(1)(c)", "Legal Metrology (Packaged Commodities) Rules, 2011",
                "mrp", "MRP Declaration — Inclusive of All Taxes",
                s, ViolationSeverity.CRITICAL, ev,
                '"Maximum Retail Price ₹ xx.xx (inclusive of all taxes)"', rec, 25000, 100000, 6)

    # ── PCR-2022-R6(1)(aa): Unit Sale Price ──────────────────────────────
    s, ev, rec = validate_unit_sale_price(g.get("unitSalePrice", ""), g.get("mrp", ""), g.get("netQuantity", ""))
    add_finding("PCR-R6-1AA", "PCR-2022-R6(1)(aa)", "Rule 6(1)(aa) — G.S.R. 779(E)",
                "Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2022)",
                "unitSalePrice", "Mandatory Unit Sale Price (USP) Per g/ml",
                s, ViolationSeverity.HIGH, ev,
                '"₹ X.XX per g" or "₹ X.XX per ml" adjacent to MRP.', rec, 25000, 100000, 6)

    # ── PCR-2011-R6(1)(b): Net Quantity ──────────────────────────────────
    s, ev, rec = validate_net_quantity(g.get("netQuantity", ""))
    add_finding("PCR-R6-1B", "PCR-2011-R6(1)(b)", "Rule 6(1)(b) & Rule 11",
                "Legal Metrology (Packaged Commodities) Rules, 2011",
                "netQuantity", "Net Quantity in Standard Metric Units",
                s, ViolationSeverity.CRITICAL, ev,
                "Net quantity in g, kg, ml, or l. Non-metric units prohibited.", rec, 25000, 100000, 6)

    # ── PCR-2011-R6(1)(d): Manufacturer Address ──────────────────────────
    s, ev, rec = validate_manufacturer_address(g.get("manufacturerAddress", "") or g.get("address", ""))
    add_finding("PCR-R6-1D", "PCR-2011-R6(1)(d)", "Rule 6(1)(d)",
                "Legal Metrology (Packaged Commodities) Rules, 2011",
                "manufacturerAddress", "Manufacturer/Packer Full Address with PIN Code",
                s, ViolationSeverity.HIGH, ev,
                "Complete manufacturing premises address with 6-digit PIN code.", rec, 25000, 50000, 0)

    # ── PCR-2011-R6(1)(e): Manufacturing Date ────────────────────────────
    s, ev, rec = validate_date_field(g.get("manufacturingDate", "") or g.get("packingDate", ""), is_mandatory=True, must_not_be_past=False)
    add_finding("PCR-R6-1E", "PCR-2011-R6(1)(e)", "Rule 6(1)(e)",
                "Legal Metrology (Packaged Commodities) Rules, 2011",
                "manufacturingDate", "Date of Manufacture / Packing / Import",
                s, ViolationSeverity.HIGH, ev,
                'MM/YYYY or MMM/YYYY format with "Mfg Date:" prefix.', rec, 25000, 50000, 0)

    # ── PCR-2011-R6(1)(f): Consumer Care ─────────────────────────────────
    s, ev, rec = validate_customer_care(g.get("customerCare", ""))
    add_finding("PCR-R6-1F", "PCR-2011-R6(1)(f)", "Rule 6(1)(f)",
                "Legal Metrology (Packaged Commodities) Rules, 2011",
                "customerCare", "Consumer Care / Grievance Redressal Contact",
                s, ViolationSeverity.HIGH, ev,
                "Phone number (toll-free preferred) and email address for consumer complaints.", rec, 25000, 50000, 0)

    # ── PCR-2017-R6(1)(n): Country of Origin ─────────────────────────────
    s, ev, rec = validate_country_of_origin(g.get("countryOfOrigin", ""))
    add_finding("PCR-R6-1N", "PCR-2017-R6(1)(n)", "Rule 6(1)(n) — G.S.R. 1537(E)",
                "Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2017)",
                "countryOfOrigin", "Country of Origin / Manufacture Declaration",
                s, ViolationSeverity.CRITICAL, ev,
                '"Made in India" or "Country of Origin: INDIA" prominently displayed.', rec, 50000, 200000, 12)

    # ── PCR-2011-R6(1)(g): Batch Number ──────────────────────────────────
    s, ev, rec = validate_batch_number(g.get("batchNumber", ""))
    add_finding("PCR-R6-1G", "PCR-2011-R6(1)(g)", "Rule 6(1)(g)",
                "Legal Metrology (Packaged Commodities) Rules, 2011",
                "batchNumber", "Batch/Lot Number for Traceability",
                s, ViolationSeverity.MEDIUM, ev,
                'Alphanumeric batch/lot code with "Batch No." or "B.No." prefix.', rec, 10000, 25000, 0)

    # ── Importer Details (Conditional) ───────────────────────────────────
    s, ev, rec = validate_importer_details(g.get("importer", ""), g.get("countryOfOrigin", "India"))
    add_finding("PCR-R6-1D-IMP", "PCR-2011-R6(1)(d)-IMP", "Rule 6(1)(d) — Imported Packages",
                "Legal Metrology (Packaged Commodities) Rules, 2011",
                "importer", "Importer Name & Indian Address (Conditional)",
                s, ViolationSeverity.HIGH, ev,
                "Importer's full legal name and Indian address with PIN code (imported goods only).", rec, 25000, 100000, 6)

    # ── FSSAI-2020-Reg5(1): FSSAI License (Conditional — Food only) ──────
    if product_category in ("FOOD", "ALL"):
        fssai_val = g.get("fssaiLicense", "")
        s, ev, rec = validate_fssai_license(fssai_val)
        add_finding("FSSAI-REG5-1", "FSSAI-2020-Reg5(1)", "Regulation 5(1)",
                    "Food Safety and Standards (Labelling and Display) Regulations, 2020",
                    "fssaiLicense", "FSSAI Logo & 14-Digit License Number",
                    s if fssai_val else "warning",  # warning (not fail) if product might not be food
                    ViolationSeverity.CRITICAL, ev,
                    "Valid 14-digit FSSAI license number starting with 1 or 2.", rec, 100000, 500000, 6)

    # ── FSSAI-2020-Reg5(10): Expiry Date (Conditional — Food only) ───────
    if product_category in ("FOOD", "ALL"):
        s, ev, rec = validate_date_field(g.get("expiryDate", ""), is_mandatory=False, must_not_be_past=True)
        add_finding("FSSAI-REG5-10", "FSSAI-2020-Reg5(10)", "Regulation 5(10)",
                    "Food Safety and Standards (Labelling and Display) Regulations, 2020",
                    "expiryDate", "Expiry Date / Best Before / Use By Date",
                    s, ViolationSeverity.CRITICAL, ev,
                    "Best Before / Use By / Expiry Date in DD/MM/YYYY or MM/YYYY format.", rec, 50000, 300000, 6)

    # ── Aggregation ───────────────────────────────────────────────────────
    violation_count = sum(1 for f in findings if f.status == "fail")
    warning_count = sum(1 for f in findings if f.status == "warning")
    pass_count = sum(1 for f in findings if f.status == "pass")
    total_penalty = sum(f.estimated_penalty_inr for f in findings)
    missing = [f.title for f in findings if f.status == "fail" and f.evidence == "(Not detected)"]

    score = compute_compliance_score(findings)
    overall_status = "compliant" if violation_count == 0 and warning_count == 0 \
        else "warning" if violation_count == 0 \
        else "non-compliant"

    return StatutoryAuditReport(
        scan_id=scan_id,
        evaluation_date=eval_date,
        product_category=product_category,
        overall_status=overall_status,
        compliance_score=score,
        findings=findings,
        total_estimated_penalty_inr=total_penalty,
        violation_count=violation_count,
        warning_count=warning_count,
        pass_count=pass_count,
        missing_declarations=missing,
        auto_notice_required=score < 60 or violation_count >= 2,
    )
