import React from 'react';
import { RoadmapItem } from '../types';
import { Sparkles, ArrowRight, Clock, Award, AlertTriangle, CheckCircle, BookOpen, ExternalLink, Zap } from 'lucide-react';

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
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', background: '#ffffff' }}>
        <CheckCircle size={44} color="#059669" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.4rem', color: '#0f172a' }}>All Curriculum Milestones Completed!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>You have successfully completed all prerequisite and target skills in your roadmap.</p>
      </div>
    );
  }

  const isWeak = item.state === 'WEAK' || item.confidence_tier === 'WEAK';
  const hasQuiz = ['statistics_probability', 'network_fundamentals', 'web_security', 'javascript_typescript', 'docker_containers'].includes(item.skill_id);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden',
        border: isWeak ? '1.5px solid #fca5a5' : '1px solid #cbd5e1',
        background: isWeak ? '#fff5f5' : '#ffffff',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span
              className="badge"
              style={{
                background: isWeak ? '#fef2f2' : '#eff6ff',
                color: isWeak ? '#b91c1c' : '#1d4ed8',
                border: isWeak ? '1px solid #fecaca' : '1px solid #bfdbfe',
                padding: '5px 12px',
                fontSize: '0.78rem',
              }}
            >
              {isWeak ? <AlertTriangle size={14} /> : <Zap size={14} />}
              {isWeak ? 'Priority Refresher Module' : 'Next Best Action'}
            </span>

            <span className="badge badge-available">Phase {item.phase}</span>
            <span className="badge badge-locked">
              Mode: {item.learning_mode}
            </span>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {item.recommended_resource ? item.recommended_resource.title : item.skill_name}
          </h2>

          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Skill Target: <strong style={{ color: '#0f172a' }}>{item.skill_name}</strong>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {item.recommended_resource?.url && (
            <a
              href={item.recommended_resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.92rem',
                borderColor: '#cbd5e1',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
              }}
              title="Open verified official course / documentation in a new tab"
            >
              <ExternalLink size={16} /> Open Course / Resource ↗
            </a>
          )}

          {hasQuiz && onTakeQuiz && (
            <button
              id="take-checkpoint-quiz-btn"
              type="button"
              onClick={() => onTakeQuiz(item)}
              className="btn-secondary"
              style={{
                borderColor: '#fde68a',
                background: '#fffbeb',
                color: '#b45309',
                padding: '10px 18px',
                fontSize: '0.92rem',
              }}
            >
              <Award size={16} color="#d97706" /> Checkpoint Quiz
            </button>
          )}

          <button
            id="start-learning-btn"
            type="button"
            onClick={() => onStartLearning(item)}
            className="btn-primary"
            style={{
              padding: '10px 22px',
              background: isWeak ? '#dc2626' : 'var(--primary)',
            }}
          >
            {item.state === 'COMPLETED' ? 'Mark In Progress' : isWeak ? 'Start Refresher' : 'Complete Module'}{' '}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Explanation Quote Block */}
      <div
        style={{
          background: isWeak ? '#fff1f2' : '#f8fafc',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          borderLeft: `4px solid ${isWeak ? '#dc2626' : '#2563eb'}`,
          borderTop: '1px solid #e2e8f0',
          borderRight: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '18px',
          fontSize: '0.95rem',
          color: '#334155',
          lineHeight: 1.55,
        }}
      >
        <span style={{ color: isWeak ? '#991b1b' : '#1d4ed8', fontWeight: 600 }}>Why right now: </span>
        {item.reasoning}
      </div>

      {/* Metadata Footprint */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color="#2563eb" />
          <span><strong>{item.estimated_hours} hours</strong> (Paced for 2-week milestone window)</span>
        </div>

        {item.recommended_resource && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={15} color="#059669" />
              <span>Format: <strong>{item.recommended_resource.format}</strong></span>
            </div>
            <div>
              Provider: <strong style={{ color: '#0f172a' }}>{item.recommended_resource.provider || 'Official Documentation'}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
