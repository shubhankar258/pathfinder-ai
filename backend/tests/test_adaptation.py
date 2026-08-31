import pytest
from pathlib import Path
from app.schemas.learner import ConfidenceTier, LearnerProfile, LearningFormat
from app.schemas.events import AdaptationEvent, AdaptationEventType
from app.schemas.roadmap import RoadmapNodeState
from app.core.dag_engine import load_skill_dag
from app.core.recommender import load_catalog
from app.core.roadmap_builder import build_roadmap
from app.core.adaptation import handle_adaptation

@pytest.fixture
def graph():
    data_dir = Path(__file__).parent.parent / "app" / "data"
    return load_skill_dag(str(data_dir / "skill_dag.json"))

@pytest.fixture
def catalog():
    data_dir = Path(__file__).parent.parent / "app" / "data"
    return load_catalog(str(data_dir / "catalog.json"))

@pytest.fixture
def demo_roadmap(graph, catalog):
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
    return demo_learner, build_roadmap(graph, catalog, demo_learner).roadmap

def test_checkpoint_failure_adaptation(graph, catalog, demo_roadmap):
    demo_learner, roadmap = demo_roadmap
    # Mark Python basics as completed
    roadmap[0].state = RoadmapNodeState.COMPLETED

    event = AdaptationEvent(
        event_type=AdaptationEventType.CHECKPOINT_FAILED,
        skill_id="statistics_probability",
        score=0.33,
    )
    res = handle_adaptation(event, roadmap, demo_learner, catalog, graph)

    # 1. Completed Python node preserved
    assert res.updated_roadmap[0].state == RoadmapNodeState.COMPLETED
    assert res.updated_roadmap[0].skill_id == "python_basics"

    # 2. Statistics converted to WEAK refresher
    stats_item = next(i for i in res.updated_roadmap if i.skill_id == "statistics_probability")
    assert stats_item.is_refresher is True
    assert stats_item.state == RoadmapNodeState.WEAK
    assert stats_item.confidence_tier == ConfidenceTier.WEAK

    # 3. ML fundamentals is LOCKED
    ml_item = next(i for i in res.updated_roadmap if i.skill_id == "ml_fundamentals")
    assert ml_item.state == RoadmapNodeState.LOCKED

    # 4. Next best action is the statistics refresher
    assert res.next_best_action.skill_id == "statistics_probability"

def test_interest_change_preserves_completed(graph, catalog, demo_roadmap):
    demo_learner, roadmap = demo_roadmap
    # Mark first 3 items completed
    roadmap[0].state = RoadmapNodeState.COMPLETED
    roadmap[1].state = RoadmapNodeState.COMPLETED
    roadmap[2].state = RoadmapNodeState.COMPLETED

    event = AdaptationEvent(
        event_type=AdaptationEventType.INTEREST_CHANGED,
        new_interest_domain="Computer Vision",
    )
    res = handle_adaptation(event, roadmap, demo_learner, catalog, graph)

    # Completed items are preserved
    assert res.updated_roadmap[0].state == RoadmapNodeState.COMPLETED
    assert res.updated_roadmap[1].state == RoadmapNodeState.COMPLETED
    assert res.updated_roadmap[2].state == RoadmapNodeState.COMPLETED

    # Specialization branch swapped to Computer Vision
    cv_items = [i for i in res.updated_roadmap if "cv_specialization" in i.skill_id or "Vision" in i.skill_name]
    assert len(cv_items) > 0
    assert not any(i.skill_id == "nlp_specialization" for i in res.updated_roadmap)
