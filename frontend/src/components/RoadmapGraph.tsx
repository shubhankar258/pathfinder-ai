import React from 'react';
import { RoadmapItem } from '../types';
import { CheckCircle2, Lock, Play, AlertTriangle, ChevronRight, Info, Clock, ExternalLink, BookOpen } from 'lucide-react';

interface RoadmapGraphProps {
  roadmap: RoadmapItem[];
  onSelectItem: (item: RoadmapItem) => void;
  onToggleStatus?: (item: RoadmapItem) => void;
}

export const RoadmapGraph: React.FC<RoadmapGraphProps> = ({
  roadmap,
  onSelectItem,
}) => {
  const phases = Array.from(new Set(roadmap.map((item) => item.phase))).sort((a, b) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {phases.map((phase) => {
        const phaseItems = roadmap.filter((item) => item.phase === phase);
        const phaseCompleted = phaseItems.filter((i) => i.state === 'COMPLETED').length;

        return (
          <div
            key={phase}
            className="glass-panel"
            style={{
              padding: '28px 32px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Phase Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: phaseCompleted === phaseItems.length ? '#059669' : '#2563eb',
                    }}
                  />
                  <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>Phase {phase} Milestones</h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {phaseCompleted === phaseItems.length ? 'All milestone modules completed' : `${phaseItems.length - phaseCompleted} modules remaining`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="badge" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                  {phaseCompleted} / {phaseItems.length} completed
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
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
                    className="glass-card-interactive"
                    style={{
                      background: isWeak
                        ? '#fff5f5'
                        : isCompleted
                        ? '#f0fdf4'
                        : isAvailable
                        ? '#eff6ff'
                        : '#ffffff',
                      border: `1px solid ${
                        isWeak
                          ? '#fca5a5'
                          : isCompleted
                          ? '#86efac'
                          : isAvailable
                          ? '#bfdbfe'
                          : '#e2e8f0'
                      }`,
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      opacity: isLocked ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '190px',
                    }}
                  >
                    <div>
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

                      {/* Skill Name */}
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                        {item.skill_name}
                      </div>

                      {/* Recommended Resource Title */}
                      {item.recommended_resource && (
                        <div
                          style={{
                            fontSize: '0.84rem',
                            color: '#475569',
                            marginBottom: '12px',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={item.recommended_resource.title}
                        >
                          {item.recommended_resource.title}
                        </div>
                      )}

                      {item.covered_by_resource_id && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Covered in comprehensive course bundle
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '12px',
                        marginTop: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#64748b" />
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{item.estimated_hours}h</span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {item.recommended_resource?.url && (
                          <a
                            href={item.recommended_resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#2563eb',
                              textDecoration: 'none',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#eff6ff',
                            }}
                            title="Open external course"
                          >
                            <span>Open</span> <ExternalLink size={12} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectItem(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#475569',
                            fontWeight: 500,
                            fontSize: '0.8rem',
                          }}
                        >
                          <Info size={13} />
                          <span>Fit</span>
                          <ChevronRight size={13} />
                        </button>
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
