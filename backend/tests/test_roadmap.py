import pytest
from pathlib import Path
from app.schemas.learner import ConfidenceTier, LearnerProfile, LearningFormat
from app.core.dag_engine import load_skill_dag
from app.core.recommender import load_catalog
from app.core.roadmap_builder import build_roadmap

@pytest.fixture
def graph():
    data_dir = Path(__file__).parent.parent / "app" / "data"
    return load_skill_dag(str(data_dir / "skill_dag.json"))

@pytest.fixture
def catalog():
    data_dir = Path(__file__).parent.parent / "app" / "data"
    return load_catalog(str(data_dir / "catalog.json"))

def test_priya_roadmap_generation(graph, catalog):
    priya = LearnerProfile(
        user_id="priya_demo",
        goal_raw="I want to become a Machine Learning Engineer in six months. I know basic Python.",
        target_role="Machine Learning Engineer",
        target_skill="ml_engineer_target",
        timeline_weeks=24,
        weekly_hours=8.0,
        experience_level="Basic Python",
        learner_level=1,
        learning_format=LearningFormat.HANDS_ON,
        interest_domain="NLP",
        skill_confidence={"python_basics": ConfidenceTier.FAMILIAR},
    )

    resp = build_roadmap(graph, catalog, priya)
    assert resp.estimated_total_hours == 190.0
    assert resp.estimated_duration_range.min_weeks in (21, 22)
    assert resp.estimated_duration_range.max_weeks == 26

    # Verify python_basics is REFRESHER because FAMILIAR
    py_item = next(i for i in resp.roadmap if i.skill_id == "python_basics")
    assert py_item.is_refresher is True
    assert py_item.learning_mode.value == "REFRESHER"

    # Verify initial states: First item AVAILABLE, downstream LOCKED
    assert resp.roadmap[0].state.value == "AVAILABLE"
    for item in resp.roadmap[1:]:
        assert item.state.value == "LOCKED"

def test_multi_skill_deduplication(graph, catalog):
    profile = LearnerProfile(
        user_id="test_user",
        goal_raw="Learn ML",
        weekly_hours=8.0,
    )
    resp = build_roadmap(graph, catalog, profile)
    resource_ids = [i.recommended_resource.id for i in resp.roadmap if i.recommended_resource]
    assert len(resource_ids) == len(set(resource_ids)), "Every recommended resource ID must appear at most once!"
