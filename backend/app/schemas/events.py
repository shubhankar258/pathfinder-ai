from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from .roadmap import ReasonCode, RoadmapItem


class AdaptationEventType(str, Enum):
    CHECKPOINT_FAILED = "CHECKPOINT_FAILED"
    DIFFICULTY_FEEDBACK = "DIFFICULTY_FEEDBACK"
    INTEREST_CHANGED = "INTEREST_CHANGED"


class AdaptationEvent(BaseModel):
    event_type: AdaptationEventType
    skill_id: Optional[str] = None
    score: Optional[float] = None              # 0.0-1.0, for CHECKPOINT_FAILED
    self_rating: Optional[int] = None          # 1-5
    feedback: Optional[str] = None             # "TOO_HARD" | "TOO_EASY"
    new_interest_domain: Optional[str] = None


class AdaptationDetails(BaseModel):
    action: str
    reason_codes: List[ReasonCode] = Field(default_factory=list)
    reason: str
    kept: List[str] = Field(default_factory=list)
    changed: List[str] = Field(default_factory=list)


class AdaptationResponse(BaseModel):
    adaptation: AdaptationDetails
    updated_roadmap: List[RoadmapItem]
    next_best_action: Optional[RoadmapItem] = None
