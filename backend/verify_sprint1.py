import json
from pathlib import Path
from app.schemas.learner import ConfidenceTier, LearnerProfile, LearningFormat
from app.schemas.events import AdaptationEvent, AdaptationEventType
from app.core.dag_engine import load_skill_dag
from app.core.recommender import load_catalog
from app.core.roadmap_builder import build_roadmap
from app.core.adaptation import handle_adaptation

def main():
    print("=" * 70)
    print("RUNNING SPRINT 1 DETERMINISTIC CORE VERIFICATION")
    print("=" * 70)

    # 1. Load and validate DAG
    data_dir = Path(__file__).parent / "app" / "data"
    graph = load_skill_dag(str(data_dir / "skill_dag.json"))
    print(f"[OK] Skill DAG loaded with {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges.")

    # 2. Load Catalog
    catalog = load_catalog(str(data_dir / "catalog.json"))
    print(f"[OK] Catalog loaded with {len(catalog)} resources.")

    # 3. Construct canonical demo persona (Section 9)
    demo_profile = LearnerProfile(
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

    # 4. Generate Roadmap
    roadmap_resp = build_roadmap(graph, catalog, demo_profile)
    print("\n--- DEMO USER'S GENERATED ROADMAP ---")
    total_hours = 0.0
    for idx, item in enumerate(roadmap_resp.roadmap, 1):
        res_title = item.recommended_resource.title if item.recommended_resource else f"(Covered by {item.covered_by_resource_id})"
        print(f"{idx:2d}. [Phase {item.phase}] {item.skill_name:<38} | Mode: {item.learning_mode.value:<11} | State: {item.state.value:<11} | Est: {item.estimated_hours:4.1f}h | {res_title}")
        total_hours += item.estimated_hours

    print("-" * 70)
    print(f"Computed Total Hours: {total_hours:.1f} hours (Target: ~190h)")
    print(f"Calculated Duration Range: {roadmap_resp.estimated_duration_range.min_weeks} - {roadmap_resp.estimated_duration_range.max_weeks} weeks at {demo_profile.weekly_hours} hrs/week")
    print(f"Next Best Action: {roadmap_resp.next_best_action.skill_name} ({roadmap_resp.next_best_action.reasoning})")

    # Verify ~190 hours target (allow ±10 hours tolerance)
    assert 170 <= total_hours <= 210, f"Total hours {total_hours} outside acceptable tolerance around 190h!"
    print("[PASS] Total roadmap hours verified against 190h target.")

    # Verify python_basics is REFRESHER because FAMILIAR
    py_item = next(i for i in roadmap_resp.roadmap if i.skill_id == "python_basics")
    assert py_item.is_refresher, "python_basics should be a refresher for FAMILIAR tier!"
    print("[PASS] Tiered confidence verified: FAMILIAR -> REFRESHER mode preserved.")

    # 5. Simulate Checkpoint Failure (The Canonical Demo Beat)
    print("\n--- SIMULATING CHECKPOINT FAILURE (Statistics & Probability Quiz = 33%) ---")
    fail_event = AdaptationEvent(
        event_type=AdaptationEventType.CHECKPOINT_FAILED,
        skill_id="statistics_probability",
        score=0.33,
    )
    adapt_resp = handle_adaptation(fail_event, roadmap_resp.roadmap, demo_profile, catalog, graph)
    
    print(f"Adaptation Action: {adapt_resp.adaptation.action}")
    print(f"Adaptation Reason: {adapt_resp.adaptation.reason}")
    print(f"Next Best Action (AFTER): {adapt_resp.next_best_action.skill_name} | State: {adapt_resp.next_best_action.state.value}")

    # Verify statistics refresher is inserted and downstream ML fundamentals is locked
    stats_item = next(i for i in adapt_resp.updated_roadmap if i.skill_id == "statistics_probability")
    ml_item = next(i for i in adapt_resp.updated_roadmap if i.skill_id == "ml_fundamentals")

    assert stats_item.is_refresher, "Statistics should be converted/inserted as refresher!"
    assert stats_item.state == "WEAK", "Statistics state should be WEAK!"
    assert ml_item.state == "LOCKED", "ML Fundamentals must remain LOCKED after stats failure!"
    assert "Statistics" in adapt_resp.next_best_action.skill_name, "Next Best Action must point to Statistics refresher!"
    print("[PASS] Canonical adaptation beat verified successfully.")

    print("\n" + "=" * 70)
    print("ALL SPRINT 1 DETERMINISTIC CORE CHECKS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    main()
