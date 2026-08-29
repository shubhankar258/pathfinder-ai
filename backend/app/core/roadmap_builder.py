from typing import Dict, List, Optional, Set
import networkx as nx
from ..schemas.learner import ConfidenceTier, LearnerProfile
from ..schemas.resource import Resource
from ..schemas.roadmap import (
    DurationRange,
    ExploratoryTopic,
    LearningMode,
    ReasonCode,
    RoadmapItem,
    RoadmapNodeState,
    RoadmapResponse,
)
from .confidence import derive_learning_mode
from .dag_engine import get_required_skills
from .reasoning import render_reasoning
from .recommender import get_best_resource


def build_roadmap(
    graph: nx.DiGraph,
    catalog: List[Resource],
    profile: LearnerProfile,
    target_skill_override: Optional[str] = None,
) -> RoadmapResponse:
    """
    Assembles a complete, explainable learning roadmap:
    - Resolves target skill (defaulting to profile.target_skill or ml_engineer_target)
    - Performs gap analysis excluding only VERIFIED skills
    - Deterministic topological ordering
    - Stage A + B resource recommendation per skill
    - Whole-roadmap deduplication by resource.id (Section 1.8)
    - State assignment (first available is ACTIVE/AVAILABLE, rest LOCKED)
    - Duration range computation
    """
    target = target_skill_override or profile.target_skill or "ml_engineer_target"

    # Handle out-of-graph target gracefully (Section 7.4)
    exploratory_topics: List[ExploratoryTopic] = []
    if target not in graph:
        exploratory_topics.append(
            ExploratoryTopic(
                label=target,
                note="This area is outside our validated curriculum graph. We have mapped you to the closest verified ML engineering track.",
            )
        )
        target = "ml_engineer_target"

    # Step 1: Gap traversal and deterministic topo sort
    skill_ids = get_required_skills(graph, target, profile.skill_confidence)

    # Filter specialization branches if interest is stated
    # E.g., if interest is NLP, we exclude cv_specialization and its children, and vice-versa
    if profile.interest_domain:
        interest_lower = profile.interest_domain.lower()
        if "nlp" in interest_lower or "language" in interest_lower or "text" in interest_lower:
            cv_nodes = {"cv_specialization", "cnn_image_processing", "object_detection_segmentation", "cv_engineer_target"}
            skill_ids = [s for s in skill_ids if s not in cv_nodes]
        elif "vision" in interest_lower or "cv" in interest_lower or "image" in interest_lower:
            nlp_nodes = {"nlp_specialization", "text_processing_embeddings", "transformers_llms", "nlp_engineer_target"}
            skill_ids = [s for s in skill_ids if s not in nlp_nodes]

    # Don't include the terminal abstract target node itself in the display items if it's a role milestone
    display_skills = [s for s in skill_ids if not s.endswith("_target")]

    # Step 2: Assemble Roadmap Items with deduplication
    roadmap: List[RoadmapItem] = []
    seen_resource_ids: Set[str] = set()
    resource_id_to_title: Dict[str, str] = {}

    for i, skill_id in enumerate(display_skills):
        node_data = graph.nodes.get(skill_id, {})
        skill_name = node_data.get("name", skill_id.replace("_", " ").title())
        phase = node_data.get("phase_hint", 1)

        tier = profile.skill_confidence.get(skill_id, ConfidenceTier.UNKNOWN)
        mode = derive_learning_mode(tier)

        if mode == LearningMode.SKIP:
            continue

        refresher_only = (mode == LearningMode.REFRESHER)
        rec = get_best_resource(skill_id, catalog, profile, refresher_only=refresher_only)

        res: Optional[Resource] = None
        breakdown = None
        covered_by_id: Optional[str] = None
        estimated_hours = 0.0
        reason_codes: List[ReasonCode] = []

        if rec is not None:
            candidate_res: Resource = rec["resource"]
            breakdown = rec["breakdown"]

            # Section 1.8: Deduplication across the whole roadmap
            if candidate_res.id in seen_resource_ids:
                res = None
                covered_by_id = candidate_res.id
                estimated_hours = 0.0
                reason_codes.append(ReasonCode.COVERED_BY_EARLIER_RESOURCE)
            else:
                res = candidate_res
                estimated_hours = candidate_res.estimated_hours
                seen_resource_ids.add(candidate_res.id)
                resource_id_to_title[candidate_res.id] = candidate_res.title
        else:
            reason_codes.append(ReasonCode.NO_RESOURCE_AVAILABLE)

        # Contextual reason codes
        if tier == ConfidenceTier.FAMILIAR:
            reason_codes.append(ReasonCode.SELF_REPORTED_UNVERIFIED)
        elif tier == ConfidenceTier.WEAK:
            reason_codes.append(ReasonCode.CHECKPOINT_FAILURE)
        elif skill_id == target or "capstone" in skill_id:
            reason_codes.append(ReasonCode.TARGET_SKILL)
        else:
            reason_codes.append(ReasonCode.PREREQUISITE_OF_TARGET)

        if profile.interest_domain and res and any(profile.interest_domain.lower() in t.lower() for t in res.topics):
            reason_codes.append(ReasonCode.INTEREST_ALIGNMENT)

        # Find next dependent name for template
        next_dependent_name = None
        for succ in graph.successors(skill_id):
            if succ in display_skills:
                next_dependent_name = graph.nodes.get(succ, {}).get("name")
                break

        reasoning = render_reasoning(
            reason_codes=reason_codes,
            next_dependent_name=next_dependent_name,
            resource_title=resource_id_to_title.get(covered_by_id) if covered_by_id else (res.title if res else None),
            interest_domain=profile.interest_domain,
            target_role=profile.target_role,
            learning_format=profile.learning_format.value if profile.learning_format else None,
            learner_level=profile.learner_level,
        )

        # Initial node state: First item is AVAILABLE, rest LOCKED
        state = RoadmapNodeState.AVAILABLE if i == 0 else RoadmapNodeState.LOCKED
        if tier == ConfidenceTier.WEAK:
            state = RoadmapNodeState.WEAK

        roadmap.append(
            RoadmapItem(
                skill_id=skill_id,
                skill_name=skill_name,
                phase=phase,
                state=state,
                confidence_tier=tier,
                learning_mode=mode,
                recommended_resource=res,
                score_breakdown=breakdown,
                covered_by_resource_id=covered_by_id,
                reason_codes=reason_codes,
                reasoning=reasoning,
                estimated_hours=estimated_hours,
                is_refresher=refresher_only,
                is_exploratory=False,
            )
        )

    # Step 3: Compute timeline range (Section 7.3)
    total_hours = sum(item.estimated_hours for item in roadmap)
    base_weeks = total_hours / max(profile.weekly_hours, 1.0)
    min_weeks = max(1, round(base_weeks * 0.9))
    max_weeks = max(min_weeks, round(base_weeks * 1.1))

    # Step 4: Next Best Action is first available or weak or in_progress item
    next_best = None
    for item in roadmap:
        if item.state in (RoadmapNodeState.AVAILABLE, RoadmapNodeState.IN_PROGRESS, RoadmapNodeState.WEAK):
            next_best = item
            break
    if not next_best and roadmap:
        next_best = roadmap[0]

    return RoadmapResponse(
        roadmap=roadmap,
        next_best_action=next_best,
        estimated_total_hours=round(total_hours, 1),
        estimated_duration_range=DurationRange(min_weeks=min_weeks, max_weeks=max_weeks),
        exploratory_topics=exploratory_topics,
    )
