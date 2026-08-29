import React from 'react';
import { RoadmapItem } from '../types';
import { Sparkles, ArrowRight, Clock, Award, AlertTriangle, CheckCircle, BookOpen, Layers, Zap } from 'lucide-react';

interface NextBestActionProps {
  item?: RoadmapItem | null;
  onStartLearning: (item: RoadmapItem) => void;
  onTakeQuiz?: (item: RoadmapItem) => void;
}

export const NextBestAction: React.FC<NextBestActionProps> = ({
  item,
  onStartLearning,
  onTakeQuiz,
}) => {
  if (!item) {
    return (
      <div className="glass-panel" style={{ padding: '28px', textAlign: 'center' }}>
        <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ fontSize: '1.3rem' }}>All Curriculum Milestones Completed!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>You have completed all prerequisite and target skills in your roadmap.</p>
      </div>
    );
  }

  const isWeak = item.state === 'WEAK' || item.confidence_tier === 'WEAK';
  const isQuizAvailable = item.skill_id === 'statistics_probability';

  return (
    <div
      className="glass-panel-elevated"
      style={{
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
        border: isWeak ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1.5px solid rgba(249, 115, 22, 0.45)',
        background: isWeak
          ? 'linear-gradient(135deg, rgba(42, 18, 22, 0.9) 0%, rgba(20, 24, 35, 0.88) 100%)'
          : 'linear-gradient(135deg, rgba(38, 24, 16, 0.92) 0%, rgba(18, 22, 32, 0.88) 100%)',
        boxShadow: isWeak
          ? '0 12px 36px rgba(239, 68, 68, 0.25)'
          : '0 12px 36px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Glow highlight */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: isWeak ? 'rgba(239, 68, 68, 0.22)' : 'rgba(249, 115, 22, 0.25)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span
              className="badge"
              style={{
                background: isWeak ? 'var(--danger-bg)' : 'rgba(249, 115, 22, 0.18)',
                color: isWeak ? '#fca5a5' : '#fed7aa',
                border: isWeak ? '1px solid var(--danger-border)' : '1px solid var(--border-accent)',
                padding: '5px 14px',
                fontSize: '0.78rem',
              }}
            >
              {isWeak ? <AlertTriangle size={14} /> : <Zap size={14} />}
              {isWeak ? 'Priority Refresher Module' : 'Next Best Action'}
            </span>

            <span className="badge badge-available">Phase {item.phase}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
              Mode: {item.learning_mode}
            </span>
          </div>

          <h2 style={{ fontSize: '1.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {item.recommended_resource ? item.recommended_resource.title : item.skill_name}
          </h2>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isQuizAvailable && onTakeQuiz && (
            <button
              id="take-checkpoint-quiz-btn"
              type="button"
              onClick={() => onTakeQuiz(item)}
              className="btn-secondary"
              style={{
                borderColor: 'rgba(245, 158, 11, 0.5)',
                background: 'rgba(245, 158, 11, 0.14)',
                color: '#fef08a',
                padding: '11px 20px',
                fontSize: '0.92rem',
              }}
            >
              <Award size={18} color="#f59e0b" /> Take Checkpoint Quiz
            </button>
          )}

          <button
            id="start-learning-btn"
            type="button"
            onClick={() => onStartLearning(item)}
            className="btn-primary"
            style={{
              padding: '11px 26px',
              background: isWeak
                ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                : 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: isWeak
                ? '0 4px 20px rgba(239, 68, 68, 0.4)'
                : '0 4px 20px rgba(249, 115, 22, 0.45)',
            }}
          >
            {item.state === 'COMPLETED' ? 'Mark In Progress' : isWeak ? 'Start Refresher' : 'Start Module'}{' '}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Explanation Quote Card */}
      <div
        style={{
          background: 'rgba(9, 11, 16, 0.7)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          borderLeft: `4px solid ${isWeak ? '#ef4444' : 'var(--primary)'}`,
          marginBottom: '18px',
          fontSize: '0.96rem',
          color: '#e2e8f0',
          lineHeight: 1.55,
        }}
      >
        <span style={{ color: isWeak ? '#fca5a5' : '#fdba74', fontWeight: 600 }}>Why right now: </span>
        {item.reasoning}
      </div>

      {/* Metadata Footprint */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="#f97316" />
          <span><strong>{item.estimated_hours} hours</strong> (Paced for 2-week milestone window)</span>
        </div>

        {item.recommended_resource && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="#34d399" />
              <span>Format: <strong>{item.recommended_resource.format}</strong></span>
            </div>
            <div>
              Provider: <strong style={{ color: '#ffffff' }}>{item.recommended_resource.provider || 'Pathfinder Studio'}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
