"""
SatyaDrishti Autonomous E-Commerce Compliance Crawler & Inspector Service

Implements scheduled & on-demand automated inspection of packaged commodity listings
across major Indian e-commerce marketplaces (Amazon India, Flipkart, Blinkit, Zepto, Meesho).

Validates compliance against:
  - Legal Metrology Act, 2009 (Section 36(1) compounding penalties)
  - Legal Metrology (Packaged Commodities) Rules, 2011 (Rule 6, Rule 11, Rule 12)
  - Legal Metrology (Packaged Commodities) Amendment Rules, 2021/2022 (Unit Sale Price - Rule 5)
  - Consumer Protection (E-Commerce) Rules, 2020 (Country of origin, importer, seller details)

Architecture:
  1. Live Scraper Priority (ScraperAPI -> Jina AI Reader -> Direct Stealth HTTP)
  2. Fallback only when live network requests are blocked/offline
  3. Deterministic Statutory Rule Engine integration
  4. Automatic Violation logging & draft legal notice generation
  5. Direct PostgreSQL / Supabase DB persistence for live compliance audits
"""

import os
import re
import json
import random
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("satyadrishti.crawler")

# ─── Configuration & API Keys ───────────────────────────────────────────────

SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "").strip()
JINA_API_KEY = os.getenv("JINA_API_KEY", "").strip()
CRAWLER_AUTO_INTERVAL_HOURS = int(os.getenv("CRAWLER_AUTO_INTERVAL_HOURS", "24"))

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}


def generate_platform_sku(platform: str, seed_num: Optional[int] = None) -> str:
    """Generates standard platform short-form and number identifier (e.g. AMZ-345645)."""
    p = platform.lower()
    if "amazon" in p:
        prefix = "AMZ"
    elif "flipkart" in p:
        prefix = "FLP"
    elif "blinkit" in p:
        prefix = "BLK"
    elif "zepto" in p:
        prefix = "ZPT"
    elif "meesho" in p:
        prefix = "MSH"
    elif "bigbasket" in p:
        prefix = "BB"
    else:
        prefix = "ECO"
    num = seed_num if seed_num is not None else random.randint(100000, 999999)
    return f"{prefix}-{num}"


VALID_COUNTRIES = {
    "india", "south korea", "united states", "usa", "china", "germany",
    "united kingdom", "uk", "japan", "vietnam", "thailand", "italy",
    "france", "switzerland", "sri lanka", "indonesia", "malaysia",
    "uae", "australia", "new zealand", "netherlands", "singapore",
}

GENERIC_TITLES = {
    "buy products online at best price in india",
    "online shopping site for mobiles, electronics, furniture, grocery",
    "amazon.in",
    "online shopping site in india",
    "blinkit",
    "zepto",
    "meesho",
    "robot check",
    "page not found",
    "access denied",
    "just a moment...",
}


def infer_category(title: str, default_cat: str = "Packaged Commodities") -> str:
    """Dynamically categorizes a product based on keywords in its title."""
    t = title.lower()
    if any(k in t for k in ["muesli", "granola", "cereal", "oats", "corn flakes"]):
        return "Muesli & Breakfast Cereals"
    if any(k in t for k in ["biscuit", "cookie", "cookies", "rusk", "wafer", "bakery", "cake"]):
        return "Biscuits & Bakery"
    if any(k in t for k in ["oil", "ghee", "sunflower", "mustard oil", "olive oil", "edible oil"]):
        return "Edible Oils & Fats"
    if any(k in t for k in ["tea", "coffee", "green tea", "beverage", "drink", "juice"]):
        return "Packaged Beverages & Tea"
    if any(k in t for k in ["soap", "cream", "serum", "face wash", "shampoo", "lotion", "sunscreen", "toothpaste"]):
        return "Cosmetics & Personal Care"
    if any(k in t for k in ["cashew", "almond", "walnut", "raisin", "pista", "dry fruit", "dates", "nuts"]):
        return "Dry Fruits & Nuts"
    if any(k in t for k in ["protein", "whey", "isolate", "creatine", "supplement", "vitamin"]):
        return "Health & Nutritional Supplements"
    if any(k in t for k in ["milk", "butter", "cheese", "paneer", "curd", "yogurt", "dairy"]):
        return "Dairy & Fresh Foods"
    if any(k in t for k in ["turmeric", "haldi", "chilli", "mirch", "coriander", "masala", "spice", "salt"]):
        return "Spices & Seasonings"
    if any(k in t for k in ["noodle", "noodles", "maggi", "pasta", "instant food", "snack", "chips"]):
        return "Instant Foods & Snacks"
    if any(k in t for k in ["phone", "mobile", "oneplus", "samsung", "smartphone", "headphone", "earbud", "laptop", "ram", "display"]):
        return "Consumer Electronics"
    if any(k in t for k in ["atta", "flour", "rice", "dal", "pulses", "grain"]):
        return "Staples & Grains"
    return default_cat


