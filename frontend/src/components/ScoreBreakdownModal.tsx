import React from 'react';
import { RoadmapItem } from '../types';
import { X, Award, Clock, BookOpen, Compass, Layers, ShieldCheck } from 'lucide-react';

interface ScoreBreakdownModalProps {
  item: RoadmapItem | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const breakdown = item.score_breakdown;
  const res = item.recommended_resource;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated"
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: '32px',
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-available">Phase {item.phase}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                Mode: {item.learning_mode}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>{item.skill_name}</h2>
            {res && <div style={{ fontSize: '0.95rem', color: '#fed7aa', marginTop: '4px' }}>{res.title}</div>}
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Reasoning quote */}
        <div
          style={{
            background: 'rgba(9, 11, 16, 0.75)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            marginBottom: '26px',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
            Deterministic Graph Reason
          </div>
          <div style={{ fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
            {item.reasoning}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {item.reason_codes.map((code) => (
              <span
                key={code}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 9px',
                  borderRadius: '5px',
                  background: 'rgba(249, 115, 22, 0.16)',
                  color: '#fed7aa',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                }}
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* 5-Factor Score Breakdown */}
        {breakdown ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem' }}>5-Factor Recommendation Scoring</h3>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#10b981',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(16, 185, 129, 0.14)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--success-border)',
                }}
              >
                {(breakdown.final_score * 100).toFixed(1)}% Match
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ScoreRow
                icon={<Layers size={16} color="#f97316" />}
                label="Difficulty Fit (Weight 35%)"
                score={breakdown.difficulty_fit}
                note={`Distance metric for resource level ${item.recommended_resource?.difficulty_level || 1}`}
              />
              <ScoreRow
                icon={<BookOpen size={16} color="#10b981" />}
                label="Format Fit (Weight 25%)"
                score={breakdown.format_fit}
                note={`Format: ${item.recommended_resource?.format}`}
              />
              <ScoreRow
                icon={<Clock size={16} color="#f59e0b" />}
                label="Time Fit (Weight 20%)"
                score={breakdown.time_fit}
                note={`${item.estimated_hours}h resource for 2-week milestone window`}
              />
              <ScoreRow
                icon={<Compass size={16} color="#fb923c" />}
                label="Interest Alignment (Weight 10%)"
                score={breakdown.interest_alignment}
                note={`Topics: ${item.recommended_resource?.topics.join(', ') || 'general'}`}
              />
              <ScoreRow
                icon={<ShieldCheck size={16} color="#fdba74" />}
                label="Curated Quality (Weight 10%)"
                score={breakdown.quality}
                note={`Quality score: ${breakdown.quality}`}
              />
            </div>
          </div>
        ) : (
          item.covered_by_resource_id && (
            <div style={{ padding: '18px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', color: 'var(--text-secondary)' }}>
              Covered by earlier module (<strong>{item.covered_by_resource_id}</strong>). Deduplicated across the roadmap to avoid inflated hours.
            </div>
          )
        )}
      </div>
    </div>
  );
};

const ScoreRow: React.FC<{ icon: React.ReactNode; label: string; score: number; note: string }> = ({
  icon,
  label,
  score,
  note,
}) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '0.92rem', fontWeight: 600 }}>
        {icon}
        <span>{label}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>
        {(score * 100).toFixed(0)}%
      </span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{note}</span>
      <div style={{ width: '110px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${score * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #f59e0b)' }} />
      </div>
    </div>
  </div>
);
