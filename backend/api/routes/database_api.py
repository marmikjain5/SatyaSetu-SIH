"""
SatyaDrishti Database REST API Routes
Provides CRUD endpoints for Products, OCR Scans, Violations, Manufacturers, and Complaints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parents[2]
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from database import get_db
from models.db_models import (
    ProductModel,
    ManufacturerModel,
    OCRScanModel,
    ViolationModel,
    ComplaintModel,
)

router = APIRouter(prefix="/api", tags=["database"])


# 1. PRODUCTS ENDPOINTS
@router.get("/products")
def get_products(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieve all products with optional filtering."""
    query = db.query(ProductModel)
    if platform and platform != "All":
        query = query.filter(ProductModel.platform == platform)
    if status and status != "All":
        query = query.filter(ProductModel.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (ProductModel.title.ilike(s))
            | (ProductModel.brand.ilike(s))
            | (ProductModel.sku.ilike(s))
            | (ProductModel.manufacturer_name.ilike(s))
        )
    return query.all()


@router.get("/products/{product_id}")
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    """Retrieve a single product by ID."""
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# 2. MANUFACTURERS ENDPOINTS
@router.get("/manufacturers")
def get_manufacturers(
    risk_tier: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieve all manufacturers with risk tiers."""
    query = db.query(ManufacturerModel)
    if risk_tier and risk_tier != "All":
        query = query.filter(ManufacturerModel.risk_tier == risk_tier)
    return query.all()


# 3. OCR SCANS ENDPOINTS
@router.get("/ocr-scans")
def get_ocr_scans(
    product_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Retrieve OCR inspection scans with extracted parameters."""
    query = db.query(OCRScanModel).order_by(OCRScanModel.scan_timestamp.desc())
    if product_id:
        query = query.filter(OCRScanModel.product_id == product_id)
    return query.limit(limit).all()


# 4. VIOLATIONS ENFORCEMENT LEDGER ENDPOINTS
@router.get("/violations")
def get_violations(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieve logged violations and Show Cause Notice records."""
    query = db.query(ViolationModel)
    if severity and severity != "All":
        query = query.filter(ViolationModel.severity == severity)
    if status and status != "All":
        query = query.filter(ViolationModel.status == status)
    return query.all()


# 5. COMPLAINTS ENDPOINTS
@router.get("/complaints")
def get_complaints(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieve logged consumer grievances."""
    query = db.query(ComplaintModel).order_by(ComplaintModel.created_at.desc())
    if status and status != "All":
        query = query.filter(ComplaintModel.status == status)
    return query.all()
