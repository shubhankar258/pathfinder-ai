from typing import List, Optional, Tuple
import networkx as nx
from ..schemas.events import AdaptationDetails, AdaptationEvent, AdaptationEventType, AdaptationResponse
from ..schemas.learner import ConfidenceTier, LearnerProfile
from ..schemas.resource import Resource
from ..schemas.roadmap import (
    LearningMode,
    ReasonCode,
    RoadmapItem,
    RoadmapNodeState,
)
from .confidence import transition_on_quiz_result, transition_on_self_rating
from .dag_engine import get_dependents
from .reasoning import render_reasoning
from .recommender import get_best_resource
from .roadmap_builder import build_roadmap


def handle_adaptation(
    event: AdaptationEvent,
    current_roadmap: List[RoadmapItem],
    profile: LearnerProfile,
    catalog: List[Resource],
    graph: nx.DiGraph,
) -> AdaptationResponse:
    """
    Main dispatcher for roadmap adaptation events (Section 8).
    Completed progress is strictly immutable. Only the unfinished tail is modified.
    """
    if event.event_type == AdaptationEventType.CHECKPOINT_FAILED:
        return adapt_on_checkpoint_failure(
            event=event,
            current_roadmap=current_roadmap,
            profile=profile,
            catalog=catalog,
            graph=graph,
        )
    elif event.event_type == AdaptationEventType.DIFFICULTY_FEEDBACK:
        return adapt_on_difficulty_feedback(
            event=event,
            current_roadmap=current_roadmap,
            profile=profile,
            catalog=catalog,
            graph=graph,
        )
    elif event.event_type == AdaptationEventType.INTEREST_CHANGED:
        return adapt_on_interest_change(
            event=event,
            current_roadmap=current_roadmap,
            profile=profile,
            catalog=catalog,
            graph=graph,
        )
    else:
        raise ValueError(f"Unknown adaptation event type: {event.event_type}")


def adapt_on_checkpoint_failure(
    event: AdaptationEvent,
    current_roadmap: List[RoadmapItem],
    profile: LearnerProfile,
    catalog: List[Resource],
    graph: nx.DiGraph,
) -> AdaptationResponse:
    """
    Trigger A: Checkpoint failure (quiz < 50% or self-rating 1-2).
    - Sets confidence to WEAK (hard override)
    - Fetches curated refresher resource
    - Locks all downstream dependent skills
    - Updates/inserts refresher before dependent skills
    - Next Best Action becomes the refresher
    """
    skill_id = event.skill_id or "statistics_probability"
    score = event.score if event.score is not None else 0.33

    # Hard override confidence to WEAK
    profile.skill_confidence[skill_id] = ConfidenceTier.WEAK

    # Get downstream dependents
    dependents = set(get_dependents(graph, skill_id))

    # Fetch best curated refresher
    refresher_rec = get_best_resource(skill_id, catalog, profile, refresher_only=True)
    refresher_res = refresher_rec["resource"] if refresher_rec else None
    score_breakdown = refresher_rec["breakdown"] if refresher_rec else None

    updated_roadmap: List[RoadmapItem] = []
    kept_skills: List[str] = []
    changed_skills: List[str] = [skill_id]

    # Find the skill name
    node_data = graph.nodes.get(skill_id, {})
    skill_name = node_data.get("name", skill_id.replace("_", " ").title())

    # Build updated roadmap items
    for item in current_roadmap:
        if item.state == RoadmapNodeState.COMPLETED:
            # Completed progress is immutable
            kept_skills.append(item.skill_id)
            updated_roadmap.append(item)
            continue

        if item.skill_id == skill_id:
            # Convert this item or insert refresher mode
            reason_codes = [ReasonCode.CHECKPOINT_FAILURE, ReasonCode.PREREQUISITE_OF_TARGET]
            reasoning = render_reasoning(
                reason_codes=reason_codes,
                next_dependent_name="Machine Learning Fundamentals",
                resource_title=refresher_res.title if refresher_res else None,
                interest_domain=profile.interest_domain,
            )
            updated_item = RoadmapItem(
                skill_id=skill_id,
                skill_name=f"{skill_name} (Refresher)",
                phase=item.phase,
                state=RoadmapNodeState.WEAK,
                confidence_tier=ConfidenceTier.WEAK,
                learning_mode=LearningMode.REFRESHER,
                recommended_resource=refresher_res,
                score_breakdown=score_breakdown,
                covered_by_resource_id=None,
                reason_codes=reason_codes,
                reasoning=reasoning,
                estimated_hours=refresher_res.estimated_hours if refresher_res else 4.0,
                is_refresher=True,
                is_exploratory=False,
            )
            updated_roadmap.append(updated_item)
        elif item.skill_id in dependents:
            # Lock all downstream dependents
            updated_item = item.model_copy(deep=True)
            updated_item.state = RoadmapNodeState.LOCKED
            updated_roadmap.append(updated_item)
            changed_skills.append(item.skill_id)
        else:
            kept_skills.append(item.skill_id)
            updated_roadmap.append(item)

    # Next Best Action becomes the refresher
    next_best = None
    for item in updated_roadmap:
        if item.skill_id == skill_id:
            next_best = item
            break
    if not next_best and updated_roadmap:
        next_best = updated_roadmap[0]

    adaptation = AdaptationDetails(
        action="REFRESHER_INSERTED",
        reason_codes=[ReasonCode.CHECKPOINT_FAILURE],
        reason="We added a Statistics refresher before Machine Learning Fundamentals because your recent checkpoint showed gaps in probability concepts, which ML Fundamentals depends on.",
        kept=kept_skills,
        changed=changed_skills,
    )

    return AdaptationResponse(
        adaptation=adaptation,
        updated_roadmap=updated_roadmap,
        next_best_action=next_best,
    )


