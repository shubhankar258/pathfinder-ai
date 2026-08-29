from typing import Optional, Tuple
from ..schemas.learner import ConfidenceTier
from ..schemas.roadmap import LearningMode


def derive_learning_mode(tier: ConfidenceTier) -> LearningMode:
    """Derives the learning mode from a confidence tier (Section 5)."""
    mapping = {
        ConfidenceTier.UNKNOWN: LearningMode.FULL_MODULE,
        ConfidenceTier.FAMILIAR: LearningMode.REFRESHER,
        ConfidenceTier.DEVELOPING: LearningMode.PRACTICE,
        ConfidenceTier.PRACTICED: LearningMode.PRACTICE,
        ConfidenceTier.VERIFIED: LearningMode.SKIP,
        ConfidenceTier.WEAK: LearningMode.REFRESHER,
    }
    return mapping.get(tier, LearningMode.FULL_MODULE)


def transition_on_resource_completed(
    current_tier: ConfidenceTier, is_refresher: bool = False, self_rating: Optional[int] = None
) -> Tuple[ConfidenceTier, bool]:
    """
    State transition when a learner completes a resource.
    Returns (new_tier, needs_practice).
    """
    if current_tier == ConfidenceTier.WEAK:
        if is_refresher:
            if self_rating is not None and self_rating >= 3:
                return ConfidenceTier.DEVELOPING, False
            return ConfidenceTier.WEAK, True
        return ConfidenceTier.WEAK, True

    if current_tier in (ConfidenceTier.UNKNOWN, ConfidenceTier.FAMILIAR):
        return ConfidenceTier.DEVELOPING, False

    return current_tier, False


def transition_on_self_rating(
    current_tier: ConfidenceTier, rating: int
) -> Tuple[ConfidenceTier, bool]:
    """
    State transition on a 1-5 self rating (Section 5).
    - 1-2: HARD OVERRIDE -> WEAK
    - 3: Hold current tier, flag needs_practice
    - 4-5: Advance ONE tier, capped below VERIFIED
    """
    if rating <= 2:
        return ConfidenceTier.WEAK, True

    if rating == 3:
        return current_tier, True

    # rating >= 4: advance one tier capped below VERIFIED
    advance_map = {
        ConfidenceTier.UNKNOWN: ConfidenceTier.FAMILIAR,
        ConfidenceTier.FAMILIAR: ConfidenceTier.DEVELOPING,
        ConfidenceTier.DEVELOPING: ConfidenceTier.PRACTICED,
        ConfidenceTier.PRACTICED: ConfidenceTier.PRACTICED,  # Only quiz can reach VERIFIED
        ConfidenceTier.VERIFIED: ConfidenceTier.VERIFIED,
        ConfidenceTier.WEAK: ConfidenceTier.DEVELOPING,
    }
    return advance_map.get(current_tier, current_tier), False


def transition_on_quiz_result(
    current_tier: ConfidenceTier, score: float, passing_score: float = 0.5
) -> Tuple[ConfidenceTier, bool]:
    """
    State transition on quiz result.
    - score < passing_score: HARD OVERRIDE -> WEAK (even from VERIFIED)
    - score >= passing_score: -> VERIFIED
    """
    if score < passing_score:
        return ConfidenceTier.WEAK, True

    return ConfidenceTier.VERIFIED, False
