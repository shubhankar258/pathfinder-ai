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

async function handleResponse<T>(res: Response, defaultAction: string): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : '';
    } catch {
      try {
        const text = await res.text();
        if (text && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
          detail = text.slice(0, 100);
        }
      } catch {}
    }
    const msg = detail ? `${defaultAction}: ${detail}` : `${defaultAction} (HTTP ${res.status} ${res.statusText || 'Error'})`;
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  async parseGoal(goal_raw: string): Promise<ParseGoalResult> {
    const res = await fetch(`${API_BASE}/onboard/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal_raw }),
    });
    return handleResponse<ParseGoalResult>(res, 'Failed to parse goal');
  },

  async generateRoadmap(profile: LearnerProfile): Promise<RoadmapResponse> {
    const res = await fetch(`${API_BASE}/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    return handleResponse<RoadmapResponse>(res, 'Failed to generate roadmap');
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
    return handleResponse<AdaptationResponse>(res, 'Failed to adapt roadmap');
  },

  async getQuiz(skill_id: string): Promise<QuizData> {
    const res = await fetch(`${API_BASE}/quiz/${skill_id}`);
    return handleResponse<QuizData>(res, `Failed to fetch quiz for ${skill_id}`);
  },

  async getDAG(): Promise<DAGData> {
    const res = await fetch(`${API_BASE}/dag`);
    return handleResponse<DAGData>(res, 'Failed to fetch DAG');
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
    const data = await handleResponse<{ answer: string }>(res, 'Failed to ask assistant');
    return data.answer;
  },
};