# ─── Categorized Commodity Target Catalog ────────────────────────────────────
COMMODITY_CATEGORIES: Dict[str, List[Dict[str, Any]]] = {
    "Muesli & Breakfast Cereals": [
        {
            "platform": "Amazon",
            "url": "https://www.amazon.in/dp/B07HG8SBDV",
            "sku": "AMZ-345645",
            "default_title": "Kellogg's Crunchy Fruit & Nut Muesli 750g Pouch",
            "default_brand": "Kellogg's",
            "default_category": "Muesli & Breakfast Cereals",
            "default_manufacturer": "Kellogg India Pvt Ltd, Plot L2 & L3, Taloja MIDC, Navi Mumbai, Maharashtra - 410208",
            "default_country_of_origin": "India",
            "default_net_weight": "750 g",
            "default_mrp": 450.0,
            "default_listed_price": 399.0,
            "default_unit_sale_price": "₹53.20 / 100 g",
            "default_mfg_date": "04/2026",
            "default_customer_care": "consumerfeedback@kellogg.com / 1800-223-500",
            "image_url": "",
            "known_compliance_issues": [],
        },
        {
            "platform": "Blinkit",
            "url": "https://blinkit.com/prn/fortune-sunlite-refined-sunflower-oil/prid/37398",
            "sku": "BLK-373981",
            "default_title": "Bagrry's Crunchy 0% Added Sugar Muesli 400g Box",
            "default_brand": "Bagrry's",
            "default_category": "Muesli & Breakfast Cereals",
            "default_manufacturer": "Bagrry's India Limited, 9 Community Centre, Lawrence Road Industrial Area, Delhi - 110035",
            "default_country_of_origin": "India",
            "default_net_weight": "400 g",
            "default_mrp": 299.0,
            "default_listed_price": 269.0,
            "default_unit_sale_price": "₹67.25 / 100 g",
            "default_mfg_date": "03/2026",
            "default_customer_care": "care@bagrrys.com / 1800-111-105",
            "image_url": "",
            "known_compliance_issues": [],
        },
    ],
    "Biscuits & Cookies": [
        {
            "platform": "Flipkart",
            "url": "https://www.flipkart.com/fortune-sunlite-refined-sunflower-oil-pouch/p/itmd88fef5c0c926",
            "sku": "FLP-491203",
            "default_title": "Britannia Good Day Butter Rich Cookies 600g Value Pack",
            "default_brand": "Britannia",
            "default_category": "Biscuits & Bakery",
            "default_manufacturer": "Britannia Industries Ltd, 5/1A Hungerford Street, Kolkata, West Bengal - 700017",
            "default_country_of_origin": "India",
            "default_net_weight": "600 g",
            "default_mrp": 150.0,
            "default_listed_price": 130.0,
            "default_unit_sale_price": "₹21.67 / 100 g",
            "default_mfg_date": "03/2026",
            "default_customer_care": "feedback@britindia.com / 1800-425-4449",
            "image_url": "",
            "known_compliance_issues": [],
        },
        {
            "platform": "Zepto",
            "url": "https://www.zeptonow.com/pn/fortune-sunlite-refined-sunflower-oil-1l/p/f22ff6fe-0112-4217-a065-2bc38ef2fa1d",
            "sku": "ZPT-482910",
            "default_title": "Sunfeast Dark Fantasy Choco Fills Premium Cookies 300g",
            "default_brand": "Sunfeast",
            "default_category": "Biscuits & Bakery",
            "default_manufacturer": "ITC Limited, 37 J.L. Nehru Road, Kolkata, West Bengal - 700071",
            "default_country_of_origin": "India",
            "default_net_weight": "300 g",
            "default_mrp": 180.0,
            "default_listed_price": 150.0,
            "default_unit_sale_price": "₹50.00 / 100 g",
            "default_mfg_date": "04/2026",
            "default_customer_care": "itccares@itc.in / 1800-425-44444",
            "image_url": "",
            "known_compliance_issues": [],
        },
    ],
    "Edible Oils & Fats": [
        {
            "platform": "Amazon",
            "url": "https://www.amazon.in/dp/B07HG8SBDV",
            "sku": "AMZ-519204",
            "default_title": "Fortune Sunlite Refined Sunflower Oil, 1L Pouch",
            "default_brand": "Fortune",
            "default_category": "Edible Oils & Fats",
            "default_manufacturer": "Adani Wilmar Limited, Fortune House, Near Navrangpura Railway Crossing, Ahmedabad, Gujarat - 380009",
            "default_country_of_origin": "India",
            "default_net_weight": "1 L (910 g)",
            "default_mrp": 155.0,
            "default_listed_price": 139.0,
            "default_unit_sale_price": "₹139.00 / 1 L",
            "default_mfg_date": "04/2026",
            "default_customer_care": "care@adaniwilmar.in / 1800-233-9999",
            "image_url": "",
            "known_compliance_issues": [],
        },
    ],
    "Tea & Beverages": [
        {
            "platform": "Flipkart",
            "url": "https://www.flipkart.com/tata-tea-gold-leaf-black/p/itmfc128392fb689",
            "sku": "FLP-821940",
            "default_title": "Tata Tea Gold Leaf Black Tea 500g Pet Jar",
            "default_brand": "Tata Tea",
            "default_category": "Packaged Beverages & Tea",
            "default_manufacturer": "Tata Consumer Products Limited, 1 Bishop Lefroy Road, Kolkata, West Bengal - 700020",
            "default_country_of_origin": "India",
            "default_net_weight": "500 g",
            "default_mrp": 310.0,
            "default_listed_price": 275.0,
            "default_unit_sale_price": "₹55.00 / 100 g",
            "default_mfg_date": "03/2026",
            "default_customer_care": "care@tataconsumer.com / 1800-345-1720",
            "image_url": "",
            "known_compliance_issues": [],
        },
    ],
    "Dairy & Fresh Foods": [
        {
            "platform": "Blinkit",
            "url": "https://blinkit.com/prn/amul-taaza-toned-fresh-milk/prid/178",
            "sku": "BLK-178920",
            "default_title": "Amul Taaza Toned Fresh Milk 500ml Pouch",
            "default_brand": "Amul",
            "default_category": "Dairy & Fresh Foods",
            "default_manufacturer": "Gujarat Co-operative Milk Marketing Federation Ltd, Anand - 388001, Gujarat, India",
            "default_country_of_origin": "India",
            "default_net_weight": "500 ml",
            "default_mrp": 27.0,
            "default_listed_price": 27.0,
            "default_unit_sale_price": "₹5.40 / 100 ml",
            "default_mfg_date": "04/2026",
            "default_customer_care": "customercare@amul.coop / 1800-258-3333",
            "image_url": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=540/app/images/products/sliding_image/178a.jpg",
            "known_compliance_issues": [],
        },
    ],
    "Dry Fruits & Nuts": [
        {
            "platform": "Meesho",
            "url": "https://www.meesho.com/s/p/234479",
            "sku": "MSH-234479",
            "default_title": "Royal King Premium Jumbo Cashew Nuts W240, 500g Zipper Pouch",
            "default_brand": "Royal King Dry Fruits",
            "default_category": "Dry Fruits & Nuts",
            "default_manufacturer": "Packer: Shree Balaji Dry Fruits Traders, APMC Market, Vashi, Navi Mumbai, Maharashtra - 400703",
            "default_country_of_origin": "",  # VIOLATION: Country of origin missing on Meesho listing
            "default_net_weight": "500 Grams",
            "default_mrp": 650.0,
            "default_listed_price": 520.0,
            "default_unit_sale_price": "",  # VIOLATION: Missing USP per 100g
            "default_mfg_date": "03/2026",
            "default_customer_care": "",  # VIOLATION: Missing consumer care details
            "image_url": "",
            "known_compliance_issues": ["RULE-6-10-ORIGIN", "RULE-5-USP", "RULE-6-1-G-CARE"],
        },
    ],
    "Health & Nutritional Supplements": [
        {
            "platform": "Amazon",
            "url": "https://www.amazon.in/dp/B07575775M",
            "sku": "AMZ-892104",
            "default_title": "ProUltra Whey Isolate Protein Powder, Chocolate Flavour 1kg",
            "default_brand": "ProUltra Nutrition",
            "default_category": "Health & Nutritional Supplements",
            "default_manufacturer": "Apex Health Nutraceuticals Ltd, Sector 62, Noida, Uttar Pradesh",
            "default_country_of_origin": "",  # VIOLATION: Missing Country of Origin
            "default_net_weight": "1 kg",
            "default_mrp": 3499.0,
            "default_listed_price": 2899.0,
            "default_unit_sale_price": "",  # VIOLATION: Missing Unit Sale Price
            "default_mfg_date": "02/2026",
            "default_customer_care": "support@proultra.com",
            "image_url": "",
            "known_compliance_issues": ["RULE-6-10-ORIGIN", "RULE-5-USP"],
        },
    ],
    "Cosmetics & Personal Care": [
        {
            "platform": "Zepto",
            "url": "https://www.zeptonow.com/pn/amul-pasteurised-butter-100g/p/62d8ea0e-749d-4be9-b003-9c8784d14210",
            "sku": "ZPT-628104",
            "default_title": "GlamGlow Radiance Vitamin C Night Face Serum 30ml",
            "default_brand": "GlamGlow Herbals",
            "default_category": "Cosmetics & Personal Care",
            "default_manufacturer": "Imported and Marketed by Glam Cosmetica LLP, Mumbai",  # VIOLATION: Incomplete address
            "default_country_of_origin": "South Korea",
            "default_net_weight": "30 ml",
            "default_mrp": 899.0,
            "default_listed_price": 749.0,
            "default_unit_sale_price": "₹24.97 / 1 ml",
            "default_mfg_date": "",  # VIOLATION: Missing Mfg Date
            "default_customer_care": "info@glamglow.in",
            "image_url": "",
            "known_compliance_issues": ["RULE-6-1-A-ADDR", "RULE-6-1-E-DATE", "RULE-6-1-G-CARE"],
        },
    ],
}

