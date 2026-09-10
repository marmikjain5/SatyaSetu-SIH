"""
SatyaDrishti Regulatory Ingestion Service
Handles fetching, PDF/HTML parsing, metadata extraction, content hashing,
structure-preserving semantic chunking, and amendment change detection.
"""

import hashlib
import json
import re
from typing import Dict, List, Optional, Tuple, Any

import sys
from pathlib import Path

# Ensure root and backend directory are in sys.path for robust imports
_file_path = Path(__file__).resolve()
_backend_dir = _file_path.parents[2]
_root_dir = _backend_dir.parent
for _p in (str(_root_dir), str(_backend_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.models.regulation import (
        RegulatoryDocument,
        RegulatoryChunk,
        DocumentStatus,
        RuleStatus,
    )
except ImportError:
    from models.regulation import (
        RegulatoryDocument,
        RegulatoryChunk,
        DocumentStatus,
        RuleStatus,
    )


class IngestionService:
    """Document Ingestion & Semantic Chunking Engine for Official Regulatory Sources."""

    AMENDMENT_PHRASES = [
        r"shall be substituted",
        r"amended",
        r"supersedes",
        r"in place of",
        r"with effect from",
        r"shall come into force",
        r"in exercise of the powers conferred by",
    ]

    def __init__(self, sources_config_path: Optional[str] = None):
        self.documents: Dict[str, RegulatoryDocument] = {}
        self.chunks: List[RegulatoryChunk] = []

    def compute_content_hash(self, text: str) -> str:
        """Generate SHA-256 hash of raw text content for duplicate detection."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def detect_amendment_triggers(self, text: str) -> List[str]:
        """Detect deterministic phrases indicating an amendment or superseding clause."""
        detected = []
        for phrase in self.AMENDMENT_PHRASES:
            if re.search(phrase, text, re.IGNORECASE):
                detected.append(phrase)
        return detected

    def parse_document(
        self,
        title: str,
        authority: str,
        raw_text: str,
        source_url: str = "",
        document_type: str = "notification",
        publication_date: Optional[str] = None,
        effective_date: Optional[str] = None,
    ) -> Tuple[RegulatoryDocument, List[RegulatoryChunk]]:
        """
        Process a raw regulatory document:
        1. Calculate content hash and check for duplicates.
        2. Extract metadata and detect amendment triggers.
        3. Break text into structure-preserving semantic chunks (Act -> Section -> Clause).
        """
        content_hash = self.compute_content_hash(raw_text)

        # Check for existing document by hash
        for doc in self.documents.values():
            if doc.content_hash == content_hash:
                return doc, [c for c in self.chunks if c.document_id == doc.document_id]

        doc = RegulatoryDocument(
            title=title,
            authority=authority,
            document_type=document_type,
            source_url=source_url,
            publication_date=publication_date or "2026-01-01",
            effective_date=effective_date or publication_date or "2026-01-01",
            status=DocumentStatus.ACTIVE,
            content_hash=content_hash,
            raw_text=raw_text,
            metadata={"amendment_triggers": self.detect_amendment_triggers(raw_text)},
        )
        self.documents[doc.document_id] = doc

        # Structure-preserving chunking
        doc_chunks = self.chunk_by_structure(doc)
        self.chunks.extend(doc_chunks)

        return doc, doc_chunks

    def chunk_by_structure(self, doc: RegulatoryDocument) -> List[RegulatoryChunk]:
        """
        Preserve regulatory boundaries:
        Act -> Chapter -> Section / Rule -> Sub-clause
        """
        chunks: List[RegulatoryChunk] = []
        text = doc.raw_text

        # Pattern for Rules/Sections e.g. "Rule 6", "Section 18", "Clause (1)"
        rule_pattern = r"(?:Rule|Section|Clause)\s+(\d+(?:\(\d+\))?(?:\([a-z]\))?)"
        sections = re.split(r"(?=(?:Rule|Section)\s+\d+)", text)

        for idx, sec_text in enumerate(sections):
            sec_text = sec_text.strip()
            if not sec_text:
                continue

            match = re.search(rule_pattern, sec_text, re.IGNORECASE)
            sec_name = f"Rule {match.group(1)}" if match else f"Section {idx + 1}"

            chunk = RegulatoryChunk(
                document_id=doc.document_id,
                authority=doc.authority,
                document_type=doc.document_type,
                regulation_id=doc.title,
                section=sec_name,
                hierarchy_path=[doc.authority, doc.title, sec_name],
                content=sec_text,
                publication_date=doc.publication_date,
                effective_date=doc.effective_date,
                status=doc.status,
                product_categories=["all"],
            )
            chunks.append(chunk)

        return chunks
