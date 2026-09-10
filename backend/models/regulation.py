"""
SatyaDrishti Regulatory Intelligence System - Data Models
Defines core representations for Regulatory Documents, Rules, Rule Versions, Knowledge Graph Nodes,
and Hybrid Retrieval Payloads as specified in PRD.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
import uuid


class DocumentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUPERSEDED = "SUPERSEDED"
    AMENDED = "AMENDED"
    REPEALED = "REPEALED"
    DRAFT = "DRAFT"
    UNKNOWN = "UNKNOWN"


class RuleStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    PROPOSED_CHANGE = "PROPOSED_CHANGE"
    SUPERSEDED = "SUPERSEDED"
    REJECTED = "REJECTED"


class RuleSeverity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    CRITICAL = "CRITICAL"


@dataclass
class RegulatoryDocument:
    """Represents an ingested official government gazette, act, notification, or guideline document."""
    document_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    authority: str = ""  # Legal Metrology, FSSAI, BIS, CCPA
    document_type: str = "notification"  # act, rule, amendment, notification, circular, guideline
    source_url: str = ""
    publication_date: Optional[str] = None  # YYYY-MM-DD
    effective_date: Optional[str] = None    # YYYY-MM-DD
    status: DocumentStatus = DocumentStatus.ACTIVE
    language: str = "en"
    content_hash: str = ""
    ingested_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    supersedes: List[str] = field(default_factory=list)
    superseded_by: List[str] = field(default_factory=list)
    raw_text: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RegulatoryChunk:
    """Semantic context-preserving chunk extracted from a regulatory document."""
    chunk_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str = ""
    authority: str = ""
    document_type: str = ""
    regulation_id: str = ""
    section: str = ""  # e.g., "Rule 6(1)(c)"
    hierarchy_path: List[str] = field(default_factory=list)  # ["Chapter II", "Rule 6", "Sub-rule 1"]
    content: str = ""
    publication_date: Optional[str] = None
    effective_date: Optional[str] = None
    status: DocumentStatus = DocumentStatus.ACTIVE
    product_categories: List[str] = field(default_factory=list)
    embedding_vector: Optional[List[float]] = None


@dataclass
class RuleVersion:
    """Represents a specific temporal version of a compliance rule."""
    version_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    rule_id: str = ""
    version_number: int = 1
    effective_from: str = "2026-01-01"
    effective_until: Optional[str] = None
    status: RuleStatus = RuleStatus.PENDING_APPROVAL
    condition_schema: Dict[str, Any] = field(default_factory=dict)
    rationale: str = ""
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None


@dataclass
class RegulatoryRule:
    """Structured compliance rule executable by the deterministic engine once ACTIVE."""
    rule_id: str = ""
    name: str = ""
    authority: str = ""
    source_document_id: str = ""
    source_section: str = ""
    applies_to: List[str] = field(default_factory=list)  # ["packaged_food", "electronics", "all"]
    condition: Dict[str, Any] = field(default_factory=dict)  # {"field": "mrp", "operator": "exists", "expected": True}
    severity: RuleSeverity = RuleSeverity.HIGH
    current_version: int = 1
    status: RuleStatus = RuleStatus.PENDING_APPROVAL
    active_version_id: Optional[str] = None
    history: List[RuleVersion] = field(default_factory=list)


@dataclass
class KnowledgeGraphNode:
    """Node definition for Regulatory Knowledge Graph."""
    node_id: str = ""
    label: str = ""  # Authority, Document, Section, Rule, RuleVersion, ProductCategory
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class KnowledgeGraphEdge:
    """Edge relationship definition for Regulatory Knowledge Graph."""
    source_id: str = ""
    target_id: str = ""
    relationship_type: str = ""  # ISSUES, CONTAINS, DEFINES, AMENDS, SUPERSEDES, HAS_VERSION, APPLIES_TO, REQUIRES
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RetrievalQuery:
    """Input query structure for hybrid retrieval."""
    query_text: Optional[str] = None
    product_category: str = "all"
    fields: List[str] = field(default_factory=list)
    jurisdiction: str = "India"
    evaluation_date: str = field(default_factory=lambda: date.today().isoformat())
    authority_filter: Optional[str] = None
    include_trace: bool = True


@dataclass
class FeedbackRecord:
    """Feedback structure for human reviewer corrections."""
    feedback_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    query_id: str = ""
    retrieved_rule_id: str = ""
    feedback_type: str = "CORRECT"  # CORRECT, INCORRECT, INCOMPLETE
    reviewer_notes: str = ""
    submitted_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
