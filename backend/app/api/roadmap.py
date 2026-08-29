import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from ..core.adaptation import handle_adaptation
from ..core.roadmap_builder import build_roadmap
from ..core.state import get_graph_and_catalog
from ..schemas.events import AdaptationEvent, AdaptationResponse
from ..schemas.learner import LearnerProfile
from ..schemas.roadmap import RoadmapItem, RoadmapResponse

router = APIRouter(prefix="/api", tags=["Roadmap"])


class GenerateRoadmapRequest(BaseModel):
    profile: LearnerProfile


class AdaptRoadmapRequest(BaseModel):
    event: AdaptationEvent
    current_roadmap: List[RoadmapItem]
    profile: LearnerProfile


@router.post("/roadmap/generate", response_model=RoadmapResponse)
async def generate_roadmap_endpoint(req_body: GenerateRoadmapRequest, request: Request):
    """
    Generates deterministic, prerequisite-aware roadmap for given learner profile (Section 11).
    """
    graph, catalog = get_graph_and_catalog()
    return build_roadmap(graph, catalog, req_body.profile)


@router.post("/roadmap/adapt", response_model=AdaptationResponse)
async def adapt_roadmap_endpoint(req_body: AdaptRoadmapRequest, request: Request):
    """
    Handles adaptive triggers (CHECKPOINT_FAILED, DIFFICULTY_FEEDBACK, INTEREST_CHANGED).
    Completed progress remains strictly immutable (Section 8 & 11).
    """
    graph, catalog = get_graph_and_catalog()
    return handle_adaptation(
        event=req_body.event,
        current_roadmap=req_body.current_roadmap,
        profile=req_body.profile,
        catalog=catalog,
        graph=graph,
    )


@router.get("/quiz/{skill_id}")
async def get_quiz_endpoint(skill_id: str):
    """
    Returns hand-authored quiz questions for a skill checkpoint (e.g. statistics_probability).
    """
    quiz_path = Path(__file__).parent.parent / "data" / "quiz_bank.json"
    if not quiz_path.exists():
        raise HTTPException(status_code=404, detail="Quiz bank not found")

    with open(quiz_path, "r", encoding="utf-8") as f:
        quizzes = json.load(f)

    if skill_id not in quizzes:
        raise HTTPException(status_code=404, detail=f"No quiz found for skill '{skill_id}'")

    return quizzes[skill_id]


@router.get("/dag")
async def get_dag_endpoint(request: Request):
    """
    Returns full DAG nodes and links for frontend interactive visualization.
    """
    dag_path = Path(__file__).parent.parent / "data" / "skill_dag.json"
    with open(dag_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
