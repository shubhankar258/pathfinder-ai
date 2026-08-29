from typing import Any, Dict, List
from fastapi import APIRouter
from pydantic import BaseModel, Field
from ..services.llm_service import generate_assistant_explanation

router = APIRouter(prefix="/api/assistant", tags=["Assistant"])


class ExplainRequest(BaseModel):
    question: str
    roadmap_context: List[Dict[str, Any]] = Field(default_factory=list)
    profile: Dict[str, Any] = Field(default_factory=dict)


class ExplainResponse(BaseModel):
    answer: str


@router.post("/explain", response_model=ExplainResponse)
async def explain_endpoint(request: ExplainRequest):
    """
    Phrases deterministic DAG prerequisites, confidence rules, and reason codes into conversational explanations.
    """
    answer = generate_assistant_explanation(
        question=request.question,
        roadmap_context=request.roadmap_context,
        profile=request.profile,
    )
    return ExplainResponse(answer=answer)
