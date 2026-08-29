from typing import List, Optional
from ..schemas.roadmap import ReasonCode


def render_reasoning(
    reason_codes: List[ReasonCode],
    next_dependent_name: Optional[str] = None,
    resource_title: Optional[str] = None,
    interest_domain: Optional[str] = None,
    target_role: Optional[str] = None,
    learning_format: Optional[str] = None,
    learner_level: Optional[int] = None,
) -> str:
    """
    Renders deterministic natural-language explanation from reason codes.
    Does not require an LLM call (Section 1.6 & Section 7.3).
    """
    sentences = []

    for code in reason_codes:
        if code == ReasonCode.CHECKPOINT_FAILURE:
            sentences.append("Your recent checkpoint showed gaps here.")
        elif code == ReasonCode.SELF_REPORTED_UNVERIFIED:
            sentences.append(
                "You said you know this, so it's a short review rather than a full module."
            )
        elif code == ReasonCode.COVERED_BY_EARLIER_RESOURCE:
            title = resource_title or "an earlier resource"
            sentences.append(f"Covered by {title}, already in your path.")
        elif code == ReasonCode.PREREQUISITE_OF_TARGET:
            dep = next_dependent_name or "downstream milestones"
            sentences.append(f"Required before {dep}.")
        elif code == ReasonCode.TARGET_SKILL:
            role = target_role or "your chosen specialization"
            sentences.append(f"Core milestone for your target goal: {role}.")
        elif code == ReasonCode.SPECIALIZATION_BRANCH:
            domain = interest_domain or "your selected track"
            sentences.append(f"Specialized track for {domain}.")
        elif code == ReasonCode.INTEREST_ALIGNMENT:
            domain = interest_domain or "your stated interest"
            sentences.append(f"Matches your interest in {domain}.")
        elif code == ReasonCode.DIFFICULTY_MATCH:
            sentences.append("Calibrated for your current experience level.")
        elif code == ReasonCode.FORMAT_MATCH:
            fmt = learning_format or "preferred"
            sentences.append(f"Delivered in your preferred {fmt} format.")
        elif code == ReasonCode.NO_RESOURCE_AVAILABLE:
            sentences.append("No curated resource yet — we'll flag this.")
        elif code == ReasonCode.EXPLORATORY_UNSUPPORTED:
            sentences.append("This area is outside our validated curriculum graph.")
        elif code == ReasonCode.LOW_CONFIDENCE:
            sentences.append("Included to build solid foundations from scratch.")

    return " ".join(sentences) if sentences else "Curated step in your personalized path."