def adapt_on_difficulty_feedback(
    event: AdaptationEvent,
    current_roadmap: List[RoadmapItem],
    profile: LearnerProfile,
    catalog: List[Resource],
    graph: nx.DiGraph,
) -> AdaptationResponse:
    """
    Trigger B: Difficulty feedback ("TOO_HARD" or "TOO_EASY").
    Adjusts learner level and re-scores candidates for uncompleted items.
    """
    skill_id = event.skill_id
    feedback = (event.feedback or "TOO_HARD").upper()

    old_level = profile.learner_level
    if feedback == "TOO_HARD":
        new_level = max(1, old_level - 1)
    else:
        new_level = min(3, old_level + 1)

    profile.learner_level = new_level

    updated_roadmap: List[RoadmapItem] = []
    kept_skills: List[str] = []
    changed_skills: List[str] = []

    for item in current_roadmap:
        if item.state == RoadmapNodeState.COMPLETED:
            kept_skills.append(item.skill_id)
            updated_roadmap.append(item)
            continue

        if skill_id is None or item.skill_id == skill_id:
            # Re-rank resource with adjusted difficulty level
            refresher_only = (item.learning_mode == LearningMode.REFRESHER)
            rec = get_best_resource(item.skill_id, catalog, profile, refresher_only=refresher_only)
            if rec:
                new_res = rec["resource"]
                new_breakdown = rec["breakdown"]
                updated_item = item.model_copy(
                    update={
                        "recommended_resource": new_res,
                        "score_breakdown": new_breakdown,
                        "estimated_hours": new_res.estimated_hours,
                    }
                )
                updated_roadmap.append(updated_item)
                changed_skills.append(item.skill_id)
            else:
                updated_roadmap.append(item)
                kept_skills.append(item.skill_id)
        else:
            kept_skills.append(item.skill_id)
            updated_roadmap.append(item)

    next_best = None
    for item in updated_roadmap:
        if item.state in (RoadmapNodeState.AVAILABLE, RoadmapNodeState.IN_PROGRESS, RoadmapNodeState.WEAK):
            next_best = item
            break
    if not next_best and updated_roadmap:
        next_best = updated_roadmap[0]

    direction_str = "simplified to foundational pace" if feedback == "TOO_HARD" else "elevated to advanced pacing"
    adaptation = AdaptationDetails(
        action="DIFFICULTY_RECALIBRATED",
        reason_codes=[ReasonCode.DIFFICULTY_MATCH],
        reason=f"Learning materials recalibrated for {skill_id or 'upcoming modules'} ({direction_str}).",
        kept=kept_skills,
        changed=changed_skills,
    )

    return AdaptationResponse(
        adaptation=adaptation,
        updated_roadmap=updated_roadmap,
        next_best_action=next_best,
    )


def adapt_on_interest_change(
    event: AdaptationEvent,
    current_roadmap: List[RoadmapItem],
    profile: LearnerProfile,
    catalog: List[Resource],
    graph: nx.DiGraph,
) -> AdaptationResponse:
    """
    Trigger C: Interest change.
    Keeps completed and in-progress items, re-runs deterministic DAG generation for remaining branch.
    """
    new_interest = event.new_interest_domain or "Computer Vision"
    profile.interest_domain = new_interest

    # Keep completed and in-progress items immutable
    kept_items = [i for i in current_roadmap if i.state in (RoadmapNodeState.COMPLETED, RoadmapNodeState.IN_PROGRESS)]
    kept_skill_ids = [i.skill_id for i in kept_items]

    # Generate fresh full roadmap with new interest domain
    full_response = build_roadmap(graph, catalog, profile)

    # Combine kept items + new branch items that haven't been completed
    new_tail = [i for i in full_response.roadmap if i.skill_id not in kept_skill_ids]

    # Assign availability state for the first item in the new tail if nothing else is active
    if not any(i.state in (RoadmapNodeState.AVAILABLE, RoadmapNodeState.IN_PROGRESS) for i in kept_items):
        if new_tail:
            new_tail[0].state = RoadmapNodeState.AVAILABLE

    updated_roadmap = kept_items + new_tail
    changed_skill_ids = [i.skill_id for i in new_tail]

    next_best = None
    for item in updated_roadmap:
        if item.state in (RoadmapNodeState.AVAILABLE, RoadmapNodeState.IN_PROGRESS, RoadmapNodeState.WEAK):
            next_best = item
            break
    if not next_best and updated_roadmap:
        next_best = updated_roadmap[0]

    adaptation = AdaptationDetails(
        action="TRACK_SPECIALIZATION_SWAPPED",
        reason_codes=[ReasonCode.INTEREST_ALIGNMENT, ReasonCode.SPECIALIZATION_BRANCH],
        reason=f"Specialization track updated to {new_interest}. Completed foundations were preserved.",
        kept=kept_skill_ids,
        changed=changed_skill_ids,
    )

    return AdaptationResponse(
        adaptation=adaptation,
        updated_roadmap=updated_roadmap,
        next_best_action=next_best,
    )
