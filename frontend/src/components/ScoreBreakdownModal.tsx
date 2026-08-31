import React from 'react';
import { RoadmapItem } from '../types';
import { X, Award, Clock, BookOpen, Compass, Layers, ShieldCheck, ExternalLink } from 'lucide-react';

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
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: '32px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-available">Phase {item.phase}</span>
              <span className="badge badge-locked">
                Mode: {item.learning_mode}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#0f172a', marginBottom: '4px' }}>{item.skill_name}</h2>
            {res && <div style={{ fontSize: '0.94rem', color: '#2563eb', fontWeight: 500 }}>{res.title}</div>}
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Real Resource Link if present */}
        {res?.url && (
          <div style={{ marginBottom: '20px' }}>
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                fontSize: '0.88rem',
                textDecoration: 'none',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <span>Visit Official Resource ({res.provider || 'External'})</span>
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* Reasoning quote */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            marginBottom: '24px',
            borderLeft: '4px solid #2563eb',
            borderTop: '1px solid #e2e8f0',
            borderRight: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
            Deterministic Graph Reason
          </div>
          <div style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.55 }}>
            {item.reasoning}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {item.reason_codes.map((code) => (
              <span
                key={code}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid #bfdbfe',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>5-Factor Recommendation Scoring</h3>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#059669',
                  fontFamily: 'var(--font-mono)',
                  background: '#ecfdf5',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #a7f3d0',
                }}
              >
                {(breakdown.final_score * 100).toFixed(1)}% Match
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ScoreRow
                icon={<Layers size={16} color="#2563eb" />}
                label="Difficulty Fit (Weight 35%)"
                score={breakdown.difficulty_fit}
                note={`Distance metric for resource level ${item.recommended_resource?.difficulty_level || 1}`}
              />
              <ScoreRow
                icon={<BookOpen size={16} color="#059669" />}
                label="Format Fit (Weight 25%)"
                score={breakdown.format_fit}
                note={`Format: ${item.recommended_resource?.format}`}
              />
              <ScoreRow
                icon={<Clock size={16} color="#d97706" />}
                label="Time Fit (Weight 20%)"
                score={breakdown.time_fit}
                note={`${item.estimated_hours}h resource for 2-week milestone window`}
              />
              <ScoreRow
                icon={<Compass size={16} color="#0284c7" />}
                label="Interest Alignment (Weight 10%)"
                score={breakdown.interest_alignment}
                note={`Topics: ${item.recommended_resource?.topics.join(', ') || 'general'}`}
              />
              <ScoreRow
                icon={<ShieldCheck size={16} color="#475569" />}
                label="Curated Quality (Weight 10%)"
                score={breakdown.quality}
                note={`Quality score: ${breakdown.quality}`}
              />
            </div>
          </div>
        ) : (
          item.covered_by_resource_id && (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', color: 'var(--text-secondary)', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
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
  <div
    style={{
      background: '#f8fafc',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
        {icon}
        <span>{label}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
        {(score * 100).toFixed(0)}%
      </span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{note}</span>
      <div style={{ width: '100px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${score * 100}%`, height: '100%', background: '#2563eb' }} />
      </div>
    </div>
  </div>
);
