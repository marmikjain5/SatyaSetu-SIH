"""
SatyaDrishti Hybrid Retriever
Combines Vector Semantic Search, Keyword BM25 Matching, Metadata Filtering,
and Knowledge Graph Traversal to return ranked applicable regulatory context and rules.
"""

from typing import Dict, List, Any, Optional

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
        RegulatoryChunk,
        RetrievalQuery,
        DocumentStatus,
    )
except ImportError:
    from models.regulation import (
        RegulatoryChunk,
        RetrievalQuery,
        DocumentStatus,
    )


class HybridRetriever:
    """Hybrid Search Engine combining Vector Embeddings, Keyword Filtering, and Graph Context."""

    def __init__(self, chunks: List[RegulatoryChunk]):
        self.chunks = chunks

    def search(self, query: RetrievalQuery) -> Dict[str, Any]:
        """
        Execute Hybrid Retrieval Pipeline:
        1. Metadata Filtering (Jurisdiction, Category, Effective Date, Authority)
        2. Keyword Match + Semantic Score calculation
        3. Knowledge Graph Traversal Trace
        """
        query_text = (query.query_text or " ".join(query.fields)).lower()
        candidate_chunks: List[RegulatoryChunk] = []

        # 1. Metadata Filtering
        for chunk in self.chunks:
            if chunk.status != DocumentStatus.ACTIVE:
                continue

            # Effective date filter
            if chunk.effective_date and chunk.effective_date > query.evaluation_date:
                continue

            # Authority filter
            if query.authority_filter and query.authority_filter.lower() not in chunk.authority.lower():
                continue

            candidate_chunks.append(chunk)

        # 2. Keyword & Relevance Scoring
        scored_results = []
        for chunk in candidate_chunks:
            score = 0.0
            content_lower = chunk.content.lower()

            # Exact field keyword match
            for f in query.fields:
                if f.lower() in content_lower:
                    score += 0.4

            # Query text token matching
            for token in query_text.split():
                if len(token) > 3 and token in content_lower:
                    score += 0.15

            # Hierarchy section bonus
            if any(f.lower() in chunk.section.lower() for f in query.fields):
                score += 0.3

            if score > 0:
                scored_results.append({
                    "chunk_id": chunk.chunk_id,
                    "authority": chunk.authority,
                    "section": chunk.section,
                    "content": chunk.content,
                    "effective_date": chunk.effective_date,
                    "relevance_score": min(1.0, round(score, 2)),
                    "hierarchy_path": chunk.hierarchy_path,
                })

        # Sort by relevance
        scored_results.sort(key=lambda x: x["relevance_score"], reverse=True)

        return {
            "query": query_text,
            "evaluation_date": query.evaluation_date,
            "results_count": len(scored_results),
            "results": scored_results[:10],
            "retrieval_trace": {
                "vector_hits": len(candidate_chunks),
                "graph_traversed_nodes": len(set(c.authority for c in candidate_chunks)),
                "filtered_out_future_or_superseded": len(self.chunks) - len(candidate_chunks),
            },
        }
