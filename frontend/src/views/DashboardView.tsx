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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 80px' }}>
      {/* Top Header Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Goal & Target */}
        <div className="glass-panel" style={{ padding: '20px 24px', gridColumn: 'span 2', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Compass size={17} color="#2563eb" />
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Curated Roadmap
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', color: '#0f172a' }}>
            {profile.target_role || 'Personalized Track'}
          </h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              Track: {profile.interest_domain || 'General Specialization'}
            </span>
            <span className="badge" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
              Format: {profile.learning_format}
            </span>
          </div>
        </div>

        {/* Card 2: Pace Range */}
        <div className="glass-panel" style={{ padding: '20px 24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Clock size={17} color="#d97706" />
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Estimated Pace
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
            {durationRange.min_weeks}–{durationRange.max_weeks} weeks
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            at ~{profile.weekly_hours} hrs/week ({totalHours}h total)
          </div>
        </div>

        {/* Card 3: Real Progress */}
        <div className="glass-panel" style={{ padding: '20px 24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={17} color="#059669" />
              <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Progress
              </span>
            </div>
            <button
              onClick={onResetGoal}
              className="btn-secondary"
              style={{ fontSize: '0.74rem', padding: '3px 8px' }}
              title="Reset Goal"
            >
              <RotateCcw size={12} /> New Goal
            </button>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#059669' }}>
            {progressPercent}%
          </div>
          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#059669',
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
            padding: '16px 22px',
            marginBottom: '24px',
            background: '#fff5f5',
            borderColor: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.98rem' }}>
                Adaptation Triggered: {adaptationBanner.action}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '2px' }}>
                {adaptationBanner.reason}
              </div>
            </div>
          </div>

          <button
            onClick={() => setAdaptationBanner(null)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Demo Controller Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
          <Sparkles size={15} color="#2563eb" />
          <span><strong>Adaptive Scenario Triggers:</strong></span>
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
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderColor: '#fca5a5',
              background: '#fff5f5',
              color: '#b91c1c',
            }}
          >
            Simulate Checkpoint Failure (33%)
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
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderColor: '#bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
            }}
          >
            Switch Track (Computer Vision)
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
              fontSize: '0.8rem',
              padding: '6px 12px',
            }}
          >
            Pacing Feedback (Fast Pace)
          </button>
        </div>
      </div>

      {/* Hero Next Best Action Card */}
      <div style={{ marginBottom: '32px' }}>
        <NextBestAction
          item={nextBestAction}
          onStartLearning={handleStartLearning}
          onTakeQuiz={(item) => setQuizSkillId(item.skill_id)}
        />
      </div>

      {/* Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
          <Layers size={20} color="#2563eb" /> Prerequisite-Aware Learning Roadmap
        </h2>
        <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Click "Open" to visit verified courses or "Fit" to inspect scoring
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
          bottom: '24px',
          right: '24px',
          borderRadius: 'var(--radius-full)',
          padding: '12px 20px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.92rem',
        }}
      >
        <MessageSquare size={18} />
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
