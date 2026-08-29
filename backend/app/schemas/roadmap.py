from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from .learner import ConfidenceTier
from .resource import Resource, ScoreBreakdown


class LearningMode(str, Enum):
    FULL_MODULE = "FULL_MODULE"
    REFRESHER = "REFRESHER"
    PRACTICE = "PRACTICE"
    SKIP = "SKIP"


class RoadmapNodeState(str, Enum):
    LOCKED = "LOCKED"
    AVAILABLE = "AVAILABLE"
    IN_PROGRESS = "IN_PROGRESS"
    WEAK = "WEAK"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"


class ReasonCode(str, Enum):
    TARGET_SKILL = "TARGET_SKILL"
    PREREQUISITE_OF_TARGET = "PREREQUISITE_OF_TARGET"
    SELF_REPORTED_UNVERIFIED = "SELF_REPORTED_UNVERIFIED"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    CHECKPOINT_FAILURE = "CHECKPOINT_FAILURE"
    DIFFICULTY_MATCH = "DIFFICULTY_MATCH"
    FORMAT_MATCH = "FORMAT_MATCH"
    INTEREST_ALIGNMENT = "INTEREST_ALIGNMENT"
    SPECIALIZATION_BRANCH = "SPECIALIZATION_BRANCH"
    COVERED_BY_EARLIER_RESOURCE = "COVERED_BY_EARLIER_RESOURCE"
    NO_RESOURCE_AVAILABLE = "NO_RESOURCE_AVAILABLE"
    EXPLORATORY_UNSUPPORTED = "EXPLORATORY_UNSUPPORTED"


class RoadmapItem(BaseModel):
    skill_id: str
    skill_name: str
    phase: int
    state: RoadmapNodeState
    confidence_tier: ConfidenceTier
    learning_mode: LearningMode
    recommended_resource: Optional[Resource] = None
    score_breakdown: Optional[ScoreBreakdown] = None
    covered_by_resource_id: Optional[str] = None   # set when deduped (Section 1.8)
    reason_codes: List[ReasonCode] = Field(default_factory=list)
    reasoning: str = ""                            # rendered from reason_codes, no LLM required
    estimated_hours: float = 0.0
    is_refresher: bool = False
    is_exploratory: bool = False


class ExploratoryTopic(BaseModel):
    label: str
    note: str = "This area is outside our validated curriculum graph."


class DurationRange(BaseModel):
    min_weeks: int
    max_weeks: int


class RoadmapResponse(BaseModel):
    roadmap: List[RoadmapItem]
    next_best_action: Optional[RoadmapItem] = None
    estimated_total_hours: float
    estimated_duration_range: DurationRange
    exploratory_topics: List[ExploratoryTopic] = Field(default_factory=list)
