import pytest
from app.schemas.learner import LearnerProfile, LearningFormat
from app.schemas.resource import Resource
from app.core.recommender import (
    compute_difficulty_fit,
    compute_format_fit,
    compute_time_fit,
    compute_interest_alignment,
    rank_resources_for_skill,
    get_best_resource,
)

def test_time_fit_10h_at_8h_per_week():
    """Mandatory test: 10-hour resource at 8 hrs/week scores 1.0 (Section 14)."""
    score = compute_time_fit(resource_hours=10.0, weekly_hours=8.0)
    assert score == 1.0

def test_time_fit_boundary_conditions():
    # 4h at 8 hrs/week (ratio 4/16 = 0.25) -> 1.0
    assert compute_time_fit(resource_hours=4.0, weekly_hours=8.0) == 1.0
    # 16h at 8 hrs/week (ratio 16/16 = 1.0) -> 1.0
    assert compute_time_fit(resource_hours=16.0, weekly_hours=8.0) == 1.0
    # 2h at 8 hrs/week (ratio 2/16 = 0.125 < 0.25) -> 0.7
    assert compute_time_fit(resource_hours=2.0, weekly_hours=8.0) == 0.7
    # 20h at 8 hrs/week (ratio 20/16 = 1.25) -> 1.0 - 0.25 = 0.75
    assert compute_time_fit(resource_hours=20.0, weekly_hours=8.0) == 0.75

def test_difficulty_fit_distance_based():
    # Learner level 2: level 2 -> 1.0, level 1 -> 0.5, level 3 -> 0.5
    assert compute_difficulty_fit(2, 2) == 1.0
    assert compute_difficulty_fit(1, 2) == 0.5
    assert compute_difficulty_fit(3, 2) == 0.5
    # Learner level 1: level 3 -> 0.0
    assert compute_difficulty_fit(3, 1) == 0.0

def test_format_fit_compatibility():
    # Exact match
    assert compute_format_fit(LearningFormat.HANDS_ON, LearningFormat.HANDS_ON) == 1.0
    # Compatible format
    assert compute_format_fit(LearningFormat.INTERACTIVE, LearningFormat.HANDS_ON) == 0.7
    # Mismatched format
    assert compute_format_fit(LearningFormat.READING, LearningFormat.HANDS_ON) == 0.4

def test_interest_alignment_structured_topics():
    # Uses topics, never title
    assert compute_interest_alignment(["nlp", "text", "transformers"], "NLP") == 1.0
    assert compute_interest_alignment(["computer vision", "cnn"], "NLP") == 0.3
    assert compute_interest_alignment(["general ml"], None) == 0.5

def test_hard_filter_exclusion():
    catalog = [
        Resource(
            id="unrelated_high_quality",
            title="Mastering Culinary Arts",
            skills_taught=["culinary_skills"],
            topics=["cooking"],
            format=LearningFormat.HANDS_ON,
            difficulty="beginner",
            difficulty_level=1,
            estimated_hours=8.0,
            quality_score=1.0,
            is_refresher=False,
        ),
        Resource(
            id="target_resource",
            title="Python OOP",
            skills_taught=["python_oop"],
            topics=["python"],
            format=LearningFormat.HANDS_ON,
            difficulty="beginner",
            difficulty_level=1,
            estimated_hours=10.0,
            quality_score=0.9,
            is_refresher=False,
        ),
    ]
    profile = LearnerProfile(
        user_id="test_user",
        goal_raw="Learn Python",
        learning_format=LearningFormat.HANDS_ON,
        learner_level=1,
        weekly_hours=8.0,
    )

    # Looking for python_oop: culinary course MUST NOT be in scored list
    ranked = rank_resources_for_skill("python_oop", catalog, profile)
    assert len(ranked) == 1
    assert ranked[0]["resource"].id == "target_resource"

    # Empty eligible pool returns [] and get_best_resource returns None
    assert rank_resources_for_skill("non_existent_skill", catalog, profile) == []
    assert get_best_resource("non_existent_skill", catalog, profile) is None
