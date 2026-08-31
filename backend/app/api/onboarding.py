from typing import Any, Dict, List
from fastapi import APIRouter
from pydantic import BaseModel
from ..services.llm_service import parse_goal_nlp

router = APIRouter(prefix="/onboard", tags=["Onboarding"])


class ParseGoalRequest(BaseModel):
    goal_raw: str


class ParseGoalResponse(BaseModel):
    profile: Dict[str, Any]
    missing_fields: List[str]


@router.post("/parse", response_model=ParseGoalResponse)
async def parse_onboarding_goal(request: ParseGoalRequest):
    """
    Parses natural language goal into structured fields and flags missing fields (Section 11).
    """
    result = parse_goal_nlp(request.goal_raw)
    return ParseGoalResponse(**result)
