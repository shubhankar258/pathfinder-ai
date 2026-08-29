import json
from pathlib import Path
from typing import Dict, List, Optional
from ..schemas.learner import LearnerProfile, LearningFormat
from ..schemas.resource import Resource, ScoreBreakdown

# Named constants per Section 6.2 & 6.4
SCORING_WEIGHTS = {
    "difficulty": 0.35,
    "format": 0.25,
    "time": 0.20,
    "interest": 0.10,
    "quality": 0.10,
}

MILESTONE_WINDOW_WEEKS = 2

COMPATIBLE_FORMATS = {
    LearningFormat.HANDS_ON: {LearningFormat.INTERACTIVE},
    LearningFormat.INTERACTIVE: {LearningFormat.HANDS_ON},
    LearningFormat.VIDEO: {LearningFormat.INTERACTIVE},
    LearningFormat.READING: {LearningFormat.VIDEO},
}


def load_catalog(filepath: Optional[str] = None) -> List[Resource]:
    """Loads and validates the resource catalog from JSON."""
    if filepath is None:
        filepath = str(Path(__file__).parent.parent / "data" / "catalog.json")

    with open(filepath, "r", encoding="utf-8") as f:
        items = json.load(f)

    return [Resource(**item) for item in items]


def compute_difficulty_fit(
    resource_level: int, learner_level: int, max_distance: int = 2
) -> float:
    """Distance-based difficulty fit (Section 6.3)."""
    return max(0.0, 1.0 - abs(resource_level - learner_level) / max_distance)


def compute_time_fit(
    resource_hours: float,
    weekly_hours: float,
    window_weeks: int = MILESTONE_WINDOW_WEEKS,
) -> float:
    """Milestone pacing time fit (Section 6.4)."""
    capacity = max(weekly_hours * window_weeks, 1.0)
    ratio = resource_hours / capacity
    if 0.25 <= ratio <= 1.0:
        return 1.0  # fills the milestone window well
    if ratio < 0.25:
        return 0.7  # very short
    return max(0.2, 1.0 - (ratio - 1.0))  # long — gently penalized, never hard-cut


def compute_format_fit(
    resource_format: LearningFormat, preferred: LearningFormat
) -> float:
    """Exact, compatible, or mismatched format fit (Section 6.5)."""
    if resource_format == preferred:
        return 1.0
    if resource_format in COMPATIBLE_FORMATS.get(preferred, set()):
        return 0.7
    return 0.4


def compute_interest_alignment(
    resource_topics: List[str], interest_domain: Optional[str]
) -> float:
    """Structured tags interest alignment (Section 6.6)."""
    if not interest_domain:
        return 0.5  # neutral when no stated interest
    topics = {t.lower() for t in resource_topics}
    return 1.0 if interest_domain.lower() in topics else 0.3


def rank_resources_for_skill(
    target_skill_id: str,
    catalog: List[Resource],
    profile: LearnerProfile,
    refresher_only: bool = False,
) -> List[Dict]:
    """
    Two-stage recommendation pipeline:
    STAGE A: Hard filter on skill match (and is_refresher filtering per Section 1.7 & 6.1).
    STAGE B: 5-factor weighted scoring for eligible candidates only.
    """
    # STAGE A — hard filter
    eligible = [r for r in catalog if target_skill_id in r.skills_taught]
    if refresher_only:
        eligible = [r for r in eligible if r.is_refresher]
    else:
        # For full modules, prioritize non-refresher resources
        non_refreshers = [r for r in eligible if not r.is_refresher]
        if non_refreshers:
            eligible = non_refreshers

    if not eligible:
        return []

    # STAGE B — score only the eligible
    scored = []
    for r in eligible:
        diff = compute_difficulty_fit(r.difficulty_level, profile.learner_level)
        fmt = compute_format_fit(r.format, profile.learning_format)
        time = compute_time_fit(r.estimated_hours, profile.weekly_hours)
        interest = compute_interest_alignment(r.topics, profile.interest_domain)
        quality = min(max(r.quality_score, 0.0), 1.0)

        total = (
            SCORING_WEIGHTS["difficulty"] * diff
            + SCORING_WEIGHTS["format"] * fmt
            + SCORING_WEIGHTS["time"] * time
            + SCORING_WEIGHTS["interest"] * interest
            + SCORING_WEIGHTS["quality"] * quality
        )
        scored.append({
            "resource": r,
            "breakdown": ScoreBreakdown(
                difficulty_fit=round(diff, 2),
                format_fit=round(fmt, 2),
                time_fit=round(time, 2),
                interest_alignment=round(interest, 2),
                quality=round(quality, 2),
                final_score=round(total, 4),
            ),
        })

    # Deterministic tie-break: score desc, then resource id asc
    scored.sort(key=lambda x: (-x["breakdown"].final_score, x["resource"].id))
    return scored


def get_best_resource(
    skill_id: str,
    catalog: List[Resource],
    profile: LearnerProfile,
    refresher_only: bool = False,
) -> Optional[Dict]:
    """
    Single seam for resource selection.
    Returns {"resource": Resource, "breakdown": ScoreBreakdown} or None.
    """
    ranked = rank_resources_for_skill(skill_id, catalog, profile, refresher_only)
    return ranked[0] if ranked else None