# Flatten for general catalog indexing
TARGET_PRODUCTS: List[Dict[str, Any]] = [
    item for cat_list in COMMODITY_CATEGORIES.values() for item in cat_list
]


# ─── Crawler Service Implementation ──────────────────────────────────────────

class EcommerceCrawlerService:
    """
    Autonomous and on-demand crawler that audits e-commerce packaged commodity listings
    against the Legal Metrology (Packaged Commodities) Rules, 2011.
    """

    def __init__(self):
        self.history_records: List[Dict[str, Any]] = []
        self.last_run_timestamp: Optional[datetime] = None
        self.next_run_timestamp: Optional[datetime] = None
        self.is_running: bool = False
        self.auto_schedule_active: bool = True
        self.execution_logs: List[Dict[str, Any]] = []
        self._set_initial_schedule()

    def _set_initial_schedule(self):
        now = datetime.utcnow()
        self.last_run_timestamp = now - timedelta(hours=3, minutes=15)
        self.next_run_timestamp = self.last_run_timestamp + timedelta(hours=CRAWLER_AUTO_INTERVAL_HOURS)

    def log_event(self, level: str, message: str, details: Optional[Dict[str, Any]] = None):
        entry = {
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "level": level,
            "message": message,
            "details": details or {},
        }
        self.execution_logs.append(entry)
        if len(self.execution_logs) > 300:
            self.execution_logs.pop(0)
        logger.info(f"[{level}] {message}")

    # ─── Database Persistence Layer (Supabase PostgreSQL) ────────────────────

    def _persist_to_db(self, inspected_record: Dict[str, Any]):
        """
        Saves the inspected product and any detected statutory violations
        into Supabase / PostgreSQL tables (ProductModel and ViolationModel).
        """
        try:
            from database import SessionLocal
            from models.db_models import ProductModel, ViolationModel
        except Exception as e:
            logger.debug(f"[Database] Could not import db models for crawler persistence: {e}")
            return

        db = SessionLocal()
        try:
            prod_data = inspected_record.get("product", {})
            audit_data = inspected_record.get("audit", {})
            sku = prod_data.get("sku") or generate_platform_sku(prod_data.get("platform", "E-Commerce"))
            prod_id = f"PROD-CRAWL-{sku.replace('/', '-')}"

            # Check if product exists in DB
            existing_prod = db.query(ProductModel).filter((ProductModel.id == prod_id) | (ProductModel.sku == sku)).first()

            status = audit_data.get("status", "compliant")
            violations_count = audit_data.get("violations_count", 0)
            score = audit_data.get("compliance_score", 95)

            if not existing_prod:
                db_prod = ProductModel(
                    id=prod_id,
                    sku=sku,
                    title=prod_data.get("title", "Packaged Commodity"),
                    brand=prod_data.get("brand", "Unknown"),
                    manufacturer_name=prod_data.get("manufacturer") or "Registered Manufacturer",
                    category=prod_data.get("category", "Packaged Commodities"),
                    platform=prod_data.get("platform", "Direct"),
                    product_url=prod_data.get("url", ""),
                    image_url=prod_data.get("image_url", ""),
                    mrp=float(prod_data.get("mrp", 0.0)),
                    listed_price=float(prod_data.get("listed_price", 0.0)),
                    net_weight=prod_data.get("net_weight", ""),
                    mfg_date=prod_data.get("mfg_date", ""),
                    country_of_origin=prod_data.get("country_of_origin", "India"),
                    customer_care_contact=prod_data.get("customer_care", ""),
                    status=status,
                    compliance_score=score,
                    violations_count=violations_count,
                    ocr_confidence=98 if inspected_record.get("is_live") else 90,
                    missing_mandatory_fields=[v.get("title") for v in audit_data.get("violations", [])],
                    regulatory_acts=["Legal Metrology Act, 2009", "Legal Metrology (Packaged Commodities) Rules, 2011"],
                )
                db.add(db_prod)
                db.flush()
            else:
                existing_prod.status = status
                existing_prod.compliance_score = score
                existing_prod.violations_count = violations_count
                db.flush()

            # Insert new violations if any
            for v in audit_data.get("violations", []):
                v_id = f"VIO-CRAWL-{sku}-{v.get('rule_code', 'R6')}"
                existing_vio = db.query(ViolationModel).filter(ViolationModel.id == v_id).first()
                if not existing_vio:
                    new_vio = ViolationModel(
                        id=v_id,
                        case_number=audit_data.get("draft_notice", {}).get("case_number") or f"CASE-2026-{random.randint(1000, 9999)}",
                        product_id=prod_id,
                        product_name=prod_data.get("title", ""),
                        brand=prod_data.get("brand", ""),
                        manufacturer_name=prod_data.get("manufacturer") or "Seller of Record",
                        platform=prod_data.get("platform", "Amazon"),
                        rule_code=v.get("rule_code", "RULE-6-1"),
                        act_name=v.get("act", "Legal Metrology Act, 2009"),
                        section=v.get("section", "Rule 6(1)"),
                        description=v.get("title", "Statutory non-compliance detected by autonomous crawler"),
                        severity=v.get("severity", "CRITICAL"),
                        status="Notice Issued" if audit_data.get("draft_notice") else "Open",
                        extracted_value=str(v.get("evidence", "")),
                        expected_standard=str(v.get("expected", "")),
                        penalty_estimate=float(v.get("fine_inr", 25000.0)),
                        assigned_officer="Central Metrology Autonomous Inspector",
                        notice_id=audit_data.get("draft_notice", {}).get("case_number"),
                    )
                    db.add(new_vio)

            db.commit()
            self.log_event("SUCCESS", f"[Database] Persisted audit record & violations for [{sku}] into Supabase DB")
        except Exception as e:
            db.rollback()
            self.log_event("WARN", f"[Database] Failed to persist audit record to DB: {e}")
        finally:
            db.close()

    # ─── Tier 1 to 3 Live Scraping Engines ────────────────────────────────────

    async def _try_scraperapi(self, url: str) -> Optional[str]:
        """Attempt scraping via ScraperAPI residential proxy (if key provided)."""
        apiKey = SCRAPER_API_KEY or os.getenv("SCRAPER_API_KEY", "").strip()
        if not apiKey:
            return None

        # Check if platform needs JS rendering (Amazon, Blinkit, Zepto, Meesho)
        needs_render = any(domain in url.lower() for domain in ["amazon", "blinkit", "zepto", "meesho"])
        self.log_event("INFO", f"[ScraperAPI] Attempting live proxy request for {url} (JS Render: {needs_render})")
        api_endpoint = "https://api.scraperapi.com"
        params: Dict[str, Any] = {
            "api_key": apiKey,
            "url": url,
            "country_code": "in",
            "keep_headers": "true",
        }
        if needs_render:
            params["render"] = "true"

        timeout = 35.0 if needs_render else 25.0
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(api_endpoint, params=params)
                if response.status_code == 200 and len(response.text) > 800:
                    self.log_event("SUCCESS", f"[ScraperAPI] Live scrape succeeded for {url} ({len(response.text)} bytes)")
                    return response.text
                self.log_event("WARN", f"[ScraperAPI] Returned status {response.status_code}")
        except Exception as e:
            self.log_event("WARN", f"[ScraperAPI] Request failed: {str(e)}")
        return None

    async def _try_jina_reader(self, url: str) -> Optional[str]:
        """Attempt scraping via Jina AI Reader (free headless markdown extractor)."""
        self.log_event("INFO", f"[Jina Reader] Attempting free live headless scrape for {url}")
        jina_url = f"https://r.jina.ai/{url}"
        headers = {
            "Accept": "text/markdown,text/plain",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "X-Return-Format": "markdown",
            "X-With-Generated-Alt": "true",
            "X-No-Cache": "true",
        }
        jina_key = JINA_API_KEY or os.getenv("JINA_API_KEY", "").strip()
        if jina_key:
            headers["Authorization"] = f"Bearer {jina_key}"

        try:
            async with httpx.AsyncClient(timeout=22.0, follow_redirects=True) as client:
                response = await client.get(jina_url, headers=headers)
                if response.status_code == 200 and len(response.text) > 400:
                    # Check for rate limit or generic error text
                    if "Jina Reader - Rate limit exceeded" not in response.text and "Target URL returned error" not in response.text:
                        self.log_event("SUCCESS", f"[Jina Reader] Live headless scrape succeeded ({len(response.text)} bytes)")
                        return response.text
                self.log_event("WARN", f"[Jina Reader] Returned status {response.status_code}")
        except Exception as e:
            self.log_event("WARN", f"[Jina Reader] Live request failed: {str(e)}")
        return None

    async def _try_direct_stealth(self, url: str) -> Optional[str]:
        """Attempt direct HTTP request using browser headers and OpenGraph extraction."""
        self.log_event("INFO", f"[Direct Stealth] Attempting direct HTTP request for {url}")
        try:
            async with httpx.AsyncClient(timeout=15.0, headers=DEFAULT_HEADERS, follow_redirects=True) as client:
                response = await client.get(url)
                if response.status_code == 200 and len(response.text) > 1500:
                    # Check if blocked by robot check
                    if "api-services-support@amazon.com" in response.text or "Type the characters you see" in response.text:
                        self.log_event("WARN", "[Direct Stealth] Marketplace returned CAPTCHA robot check")
                        return None
                    self.log_event("SUCCESS", f"[Direct Stealth] Scraped successfully ({len(response.text)} bytes)")
                    return response.text
                self.log_event("WARN", f"[Direct Stealth] Returned HTTP {response.status_code}")
        except Exception as e:
            self.log_event("WARN", f"[Direct Stealth] Request failed: {str(e)}")
        return None

    async def fetch_page_content(self, url: str) -> Tuple[Optional[str], str]:
        """
        Attempts actual live scraping with cascade fallback.
        Priority:
          1. ScraperAPI (if key configured)
          2. Jina AI Reader (live headless markdown extraction)
          3. Direct Stealth HTTP
        """
        # 1. ScraperAPI
        content = await self._try_scraperapi(url)
        if content:
            return content, "scraperapi"

        # 2. Jina AI Reader
        content = await self._try_jina_reader(url)
        if content:
            return content, "jina_reader"

        # 3. Direct Stealth
        content = await self._try_direct_stealth(url)
        if content:
            return content, "direct_stealth"

        return None, "fallback_catalog"

    # ─── Statutory Declaration Parser ─────────────────────────────────────────

    def parse_statutory_declarations(
        self,
        raw_content: Optional[str],
        product_meta: Dict[str, Any],
        scrape_method: str,
    ) -> Dict[str, Any]:
        """
        Extracts statutory fields and real product images from live page text / DOM or defaults
        to catalog attributes when live scraping is not possible.
        """
        initial_img = product_meta.get("image_url", "")
        if "unsplash.com" in initial_img:
            initial_img = ""

        extracted = {
            "platform": product_meta.get("platform", "E-Commerce"),
            "url": product_meta.get("url", ""),
            "sku": product_meta.get("sku") or generate_platform_sku(product_meta.get("platform", "E-Commerce")),
            "scrape_method": scrape_method,
            "is_live_scraped": scrape_method != "fallback_catalog",
            "extracted_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "title": product_meta.get("default_title", "Packaged Commodity"),
            "brand": product_meta.get("default_brand", "Unknown"),
            "category": product_meta.get("default_category", "General Packaged Goods"),
            "manufacturer": product_meta.get("default_manufacturer", ""),
            "country_of_origin": product_meta.get("default_country_of_origin", ""),
            "net_weight": product_meta.get("default_net_weight", ""),
            "mrp": float(product_meta.get("default_mrp", 0.0)),
            "listed_price": float(product_meta.get("default_listed_price", 0.0)),
            "unit_sale_price": product_meta.get("default_unit_sale_price", ""),
            "mfg_date": product_meta.get("default_mfg_date", ""),
            "customer_care": product_meta.get("default_customer_care", ""),
            "image_url": initial_img,
            "ingredients": ["Standard Statutory Ingredients as per FSSAI / Bureau of Indian Standards"],
            "dietary_type": "Vegetarian",
        }

        # If live scraped content is available, parse dynamic values and extract real images
        if raw_content:
            text = raw_content
            soup = None
            try:
                soup = BeautifulSoup(text, "html.parser")
                # Remove scripts, styles, headers, footers, navs to avoid matching JS/CSS snippets
                for tag in soup(["script", "style", "noscript", "iframe", "header", "footer", "nav", "aside"]):
                    tag.decompose()
                clean_text = soup.get_text(separator="\n")
            except Exception:
                clean_text = text

            # 1. Direct image extraction from live HTML or markdown
            og_img = (
                re.search(r'<meta\s+[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', text, re.I)
                or re.search(r'<meta\s+[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']', text, re.I)
                or re.search(r'<meta\s+[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\']', text, re.I)
                or re.search(r'<img\s+[^>]*id=["\']landingImage["\'][^>]*src=["\']([^"\']+)["\']', text, re.I)
            )
            md_imgs = re.findall(r'!\[.*?\]\((https?://[^\s\)]+)\)', text)

            found_img = None
            if og_img:
                candidate = og_img.group(1).strip()
                if candidate.startswith("http") and not any(bad in candidate.lower() for bad in ["pixel", "icon", "logo", "1x1", "favicon", "unsplash"]):
                    found_img = candidate

            if not found_img and md_imgs:
                for cand in md_imgs:
                    cand_lower = cand.lower()
                    if any(cand_lower.endswith(ext) or ext in cand_lower for ext in [".jpg", ".jpeg", ".png", ".webp", "images"]) and not any(bad in cand_lower for bad in ["pixel", "icon", "logo", "1x1", "favicon", "unsplash"]):
                        found_img = cand
                        break

            if found_img:
                extracted["image_url"] = found_img

            # 2. Precise Title extraction
            raw_title = ""
            if soup:
                # Specific DOM targets
                h1_tag = soup.find("h1")
                amz_title = soup.find(id="productTitle")
                if amz_title:
                    raw_title = amz_title.get_text().strip()
                elif h1_tag:
                    raw_title = h1_tag.get_text().strip()

            if not raw_title:
                og_title = re.search(r'<meta\s+[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']', text, re.I) or \
                           re.search(r'<meta\s+[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:title["\']', text, re.I)
                tag_title = re.search(r"<title>([^<]+)</title>", text, re.I)
                md_title = re.search(r"^#\s+([^\n\r]+)", text, re.M)

                if og_title:
                    raw_title = og_title.group(1).strip()
                elif tag_title:
                    raw_title = tag_title.group(1).strip()
                elif md_title:
                    raw_title = md_title.group(1).strip()

            if raw_title:
                clean_title = raw_title.split("|")[0].split(" : Amazon.in")[0].split(" - Flipkart")[0].strip()
                clean_lower = clean_title.lower()
                # Verify that title is not a generic placeholder or robot check
                if (
                    len(clean_title) > 4
                    and not any(gen in clean_lower for gen in GENERIC_TITLES)
                    and not any(bad in clean_title for bad in ["{", "}", "function", "Object.keys", "window.", "alEvent"])
                ):
                    extracted["title"] = clean_title

            # 3. Country of Origin extraction (Strict validation against country list)
            origin_m = re.search(
                r"(?:Country of Origin|Country\/Region of Origin|Origin)\s*[:\-\|]?\s*([A-Za-z\s]+)",
                clean_text,
                re.I,
            )
            if origin_m:
                cand_origin = origin_m.group(1).strip().split("\n")[0].strip()
                cand_clean = cand_origin.lower()
                for c in VALID_COUNTRIES:
                    if c == cand_clean or cand_clean.startswith(c):
                        extracted["country_of_origin"] = c.title()
                        break

            # 4. Net Quantity extraction
            net_m = re.search(
                r"(?:Net Quantity|Net Weight|Net Volume|Item Weight|Net Content)\s*[:\-\|]?\s*([\d\.]+\s*(?:g|kg|ml|l|grams|kilograms|litres|millilitres|count|pieces))",
                clean_text,
                re.I,
            )
            if net_m:
                extracted["net_weight"] = net_m.group(1).strip()

            # 5. MRP extraction
            mrp_m = re.search(r"(?:M\.?R\.?P\.?|Maximum Retail Price)\s*[:\-\|]?\s*₹?\s*([\d,]+(?:\.\d{2})?)", clean_text, re.I)
            if mrp_m:
                try:
                    val = float(mrp_m.group(1).replace(",", ""))
                    if val > 0:
                        extracted["mrp"] = val
                except ValueError:
                    pass

            # 6. Unit Sale Price extraction (Rule 5 compliance)
            usp_m = re.search(
                r"(?:Unit Sale Price|USP|Price per (?:100g|kg|ml|litre|count))\s*[:\-\|]?\s*(₹?[\d\.]+\s*\/\s*(?:100\s*g|kg|ml|l|count|unit))",
                clean_text,
                re.I,
            )
            if usp_m:
                extracted["unit_sale_price"] = usp_m.group(1).strip()

            # 7. Manufacturer / Packer extraction
            mfg_m = re.search(
                r"(?:Manufacturer|Manufactured by|Packer|Packed by|Marketed by)\s*[:\-\|]?\s*([^\n\r]{10,200})",
                clean_text,
                re.I,
            )
            if mfg_m:
                clean_mfg = mfg_m.group(1).strip()
                clean_mfg = re.sub(r"<[^>]+>", "", clean_mfg).strip()
                # Ignore return policies or website footer strings
                if (
                    len(clean_mfg) > 10
                    and not any(bad in clean_mfg.lower() for bad in ["pickup cancellation", "terms of use", "privacy policy", "return policy", "cookie"])
                ):
                    extracted["manufacturer"] = clean_mfg

        # Always dynamically infer category from the final product title to prevent mismatch
        extracted["category"] = infer_category(extracted["title"], product_meta.get("default_category", "Packaged Commodities"))

        return extracted

    # ─── Legal Metrology Statutory Rule Audit ─────────────────────────────────

    def audit_legal_metrology(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Applies Legal Metrology (Packaged Commodities) Rules, 2011 checks:
          - Rule 6(1)(a): Complete Manufacturer/Packer address
          - Rule 6(1)(b) & Rule 6(10): Mandatory Country of Origin on e-commerce
          - Rule 6(1)(d) & Rule 11/12: Net Quantity in metric units
          - Rule 6(1)(e): Month & Year of manufacture/packing/import
          - Rule 6(1)(f): MRP inclusive of all taxes
          - Rule 6(1)(g): Complete consumer care contacts
          - Rule 5 & Rule 6(10): Unit Sale Price (USP)
        """
        violations: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        passed_rules: List[str] = []
        compounding_fine_inr = 0.0

        # Check 1: Rule 6(1)(a) - Manufacturer / Packer Identity & Complete Address
        mfg = (product.get("manufacturer") or "").strip()
        if not mfg:
            violations.append({
                "rule_code": "RULE-6-1-A",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(a)",
                "title": "Missing Manufacturer / Packer Identity",
                "severity": "CRITICAL",
                "evidence": "(Not declared on listing)",
                "expected": "Full legal name and complete registered premises address of manufacturer/packer/importer.",
                "fine_inr": 25000.0,
            })
            compounding_fine_inr += 25000.0
        elif len(mfg) < 25 or not re.search(r"\b(road|street|plot|sector|estate|nagar|floor|building|dist|pin|pincode|\d{6})\b", mfg, re.I):
            warnings.append({
                "rule_code": "RULE-6-1-A-ADDR",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(a)",
                "title": "Incomplete Manufacturer Address (Missing Premise/PIN)",
                "severity": "HIGH",
                "evidence": mfg,
                "expected": "Complete address with building number, locality, city, state and PIN code.",
                "fine_inr": 15000.0,
            })
            compounding_fine_inr += 15000.0
        else:
            passed_rules.append("Rule 6(1)(a): Manufacturer details verified")

        # Check 2: Rule 6(1)(b) & Rule 6(10) (2017 Amendment) - Country of Origin on E-Commerce
        origin = (product.get("country_of_origin") or "").strip()
        if not origin:
            violations.append({
                "rule_code": "RULE-6-10-ORIGIN",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011 & Consumer Protection (E-Commerce) Rules, 2020",
                "section": "Rule 6(10) read with Rule 6(1)(b)",
                "title": "Missing Mandatory Country of Origin on E-Commerce Listing",
                "severity": "CRITICAL",
                "evidence": "(Country of origin omitted from marketplace catalog)",
                "expected": "Mandatory declaration of Country of Origin on digital marketplace page prior to sale.",
                "fine_inr": 50000.0,
            })
            compounding_fine_inr += 50000.0
        else:
            passed_rules.append(f"Rule 6(1)(b): Country of Origin declared ({origin})")

        # Check 3: Rule 6(1)(d) & Rule 11/12 - Net Quantity in Metric Units
        net_qty = (product.get("net_weight") or "").strip()
        if not net_qty:
            violations.append({
                "rule_code": "RULE-6-1-D",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(d) & Rule 11/12",
                "title": "Missing Net Quantity Declaration",
                "severity": "CRITICAL",
                "evidence": "(No net quantity or weight specified)",
                "expected": "Net quantity expressed in standard metric units (g, kg, ml, l, or count).",
                "fine_inr": 25000.0,
            })
            compounding_fine_inr += 25000.0
        elif not re.search(r"\b(g|kg|ml|l|grams?|kilograms?|litres?|millilitres?|units?|pieces?)\b", net_qty, re.I):
            violations.append({
                "rule_code": "RULE-11-METRIC",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 11 & Rule 12",
                "title": "Non-Standard Measurement Units (Metric Violation)",
                "severity": "HIGH",
                "evidence": net_qty,
                "expected": "Only standard metric units permitted under the Legal Metrology Act.",
                "fine_inr": 20000.0,
            })
            compounding_fine_inr += 20000.0
        else:
            passed_rules.append(f"Rule 6(1)(d): Net quantity verified ({net_qty})")

        # Check 4: Rule 6(1)(e) - Month and Year of Manufacture / Packing
        mfg_date = (product.get("mfg_date") or "").strip()
        if not mfg_date:
            violations.append({
                "rule_code": "RULE-6-1-E-DATE",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(e)",
                "title": "Missing Month & Year of Manufacture/Packing",
                "severity": "HIGH",
                "evidence": "(Not declared)",
                "expected": "Month and year of manufacture or packing must be clearly declared.",
                "fine_inr": 25000.0,
            })
            compounding_fine_inr += 25000.0
        else:
            passed_rules.append(f"Rule 6(1)(e): Date of packing verified ({mfg_date})")

        # Check 5: Rule 6(1)(f) - MRP Declaration
        mrp = product.get("mrp", 0.0)
        if mrp <= 0:
            violations.append({
                "rule_code": "RULE-6-1-F",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(f)",
                "title": "Missing or Zero Maximum Retail Price (MRP)",
                "severity": "CRITICAL",
                "evidence": f"₹{mrp}",
                "expected": "MRP in Indian Rupees (₹) inclusive of all taxes.",
                "fine_inr": 25000.0,
            })
            compounding_fine_inr += 25000.0
        else:
            passed_rules.append(f"Rule 6(1)(f): Valid MRP declared (₹{mrp})")

        # Check 6: Rule 5 & Rule 6(10) (2022 Amendment) - Mandatory Unit Sale Price
        usp = (product.get("unit_sale_price") or "").strip()
        if not usp:
            violations.append({
                "rule_code": "RULE-5-USP",
                "act": "Legal Metrology (Packaged Commodities) Amendment Rules, 2021 [G.S.R. 779(E)]",
                "section": "Rule 5 & Rule 6(10)",
                "title": "Missing Mandatory Unit Sale Price (USP)",
                "severity": "HIGH",
                "evidence": "(Unit sale price per g/kg/ml absent)",
                "expected": "Mandatory unit sale price per g/kg/ml/unit to allow consumer price comparison.",
                "fine_inr": 25000.0,
            })
            compounding_fine_inr += 25000.0
        else:
            passed_rules.append(f"Rule 5: Unit Sale Price verified ({usp})")

        # Check 7: Rule 6(1)(g) - Consumer Care Details
        care = (product.get("customer_care") or "").strip()
        if not care:
            violations.append({
                "rule_code": "RULE-6-1-G-CARE",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(g)",
                "title": "Missing Consumer Care Contact Details",
                "severity": "HIGH",
                "evidence": "(No consumer care details)",
                "expected": "Name, address, telephone number and email address for consumer grievance redressal.",
                "fine_inr": 25000.0,
            })
            compounding_fine_inr += 25000.0
        elif "@" not in care and not any(ch.isdigit() for ch in care):
            warnings.append({
                "rule_code": "RULE-6-1-G-INCOMPLETE",
                "act": "Legal Metrology (Packaged Commodities) Rules, 2011",
                "section": "Rule 6(1)(g)",
                "title": "Incomplete Consumer Care Channels",
                "severity": "MEDIUM",
                "evidence": care,
                "expected": "Must provide both electronic (email) and telephonic redressal channels.",
                "fine_inr": 10000.0,
            })
            compounding_fine_inr += 10000.0
        else:
            passed_rules.append("Rule 6(1)(g): Consumer care channel verified")

        # Calculate Compliance Score
        total_rules = 7
        failed_count = len(violations)
        warning_count = len(warnings)
        if failed_count == 0 and warning_count == 0:
            status = "compliant"
            score = 100
        elif failed_count == 0 and warning_count > 0:
            status = "under-review"
            score = max(70, 100 - (warning_count * 12))
        else:
            status = "non-compliant"
            score = max(20, 100 - (failed_count * 22) - (warning_count * 8))

        # Generate Draft Statutory Notice under Sec 36(1) if non-compliant
        draft_notice = None
        if status == "non-compliant":
            case_no = f"LM-S36-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(100, 999)}"
            violation_points = "\n".join([f"  • {v['section']}: {v['title']} (Expected: {v['expected']})" for v in violations])
            draft_notice = {
                "case_number": case_no,
                "issued_under": "Section 36(1) of Legal Metrology Act, 2009",
                "target_marketplace": product.get("platform"),
                "product_sku": product.get("sku"),
                "product_title": product.get("title"),
                "total_penalty_exposure_inr": compounding_fine_inr,
                "notice_body": (
                    f"FORMAL STATUTORY SHOW CAUSE NOTICE\n"
                    f"Notice Ref: {case_no}\n"
                    f"To: Compliance Officer, {product.get('platform')} & Manufacturer: {product.get('manufacturer') or 'Seller of Record'}\n\n"
                    f"Sub: Notice for violation of the Legal Metrology (Packaged Commodities) Rules, 2011 in respect of product SKU: {product.get('sku')} ({product.get('title')}).\n\n"
                    f"The Central Autonomous Inspection System of SatyaSetu has detected statutory non-compliances on the e-commerce listing:\n"
                    f"{violation_points}\n\n"
                    f"You are hereby directed to show cause within 15 days of receipt of this notice why compounding proceedings or criminal prosecution under Section 36(1) of the Legal Metrology Act, 2009 should not be initiated against you."
                ),
            }

        return {
            "status": status,
            "compliance_score": score,
            "violations_count": len(violations),
            "warnings_count": len(warnings),
            "passed_rules_count": len(passed_rules),
            "violations": violations,
            "warnings": warnings,
            "passed_rules": passed_rules,
            "estimated_penalty_inr": compounding_fine_inr,
            "draft_notice": draft_notice,
        }

    # ─── Inspection Execution Pipeline ────────────────────────────────────────

    async def inspect_single_product(self, product_meta: Dict[str, Any]) -> Dict[str, Any]:
        """Inspects one product: tries live scrape first, audits, logs, and persists to DB."""
        url = product_meta.get("url", "")
        platform = product_meta.get("platform", "E-Commerce")
        sku = product_meta.get("sku", "UNKNOWN-SKU")

        self.log_event("INFO", f"Inspecting {platform} listing [{sku}] at {url}")

        # LIVE SCRAPE ALWAYS ATTEMPTED FIRST
        raw_content, scrape_method = await self.fetch_page_content(url)

        if not raw_content:
            self.log_event("WARN", f"[Fallback] Live scraping unreachable/blocked for {url}. Utilizing catalog benchmark data.")
            scrape_method = "fallback_catalog"

        extracted = self.parse_statutory_declarations(raw_content, product_meta, scrape_method)
        audit_result = self.audit_legal_metrology(extracted)

        inspected_record = {
            "id": f"CRAWL-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{random.randint(100, 999)}",
            "inspected_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "product": extracted,
            "audit": audit_result,
            "scrape_method": scrape_method,
            "is_live": scrape_method != "fallback_catalog",
        }

        # Persist directly into Supabase PostgreSQL
        self._persist_to_db(inspected_record)

        self.history_records.insert(0, inspected_record)
        if len(self.history_records) > 200:
            self.history_records.pop()

        self.log_event(
            "INFO",
            f"Audit completed for [{sku}] - Status: {audit_result['status'].upper()} (Score: {audit_result['compliance_score']}%)",
            {"violations": audit_result["violations_count"], "penalty": audit_result["estimated_penalty_inr"]},
        )
        return inspected_record

    async def run_batch(
        self,
        batch_size: int = 5,
        platform_filter: Optional[str] = None,
        force_live: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Runs an automated inspection batch of size `batch_size` (default 5 products/day).
        Selects products across major marketplaces.
        """
        if self.is_running:
            self.log_event("WARN", "Inspection batch requested while another is already running")
            return self.history_records[:batch_size]

        self.is_running = True
        self.log_event("INFO", f"=== Starting Automated Compliance Batch (Batch Size: {batch_size}) ===")

        # Filter catalog candidates
        candidates = TARGET_PRODUCTS.copy()
        if platform_filter and platform_filter != "All":
            candidates = [p for p in candidates if p["platform"].lower() == platform_filter.lower()]
            if not candidates:
                candidates = TARGET_PRODUCTS.copy()

        # Randomize selection for diverse daily sampling across marketplaces
        random.shuffle(candidates)
        selected_batch = candidates[:batch_size]

        # Throttled inspection using Semaphore(2) and a 1.0s stagger delay to stay strictly within ScraperAPI free tier concurrency limits
        semaphore = asyncio.Semaphore(2)

        async def throttled_inspect(item: Dict[str, Any], index: int) -> Dict[str, Any]:
            async with semaphore:
                if index > 0:
                    await asyncio.sleep(1.0)
                return await self.inspect_single_product(item)

        results: List[Dict[str, Any]] = []
        try:
            results = await asyncio.gather(*[throttled_inspect(item, i) for i, item in enumerate(selected_batch)])

            self.last_run_timestamp = datetime.utcnow()
            self.next_run_timestamp = self.last_run_timestamp + timedelta(hours=CRAWLER_AUTO_INTERVAL_HOURS)
            self.log_event(
                "SUCCESS",
                f"=== Batch Completed: {len(results)} products inspected. Next automated run scheduled for {self.next_run_timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')} ===",
            )
        finally:
            self.is_running = False

        return results

    async def inspect_custom_url(self, url: str) -> Dict[str, Any]:
        """
        Allows an inspector or user to paste ANY live e-commerce URL on the spot
        and performs a live scrape and statutory compliance audit.
        """
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if "amazon" in netloc:
            platform = "Amazon"
        elif "flipkart" in netloc:
            platform = "Flipkart"
        elif "blinkit" in netloc:
            platform = "Blinkit"
        elif "zepto" in netloc:
            platform = "Zepto"
        elif "meesho" in netloc:
            platform = "Meesho"
        else:
            platform = "Other E-Commerce"

        meta = {
            "platform": platform,
            "url": url,
            "sku": generate_platform_sku(platform),
            "default_title": f"Packaged Product from {platform}",
            "default_brand": "Brand",
            "default_category": "Packaged Commodities",
            "default_manufacturer": "",
            "default_country_of_origin": "",
            "default_net_weight": "",
            "default_mrp": 0.0,
            "default_listed_price": 0.0,
            "default_unit_sale_price": "",
            "default_mfg_date": "",
            "default_customer_care": "",
            "image_url": "",
        }

        return await self.inspect_single_product(meta)

    def get_status(self) -> Dict[str, Any]:
        """Returns the current state and metrics for the dashboard."""
        non_compliant = sum(1 for r in self.history_records if r.get("audit", {}).get("status") == "non-compliant")
        compliant = sum(1 for r in self.history_records if r.get("audit", {}).get("status") == "compliant")
        total_penalties = sum(r.get("audit", {}).get("estimated_penalty_inr", 0.0) for r in self.history_records)

        return {
            "service": "SatyaSetu Autonomous E-Commerce Compliance Inspector",
            "is_running": self.is_running,
            "auto_schedule_active": self.auto_schedule_active,
            "interval_hours": CRAWLER_AUTO_INTERVAL_HOURS,
            "last_run_timestamp": self.last_run_timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if self.last_run_timestamp else None,
            "next_run_timestamp": self.next_run_timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if self.next_run_timestamp else None,
            "total_inspected": len(self.history_records),
            "compliant_count": compliant,
            "non_compliant_count": non_compliant,
            "total_penalties_exposed_inr": total_penalties,
            "scraper_api_configured": bool(SCRAPER_API_KEY or os.getenv("SCRAPER_API_KEY")),
            "jina_api_configured": bool(JINA_API_KEY or os.getenv("JINA_API_KEY")),
            "free_engines_active": ["Jina AI Reader (Markdown)", "Direct Stealth HTTP"],
        }


# Global singleton crawler instance
crawler_service = EcommerceCrawlerService()
