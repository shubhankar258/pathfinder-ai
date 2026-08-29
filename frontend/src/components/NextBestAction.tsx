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
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.4rem' }}>All Curriculum Milestones Completed!</h3>
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
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden',
        border: isWeak ? '1.5px solid rgba(239, 68, 68, 0.55)' : '1.5px solid rgba(249, 115, 22, 0.5)',
        background: isWeak
          ? 'linear-gradient(135deg, rgba(48, 18, 24, 0.72) 0%, rgba(24, 16, 26, 0.55) 100%)'
          : 'linear-gradient(135deg, rgba(42, 22, 16, 0.75) 0%, rgba(18, 22, 34, 0.55) 100%)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        boxShadow: isWeak
          ? '0 20px 48px rgba(239, 68, 68, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
          : '0 20px 48px rgba(249, 115, 22, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Specular glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: isWeak ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.25)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span
              className="badge"
              style={{
                background: isWeak ? 'var(--danger-bg)' : 'rgba(249, 115, 22, 0.22)',
                color: isWeak ? '#fca5a5' : '#fed7aa',
                border: isWeak ? '1px solid var(--danger-border)' : '1px solid var(--border-accent)',
                padding: '6px 15px',
                fontSize: '0.8rem',
              }}
            >
              {isWeak ? <AlertTriangle size={14} /> : <Zap size={14} />}
              {isWeak ? 'Priority Refresher Module' : 'Next Best Action'}
            </span>

            <span className="badge badge-available">Phase {item.phase}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
              Mode: {item.learning_mode}
            </span>
          </div>

          <h2 style={{ fontSize: '2.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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
                borderColor: 'rgba(245, 158, 11, 0.55)',
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#fef08a',
                padding: '12px 22px',
                fontSize: '0.94rem',
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
              padding: '12px 28px',
              background: isWeak
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.95), rgba(234, 88, 12, 0.95))',
              boxShadow: isWeak
                ? '0 6px 24px rgba(239, 68, 68, 0.45)'
                : '0 6px 24px rgba(249, 115, 22, 0.5)',
            }}
          >
            {item.state === 'COMPLETED' ? 'Mark In Progress' : isWeak ? 'Start Refresher' : 'Start Module'}{' '}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Explanation Glass Quote Block */}
      <div
        style={{
          background: 'rgba(10, 14, 24, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          borderLeft: `4px solid ${isWeak ? '#ef4444' : 'var(--primary)'}`,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '20px',
          fontSize: '0.98rem',
          color: '#e2e8f0',
          lineHeight: 1.6,
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{ color: isWeak ? '#fca5a5' : '#fed7aa', fontWeight: 600 }}>Why right now: </span>
        {item.reasoning}
      </div>

      {/* Metadata Footprint */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
