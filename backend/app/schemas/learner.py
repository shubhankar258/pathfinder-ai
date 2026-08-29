from enum import Enum
from typing import Dict, Optional
from pydantic import BaseModel, Field


class ConfidenceTier(str, Enum):
    UNKNOWN = "UNKNOWN"        # no evidence at all
    FAMILIAR = "FAMILIAR"      # self-reported only, no evidence
    DEVELOPING = "DEVELOPING"  # completed a learning resource for this skill
    PRACTICED = "PRACTICED"    # self-rated 4-5/5 at a checkpoint
    VERIFIED = "VERIFIED"      # passed a hand-authored quiz for this skill
    WEAK = "WEAK"              # hard-override failure state


class LearningFormat(str, Enum):
    VIDEO = "video"
    READING = "reading"
    HANDS_ON = "hands_on"
    INTERACTIVE = "interactive"


class LearnerProfile(BaseModel):
    user_id: str
    goal_raw: str                               # original free text, always stored verbatim
    target_role: Optional[str] = None           # e.g. "Machine Learning Engineer"
    target_skill: Optional[str] = None          # resolved DAG node id
    timeline_weeks: int = 24
    weekly_hours: float = 8.0
    experience_level: Optional[str] = None      # free text, e.g. "Basic Python" — display only
    learner_level: int = 1                      # 1=beginner, 2=intermediate, 3=advanced
    learning_format: LearningFormat = LearningFormat.HANDS_ON
    interest_domain: Optional[str] = None       # e.g. "NLP" — specialization + interest scoring
    skill_confidence: Dict[str, ConfidenceTier] = Field(default_factory=dict)
