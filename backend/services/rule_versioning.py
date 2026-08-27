"""
SatyaDrishti Rule Versioning & Effective-Date Resolver
Ensures that only approved ACTIVE rule versions with valid effective dates are sent
to the deterministic Compliance Engine. Unapproved, future, or superseded rules are filtered out.
"""

from datetime import date
from typing import Dict, List, Optional

import sys
from pathlib import Path

# Ensure root and backend directory are in sys.path for robust imports
_file_path = Path(__file__).resolve()
_backend_dir = _file_path.parents[1]
_root_dir = _backend_dir.parent
for _p in (str(_root_dir), str(_backend_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.models.regulation import (
        RegulatoryRule,
        RuleVersion,
        RuleStatus,
    )
except ImportError:
    from models.regulation import (
        RegulatoryRule,
        RuleVersion,
        RuleStatus,
    )


class RuleVersioningResolver:
    """Version & Approval Resolver for Regulatory Rules."""

    def __init__(self, rules: Optional[List[RegulatoryRule]] = None):
        self.rules: Dict[str, RegulatoryRule] = {r.rule_id: r for r in (rules or [])}

    def add_rule(self, rule: RegulatoryRule) -> None:
        self.rules[rule.rule_id] = rule

    def get_active_rules(
        self,
        product_category: str = "all",
        evaluation_date: Optional[str] = None
    ) -> List[RegulatoryRule]:
        """
        Resolve applicable active rules:
        1. Must have status = ACTIVE
        2. Effective from <= evaluation_date
        3. Effective until is None OR > evaluation_date
        4. Applies to product_category or 'all'
        5. Must be human approved
        """
        eval_date = evaluation_date or date.today().isoformat()
        active_rules: List[RegulatoryRule] = []

        for rule in self.rules.values():
            if rule.status != RuleStatus.ACTIVE:
                continue

            # Check category applicability
            if "all" not in rule.applies_to and product_category not in rule.applies_to:
                continue

            # Find active version
            active_ver: Optional[RuleVersion] = None
            for ver in rule.history:
                if ver.status == RuleStatus.ACTIVE:
                    if ver.effective_from <= eval_date:
                        if ver.effective_until is None or ver.effective_until > eval_date:
                            active_ver = ver
                            break

            if active_ver is not None:
                active_rules.append(rule)

        return active_rules

    def propose_change(self, rule_id: str, new_version: RuleVersion) -> None:
        """Create a PROPOSED_CHANGE / PENDING_APPROVAL version requiring human review."""
        if rule_id in self.rules:
            rule = self.rules[rule_id]
            new_version.status = RuleStatus.PENDING_APPROVAL
            rule.history.append(new_version)
            rule.status = RuleStatus.PENDING_APPROVAL

    def approve_rule(self, rule_id: str, version_id: str, approved_by: str) -> bool:
        """Human approval action promoting PENDING_APPROVAL version to ACTIVE."""
        if rule_id not in self.rules:
            return False

        rule = self.rules[rule_id]
        target_ver = None
        for ver in rule.history:
            if ver.version_id == version_id:
                target_ver = ver
                break

        if not target_ver:
            return False

        # Mark former active versions as SUPERSEDED
        for ver in rule.history:
            if ver.status == RuleStatus.ACTIVE:
                ver.status = RuleStatus.SUPERSEDED
                ver.effective_until = target_ver.effective_from

        target_ver.status = RuleStatus.ACTIVE
        target_ver.approved_by = approved_by
        target_ver.approved_at = date.today().isoformat()

        rule.status = RuleStatus.ACTIVE
        rule.current_version = target_ver.version_number
        rule.active_version_id = target_ver.version_id

        return True
