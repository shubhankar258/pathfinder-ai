from typing import List, Optional
from pydantic import BaseModel, Field
from .learner import LearningFormat


class Resource(BaseModel):
    id: str
    title: str
    skills_taught: List[str]                    # one or more DAG node ids
    topics: List[str] = Field(default_factory=list)  # structured tags for interest matching
    format: LearningFormat
    difficulty: str                             # display label: "beginner"/"intermediate"/"advanced"
    difficulty_level: int                       # 1/2/3 — the only field used in scoring
    estimated_hours: float
    quality_score: float                        # 0.0-1.0, curated
    is_refresher: bool = False                  # short consolidation resource, not a full module
    url: Optional[str] = None
    provider: Optional[str] = None


class ScoreBreakdown(BaseModel):
    difficulty_fit: float
    format_fit: float
    time_fit: float
    interest_alignment: float
    quality: float
    final_score: float
