import {
  AdaptationEvent,
  AdaptationResponse,
  DAGData,
  LearnerProfile,
  QuizData,
  RoadmapItem,
  RoadmapResponse,
} from '../types';
import {
  adaptRoadmapFallback,
  explainAssistantFallback,
  generateRoadmapFallback,
  getQuizFallback,
  parseGoalClient,
} from './fallbackEngine';

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
    try {
      const res = await fetch(`${API_BASE}/onboard/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_raw }),
      });
      return await handleResponse<ParseGoalResult>(res, 'Failed to parse goal');
    } catch (err) {
      console.warn('[Pathfinder] Server parse failed, using client NLU parser fallback:', err);
      return parseGoalClient(goal_raw);
    }
  },

  async generateRoadmap(profile: LearnerProfile): Promise<RoadmapResponse> {
    try {
      const res = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      return await handleResponse<RoadmapResponse>(res, 'Failed to generate roadmap');
    } catch (err) {
      console.warn('[Pathfinder] Server roadmap generation failed, using local engine fallback:', err);
      return generateRoadmapFallback(profile);
    }
  },

  async adaptRoadmap(
    event: AdaptationEvent,
    current_roadmap: RoadmapItem[],
    profile: LearnerProfile
  ): Promise<AdaptationResponse> {
    try {
      const res = await fetch(`${API_BASE}/roadmap/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          current_roadmap,
          profile,
        }),
      });
      return await handleResponse<AdaptationResponse>(res, 'Failed to adapt roadmap');
    } catch (err) {
      console.warn('[Pathfinder] Server adaptation failed, using local adaptation fallback:', err);
      return adaptRoadmapFallback(event, current_roadmap, profile);
    }
  },

  async getQuiz(skill_id: string): Promise<QuizData> {
    try {
      const res = await fetch(`${API_BASE}/quiz/${skill_id}`);
      return await handleResponse<QuizData>(res, `Failed to fetch quiz for ${skill_id}`);
    } catch (err) {
      console.warn('[Pathfinder] Server quiz fetch failed, using local quiz fallback:', err);
      return getQuizFallback(skill_id);
    }
  },

  async getDAG(): Promise<DAGData> {
    try {
      const res = await fetch(`${API_BASE}/dag`);
      return await handleResponse<DAGData>(res, 'Failed to fetch DAG');
    } catch (err) {
      console.warn('[Pathfinder] Server DAG fetch failed, returning default DAG shell:', err);
      return { nodes: [], links: [] };
    }
  },

  async askAssistant(
    question: string,
    roadmap_context: RoadmapItem[],
    profile: LearnerProfile
  ): Promise<string> {
    try {
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
    } catch (err) {
      console.warn('[Pathfinder] Server assistant failed, using local assistant reasoning:', err);
      return explainAssistantFallback(question, profile);
    }
  },
};
