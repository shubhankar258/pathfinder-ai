export type ConfidenceTier =
  | 'UNKNOWN'
  | 'FAMILIAR'
  | 'DEVELOPING'
  | 'PRACTICED'
  | 'VERIFIED'
  | 'WEAK';

export type LearningMode =
  | 'FULL_MODULE'
  | 'REFRESHER'
  | 'PRACTICE'
  | 'SKIP';

export type RoadmapNodeState =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'WEAK'
  | 'COMPLETED'
  | 'SKIPPED';

export type LearningFormat = 'video' | 'reading' | 'hands_on' | 'interactive';

export type ReasonCode =
  | 'TARGET_SKILL'
  | 'PREREQUISITE_OF_TARGET'
  | 'SELF_REPORTED_UNVERIFIED'
  | 'LOW_CONFIDENCE'
  | 'CHECKPOINT_FAILURE'
  | 'DIFFICULTY_MATCH'
  | 'FORMAT_MATCH'
  | 'INTEREST_ALIGNMENT'
  | 'SPECIALIZATION_BRANCH'
  | 'COVERED_BY_EARLIER_RESOURCE'
  | 'NO_RESOURCE_AVAILABLE'
  | 'EXPLORATORY_UNSUPPORTED';

export type AdaptationEventType =
  | 'CHECKPOINT_FAILED'
  | 'DIFFICULTY_FEEDBACK'
  | 'INTEREST_CHANGED';

export interface AdaptationEvent {
  event_type: AdaptationEventType;
  skill_id?: string | null;
  score?: number | null;
  self_rating?: number | null;
  feedback?: string | null;
  new_interest_domain?: string | null;
}

export interface LearnerProfile {
  user_id: string;
  goal_raw: string;
  target_role?: string | null;
  target_skill?: string | null;
  timeline_weeks: number;
  weekly_hours: number;
  experience_level?: string | null;
  learner_level: number;
  learning_format: LearningFormat;
  interest_domain?: string | null;
  skill_confidence: Record<string, ConfidenceTier>;
}

export interface Resource {
  id: string;
  title: string;
  skills_taught: string[];
  topics: string[];
  format: LearningFormat;
  difficulty: string;
  difficulty_level: number;
  estimated_hours: number;
  quality_score: number;
  is_refresher: boolean;
  url?: string | null;
  provider?: string | null;
}

export interface ScoreBreakdown {
  difficulty_fit: number;
  format_fit: number;
  time_fit: number;
  interest_alignment: number;
  quality: number;
  final_score: number;
}

export interface RoadmapItem {
  skill_id: string;
  skill_name: string;
  phase: number;
  state: RoadmapNodeState;
  confidence_tier: ConfidenceTier;
  learning_mode: LearningMode;
  recommended_resource?: Resource | null;
  score_breakdown?: ScoreBreakdown | null;
  covered_by_resource_id?: string | null;
  reason_codes: ReasonCode[];
  reasoning: string;
  estimated_hours: number;
  is_refresher: boolean;
  is_exploratory: boolean;
}

export interface ExploratoryTopic {
  label: string;
  note: string;
}

export interface DurationRange {
  min_weeks: number;
  max_weeks: number;
}

export interface RoadmapResponse {
  roadmap: RoadmapItem[];
  next_best_action?: RoadmapItem | null;
  estimated_total_hours: number;
  estimated_duration_range: DurationRange;
  exploratory_topics: ExploratoryTopic[];
}

export interface AdaptationDetails {
  action: string;
  reason_codes: ReasonCode[];
  reason: string;
  kept: string[];
  changed: string[];
}

export interface AdaptationResponse {
  adaptation: AdaptationDetails;
  updated_roadmap: RoadmapItem[];
  next_best_action?: RoadmapItem | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizData {
  skill_id: string;
  skill_name: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface DAGNode {
  id: string;
  name: string;
  description: string;
  domain: string;
  phase_hint: number;
}

export interface DAGLink {
  source: string;
  target: string;
}

export interface DAGData {
  nodes: DAGNode[];
  links: DAGLink[];
}
