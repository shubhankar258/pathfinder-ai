import React, { useState } from 'react';
import {
  AdaptationEvent,
  AdaptationEventType,
  LearnerProfile,
  RoadmapItem,
  RoadmapNodeState,
  RoadmapResponse,
} from '../types';
import { api } from '../services/api';
import { NextBestAction } from '../components/NextBestAction';
import { RoadmapGraph } from '../components/RoadmapGraph';
import { QuizModal } from '../components/QuizModal';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import { AssistantDrawer } from '../components/AssistantDrawer';
import {
  Compass,
  Clock,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Layers,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  initialRoadmapData: RoadmapResponse;
  initialProfile: LearnerProfile;
  onResetGoal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialRoadmapData,
  initialProfile,
  onResetGoal,
}) => {
  const [profile, setProfile] = useState<LearnerProfile>(initialProfile);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(initialRoadmapData.roadmap);
  const [durationRange, setDurationRange] = useState(initialRoadmapData.estimated_duration_range);
  const [totalHours, setTotalHours] = useState(initialRoadmapData.estimated_total_hours);
  const [nextBestAction, setNextBestAction] = useState<RoadmapItem | null | undefined>(
    initialRoadmapData.next_best_action
  );

  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [quizSkillId, setQuizSkillId] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [adaptationBanner, setAdaptationBanner] = useState<{
    action: string;
    reason: string;
  } | null>(null);

  // Compute completed percentage
  const completedCount = roadmap.filter((i) => i.state === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / (roadmap.length || 1)) * 100);

  // Handle adaptation events
  const triggerAdaptation = async (event: AdaptationEvent) => {
    try {
      const resp = await api.adaptRoadmap(event, roadmap, profile);
      setRoadmap(resp.updated_roadmap);
      setNextBestAction(resp.next_best_action);
      setAdaptationBanner({
        action: resp.adaptation.action,
        reason: resp.adaptation.reason,
      });

      // Update profile in state if interest or difficulty changed
      if (event.new_interest_domain) {
        setProfile((prev) => ({ ...prev, interest_domain: event.new_interest_domain }));
      }
      if (event.feedback) {
        setProfile((prev) => ({
          ...prev,
          learner_level:
            event.feedback === 'TOO_HARD'
              ? Math.max(1, prev.learner_level - 1)
              : Math.min(3, prev.learner_level + 1),
        }));
      }

      // Recalculate hours and timeline range
      const hours = resp.updated_roadmap.reduce((sum, item) => sum + item.estimated_hours, 0);
      setTotalHours(Math.round(hours * 10) / 10);
      const baseWeeks = hours / Math.max(profile.weekly_hours, 1);
      setDurationRange({
        min_weeks: Math.max(1, Math.round(baseWeeks * 0.9)),
        max_weeks: Math.max(1, Math.round(baseWeeks * 1.1)),
      });
    } catch (err: any) {
      alert(`Adaptation error: ${err.message}`);
    }
  };

  // 1. Checkpoint Quiz Completion
  const handleQuizCompleted = (score: number) => {
    triggerAdaptation({
      event_type: 'CHECKPOINT_FAILED' as AdaptationEventType,
      skill_id: quizSkillId || 'statistics_probability',
      score: score,
    });
  };

  // 2. Mark Next Best Action Completed
  const handleStartLearning = (item: RoadmapItem) => {
    const updated = roadmap.map((i) => {
      if (i.skill_id === item.skill_id) {
        return {
          ...i,
          state: (i.state === 'COMPLETED' ? 'AVAILABLE' : 'COMPLETED') as RoadmapNodeState,
        };
      }
      return i;
    });

    let foundNext = false;
    const finalItems = updated.map((i) => {
      if (!foundNext && i.state === 'LOCKED') {
        foundNext = true;
        return { ...i, state: 'AVAILABLE' as RoadmapNodeState };
      }
      return i;
    });

    setRoadmap(finalItems);
    const nextAvail = finalItems.find((i) => i.state === 'AVAILABLE' || i.state === 'WEAK');
    setNextBestAction(nextAvail || null);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 90px' }}>
      {/* Top Bento Header Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Card 1: Goal & Target */}
        <div className="glass-panel" style={{ padding: '20px 24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Compass size={18} color="#f97316" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Curated Roadmap
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '8px', color: '#ffffff' }}>
            {profile.target_role || 'Machine Learning Engineer'}
          </h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.16)', color: '#fed7aa', border: '1px solid var(--border-accent)' }}>
              Track: {profile.interest_domain || 'NLP'}
            </span>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: '1px solid var(--border-amber)' }}>
              Format: {profile.learning_format}
            </span>
          </div>
        </div>

        {/* Card 2: Pace Range */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Clock size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Estimated Pace
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
            {durationRange.min_weeks}–{durationRange.max_weeks} weeks
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            at ~{profile.weekly_hours} hrs/week ({totalHours}h total effort)
          </div>
        </div>

        {/* Card 3: Real Progress */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#10b981" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Progress
              </span>
            </div>
            <button
              onClick={onResetGoal}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              title="Reset Goal"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#34d399' }}>
            {progressPercent}%
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Live Adaptation Alert Banner */}
      {adaptationBanner && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '18px 24px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(30, 20, 24, 0.7))',
            borderColor: 'rgba(239, 68, 68, 0.45)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '10px' }}>
              <AlertTriangle size={24} color="#f87171" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '1.02rem' }}>
                Adaptation Triggered: {adaptationBanner.action}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#f1f5f9', marginTop: '2px' }}>
                {adaptationBanner.reason}
              </div>
            </div>
          </div>

          <button
            onClick={() => setAdaptationBanner(null)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Demo Controller Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 22px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(17, 20, 30, 0.65)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <Sparkles size={16} color="#f97316" />
          <span><strong>Interactive Demo Scenario Controls:</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            id="demo-trigger-stats-fail-btn"
            type="button"
            onClick={() =>
              triggerAdaptation({
                event_type: 'CHECKPOINT_FAILED' as AdaptationEventType,
                skill_id: 'statistics_probability',
                score: 0.33,
              })
            }
            className="btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '7px 14px',
              borderColor: 'rgba(239, 68, 68, 0.45)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#fca5a5',
            }}
          >
            Simulate Stats Checkpoint Fail (33%)
          </button>

          <button
            id="demo-trigger-cv-switch-btn"
            type="button"
            onClick={() =>
              triggerAdaptation({
                event_type: 'INTEREST_CHANGED' as AdaptationEventType,
                new_interest_domain: 'Computer Vision',
              })
            }
            className="btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '7px 14px',
              borderColor: 'rgba(249, 115, 22, 0.45)',
              background: 'rgba(249, 115, 22, 0.12)',
              color: '#fed7aa',
            }}
          >
            Switch Track: Computer Vision
          </button>

          <button
            type="button"
            onClick={() =>
              triggerAdaptation({
                event_type: 'DIFFICULTY_FEEDBACK' as AdaptationEventType,
                feedback: 'TOO_EASY',
              })
            }
            className="btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '7px 14px',
            }}
          >
            Pacing: Too Easy
          </button>
        </div>
      </div>

      {/* Hero Next Best Action Card */}
      <div style={{ marginBottom: '36px' }}>
        <NextBestAction
          item={nextBestAction}
          onStartLearning={handleStartLearning}
          onTakeQuiz={(item) => setQuizSkillId(item.skill_id)}
        />
      </div>

      {/* Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="#f97316" /> Prerequisite-Aware Learning Roadmap
        </h2>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Click any module to inspect its 5-factor scoring & reasoning
        </span>
      </div>

      {/* Multi-Phase Roadmap Visualizer */}
      <RoadmapGraph
        roadmap={roadmap}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* Floating AI Assistant Toggle Button */}
      <button
        id="open-assistant-btn"
        onClick={() => setIsAssistantOpen(true)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          borderRadius: 'var(--radius-full)',
          padding: '14px 22px',
          boxShadow: 'var(--shadow-primary-glow)',
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <MessageSquare size={20} />
        <span>Ask Pathfinder AI</span>
      </button>

      {/* Checkpoint Quiz Modal */}
      {quizSkillId && (
        <QuizModal
          skillId={quizSkillId}
          onClose={() => setQuizSkillId(null)}
          onQuizCompleted={handleQuizCompleted}
        />
      )}

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        profile={profile}
        roadmap={roadmap}
      />
    </div>
  );
};
