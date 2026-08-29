import pytest
from app.schemas.learner import ConfidenceTier
from app.schemas.roadmap import LearningMode
from app.core.confidence import (
    derive_learning_mode,
    transition_on_self_rating,
    transition_on_quiz_result,
    transition_on_resource_completed,
)

def test_derive_learning_mode():
    assert derive_learning_mode(ConfidenceTier.UNKNOWN) == LearningMode.FULL_MODULE
    assert derive_learning_mode(ConfidenceTier.FAMILIAR) == LearningMode.REFRESHER
    assert derive_learning_mode(ConfidenceTier.DEVELOPING) == LearningMode.PRACTICE
    assert derive_learning_mode(ConfidenceTier.PRACTICED) == LearningMode.PRACTICE
    assert derive_learning_mode(ConfidenceTier.VERIFIED) == LearningMode.SKIP
    assert derive_learning_mode(ConfidenceTier.WEAK) == LearningMode.REFRESHER

def test_quiz_failure_overrides_to_weak():
    """Mandatory test: VERIFIED + failed checkpoint = WEAK."""
    tier, needs_practice = transition_on_quiz_result(ConfidenceTier.VERIFIED, score=0.33, passing_score=0.5)
    assert tier == ConfidenceTier.WEAK
    assert needs_practice is True

def test_quiz_pass_reaches_verified():
    tier, needs_practice = transition_on_quiz_result(ConfidenceTier.PRACTICED, score=0.8, passing_score=0.5)
    assert tier == ConfidenceTier.VERIFIED
    assert needs_practice is False

def test_self_rating_rules():
    # 1-2: Hard override -> WEAK
    tier, _ = transition_on_self_rating(ConfidenceTier.DEVELOPING, rating=2)
    assert tier == ConfidenceTier.WEAK

    tier, _ = transition_on_self_rating(ConfidenceTier.PRACTICED, rating=1)
    assert tier == ConfidenceTier.WEAK

    # 3: Hold current tier, flag needs_practice
    tier, needs_practice = transition_on_self_rating(ConfidenceTier.DEVELOPING, rating=3)
    assert tier == ConfidenceTier.DEVELOPING
    assert needs_practice is True

    # 4-5: Advance one tier capped below VERIFIED
    tier, _ = transition_on_self_rating(ConfidenceTier.FAMILIAR, rating=4)
    assert tier == ConfidenceTier.DEVELOPING

    tier, _ = transition_on_self_rating(ConfidenceTier.DEVELOPING, rating=5)
    assert tier == ConfidenceTier.PRACTICED

    tier, _ = transition_on_self_rating(ConfidenceTier.PRACTICED, rating=5)
    assert tier == ConfidenceTier.PRACTICED  # Cannot reach VERIFIED without quiz

def test_weak_recovery_rule():
    """Section 1.10: WEAK -> DEVELOPING on refresher completion + rating >= 3."""
    tier, _ = transition_on_resource_completed(ConfidenceTier.WEAK, is_refresher=True, self_rating=4)
    assert tier == ConfidenceTier.DEVELOPING

    tier, _ = transition_on_resource_completed(ConfidenceTier.WEAK, is_refresher=True, self_rating=2)
    assert tier == ConfidenceTier.WEAK
