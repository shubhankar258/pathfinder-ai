import React from 'react';
import { RoadmapItem } from '../types';
import { CheckCircle2, Lock, Play, AlertTriangle, ChevronRight, Info, Clock } from 'lucide-react';

interface RoadmapGraphProps {
  roadmap: RoadmapItem[];
  onSelectItem: (item: RoadmapItem) => void;
  onToggleStatus?: (item: RoadmapItem) => void;
}

const PHASE_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Phase 1: Programming & Core Foundations', subtitle: 'Python syntax, OOP architecture, and data wrangling' },
  2: { title: 'Phase 2: Mathematical Foundations & Statistics', subtitle: 'Probability distributions, Bayes theorem, and hypothesis testing' },
  3: { title: 'Phase 3: Core Machine Learning & Validation', subtitle: 'Supervised modeling, cross-validation, and performance metrics' },
  4: { title: 'Phase 4: Applied ML Portfolio Project', subtitle: 'End-to-end problem formulation, pipeline build, and documentation' },
  5: { title: 'Phase 5: Domain Specialization Track', subtitle: 'Specialized deep learning and domain architectures (NLP / CV)' },
  6: { title: 'Phase 6: Production Engineering & Capstone', subtitle: 'Deployed API services, testing, and full capstone synthesis' },
};

export const RoadmapGraph: React.FC<RoadmapGraphProps> = ({
  roadmap,
  onSelectItem,
}) => {
  const phases = Array.from(new Set(roadmap.map((item) => item.phase))).sort((a, b) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {phases.map((phase) => {
        const phaseItems = roadmap.filter((item) => item.phase === phase);
        const phaseInfo = PHASE_TITLES[phase] || { title: `Phase ${phase}`, subtitle: 'Curriculum modules' };
        const phaseCompleted = phaseItems.filter((i) => i.state === 'COMPLETED').length;

        return (
          <div
            key={phase}
            className="glass-panel"
            style={{
              padding: '28px 32px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* Phase Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '22px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: phaseCompleted === phaseItems.length ? '#10b981' : 'var(--primary)',
                      boxShadow: `0 0 12px ${phaseCompleted === phaseItems.length ? 'rgba(16, 185, 129, 0.6)' : 'var(--primary-glow)'}`,
                    }}
                  />
                  <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>{phaseInfo.title}</h3>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {phaseInfo.subtitle}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                  {phaseCompleted} / {phaseItems.length} completed
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {phaseItems.reduce((acc, i) => acc + i.estimated_hours, 0)}h total
                </span>
              </div>
            </div>

            {/* Frosted Glass Node Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {phaseItems.map((item) => {
                const isWeak = item.state === 'WEAK' || item.confidence_tier === 'WEAK';
                const isCompleted = item.state === 'COMPLETED';
                const isLocked = item.state === 'LOCKED';
                const isAvailable = item.state === 'AVAILABLE' || item.state === 'IN_PROGRESS';

                return (
                  <div
                    key={item.skill_id}
                    onClick={() => onSelectItem(item)}
                    className="glass-card-interactive"
                    style={{
                      background: isWeak
                        ? 'rgba(239, 68, 68, 0.12)'
                        : isCompleted
                        ? 'rgba(16, 185, 129, 0.1)'
                        : isAvailable
                        ? 'rgba(249, 115, 22, 0.12)'
                        : 'rgba(18, 24, 38, 0.55)',
                      border: `1.5px solid ${
                        isWeak
                          ? 'rgba(239, 68, 68, 0.5)'
                          : isCompleted
                          ? 'rgba(16, 185, 129, 0.45)'
                          : isAvailable
                          ? 'rgba(249, 115, 22, 0.5)'
                          : 'rgba(255, 255, 255, 0.09)'
                      }`,
                      padding: '22px',
                      cursor: 'pointer',
                      opacity: isLocked ? 0.55 : 1,
                      boxShadow: isAvailable
                        ? '0 8px 24px rgba(249, 115, 22, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                        : '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    {/* Top status bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span className={`badge badge-${item.state.toLowerCase()}`}>
                        {isCompleted && <CheckCircle2 size={12} />}
                        {isLocked && <Lock size={12} />}
                        {isAvailable && <Play size={12} />}
                        {isWeak && <AlertTriangle size={12} />}
                        {item.state}
                      </span>

                      {item.is_refresher && (
                        <span className="badge badge-refresher">Refresher</span>
                      )}
                    </div>

                    {/* Skill / Resource Name */}
                    <div style={{ fontWeight: 700, fontSize: '1.12rem', color: 'var(--text-primary)', marginBottom: '5px', letterSpacing: '-0.01em' }}>
                      {item.skill_name}
                    </div>

                    {item.recommended_resource && (
                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: '#fed7aa',
                          marginBottom: '16px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.recommended_resource.title}
                      </div>
                    )}

                    {item.covered_by_resource_id && (
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Covered by earlier module
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#f97316" />
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{item.estimated_hours}h</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fb923c', fontWeight: 500 }}>
                        <Info size={14} />
                        <span>Inspect Fit</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
