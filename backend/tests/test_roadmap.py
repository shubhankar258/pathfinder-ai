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

def test_demo_roadmap_generation(graph, catalog):
    demo_learner = LearnerProfile(
        user_id="demo_user",
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

    resp = build_roadmap(graph, catalog, demo_learner)
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

def test_cybersecurity_roadmap_generation(graph, catalog):
    cyber_learner = LearnerProfile(
        user_id="cyber_user",
        goal_raw="I want to learn cybersecurity in 12 months.",
        target_role="Cybersecurity Specialist",
        target_skill="cybersecurity_engineer_target",
        timeline_weeks=52,
        weekly_hours=8.0,
        learning_format=LearningFormat.HANDS_ON,
        interest_domain="Ethical Hacking & Pen Testing",
    )
    resp = build_roadmap(graph, catalog, cyber_learner)
    assert len(resp.roadmap) >= 8
    skill_ids = [item.skill_id for item in resp.roadmap]
    assert "network_fundamentals" in skill_ids
    assert "linux_administration" in skill_ids
    assert "cryptography_basics" in skill_ids
    assert "web_security" in skill_ids
    assert "cybersecurity_capstone" in skill_ids
    assert resp.estimated_total_hours > 100.0

def test_fullstack_roadmap_generation(graph, catalog):
    fs_learner = LearnerProfile(
        user_id="fs_user",
        goal_raw="I want to become a full stack developer in 6 months.",
        target_role="Full-Stack Developer",
        target_skill="fullstack_engineer_target",
        timeline_weeks=24,
        weekly_hours=10.0,
        learning_format=LearningFormat.HANDS_ON,
        interest_domain="Frontend & UI/UX",
    )
    resp = build_roadmap(graph, catalog, fs_learner)
    assert len(resp.roadmap) >= 8
    skill_ids = [item.skill_id for item in resp.roadmap]
    assert "html_css_modern" in skill_ids
    assert "javascript_typescript" in skill_ids
    assert "react_frontend" in skill_ids
    assert "backend_apis_node_python" in skill_ids
    assert "fullstack_capstone" in skill_ids
