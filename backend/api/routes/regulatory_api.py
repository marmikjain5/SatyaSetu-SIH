"""
SatyaDrishti Regulatory API Routes
FastAPI controller implementing regulatory retrieval, pending rule approvals, and feedback logging endpoints.
"""

from typing import Dict, List, Any

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
    from backend.models.regulation import RetrievalQuery, FeedbackRecord, RuleStatus
except ImportError:
    from models.regulation import RetrievalQuery, FeedbackRecord, RuleStatus


class RegulatoryAPIHandler:
    """API handler for /regulatory routes."""

    def __init__(self, hybrid_retriever=None, version_resolver=None):
        self.retriever = hybrid_retriever
        self.resolver = version_resolver
        self.feedback_log: List[FeedbackRecord] = []

    def handle_retrieve(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """POST /regulatory/retrieve"""
        query = RetrievalQuery(
            query_text=payload.get("query_text"),
            product_category=payload.get("product_category", "all"),
            fields=payload.get("fields", []),
            jurisdiction=payload.get("jurisdiction", "India"),
            evaluation_date=payload.get("evaluation_date", "2026-08-27"),
            authority_filter=payload.get("authority_filter"),
        )

        retrieval_results = self.retriever.search(query) if self.retriever else {}
        active_rules = self.resolver.get_active_rules(
            product_category=query.product_category,
            evaluation_date=query.evaluation_date
        ) if self.resolver else []

        return {
            "query_id": f"query-{payload.get('product_category', 'all')}-{len(self.feedback_log)}",
            "applicable_rules_count": len(active_rules),
            "applicable_rules": [
                {
                    "rule_id": r.rule_id,
                    "name": r.name,
                    "authority": r.authority,
                    "section": r.source_section,
                    "version": r.current_version,
                    "status": r.status.value,
                }
                for r in active_rules
            ],
            "supporting_documents": retrieval_results.get("results", []),
            "retrieval_trace": retrieval_results.get("retrieval_trace", {}),
        }

    def handle_submit_feedback(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """POST /regulatory/feedback"""
        fb = FeedbackRecord(
            query_id=payload.get("query_id", ""),
            retrieved_rule_id=payload.get("retrieved_rule_id", ""),
            feedback_type=payload.get("feedback", "CORRECT"),
            reviewer_notes=payload.get("reviewer_notes", ""),
        )
        self.feedback_log.append(fb)
        return {"status": "success", "feedback_id": fb.feedback_id}
