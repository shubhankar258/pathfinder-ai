import {
  AdaptationEvent,
  AdaptationResponse,
  DAGData,
  LearnerProfile,
  QuizData,
  RoadmapItem,
  RoadmapResponse,
} from '../types';

const API_BASE = '/api';

export interface ParseGoalResult {
  profile: Partial<LearnerProfile>;
  missing_fields: string[];
}

export const api = {
  async parseGoal(goal_raw: string): Promise<ParseGoalResult> {
    const res = await fetch(`${API_BASE}/onboard/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal_raw }),
    });
    if (!res.ok) {
      throw new Error(`Failed to parse goal: ${res.statusText}`);
    }
    return res.json();
  },

  async generateRoadmap(profile: LearnerProfile): Promise<RoadmapResponse> {
    const res = await fetch(`${API_BASE}/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    if (!res.ok) {
      throw new Error(`Failed to generate roadmap: ${res.statusText}`);
    }
    return res.json();
  },

  async adaptRoadmap(
    event: AdaptationEvent,
    current_roadmap: RoadmapItem[],
    profile: LearnerProfile
  ): Promise<AdaptationResponse> {
    const res = await fetch(`${API_BASE}/roadmap/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        current_roadmap,
        profile,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to adapt roadmap: ${res.statusText}`);
    }
    return res.json();
  },

  async getQuiz(skill_id: string): Promise<QuizData> {
    const res = await fetch(`${API_BASE}/quiz/${skill_id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch quiz for ${skill_id}: ${res.statusText}`);
    }
    return res.json();
  },

  async getDAG(): Promise<DAGData> {
    const res = await fetch(`${API_BASE}/dag`);
    if (!res.ok) {
      throw new Error(`Failed to fetch DAG: ${res.statusText}`);
    }
    return res.json();
  },

  async askAssistant(
    question: string,
    roadmap_context: RoadmapItem[],
    profile: LearnerProfile
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/assistant/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        roadmap_context,
        profile,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to ask assistant: ${res.statusText}`);
    }
    const data = await res.json();
    return data.answer;
  },
};
