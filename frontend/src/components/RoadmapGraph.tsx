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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {phases.map((phase) => {
        const phaseItems = roadmap.filter((item) => item.phase === phase);
        const phaseInfo = PHASE_TITLES[phase] || { title: `Phase ${phase}`, subtitle: 'Curriculum modules' };
        const phaseCompleted = phaseItems.filter((i) => i.state === 'COMPLETED').length;

        return (
          <div key={phase} className="glass-panel" style={{ padding: '24px 28px' }}>
            {/* Phase Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: phaseCompleted === phaseItems.length ? '#10b981' : 'var(--primary)',
                      boxShadow: `0 0 10px ${phaseCompleted === phaseItems.length ? 'rgba(16, 185, 129, 0.5)' : 'var(--primary-glow)'}`,
                    }}
                  />
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>{phaseInfo.title}</h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {phaseInfo.subtitle}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)' }}>
                  {phaseCompleted} / {phaseItems.length} completed
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {phaseItems.reduce((acc, i) => acc + i.estimated_hours, 0)}h total
                </span>
              </div>
            </div>

            {/* Node Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
              {phaseItems.map((item) => {
                const isWeak = item.state === 'WEAK' || item.confidence_tier === 'WEAK';
                const isCompleted = item.state === 'COMPLETED';
                const isLocked = item.state === 'LOCKED';
                const isAvailable = item.state === 'AVAILABLE' || item.state === 'IN_PROGRESS';

                return (
                  <div
                    key={item.skill_id}
                    onClick={() => onSelectItem(item)}
                    style={{
                      background: isWeak
                        ? 'rgba(239, 68, 68, 0.08)'
                        : isCompleted
                        ? 'rgba(16, 185, 129, 0.07)'
                        : isAvailable
                        ? 'rgba(249, 115, 22, 0.08)'
                        : 'var(--bg-surface-2)',
                      border: `1.5px solid ${
                        isWeak
                          ? 'rgba(239, 68, 68, 0.45)'
                          : isCompleted
                          ? 'rgba(16, 185, 129, 0.4)'
                          : isAvailable
                          ? 'rgba(249, 115, 22, 0.45)'
                          : 'rgba(255, 255, 255, 0.06)'
                      }`,
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isLocked ? 0.55 : 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      if (isAvailable) e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      if (isAvailable) e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.45)';
                    }}
                  >
                    {/* Top status bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
                    <div style={{ fontWeight: 700, fontSize: '1.08rem', color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                      {item.skill_name}
                    </div>

                    {item.recommended_resource && (
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#fed7aa',
                          marginBottom: '14px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.recommended_resource.title}
                      </div>
                    )}

                    {item.covered_by_resource_id && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Covered by earlier module
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
