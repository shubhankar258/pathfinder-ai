import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers, Zap, ShieldCheck, Terminal, Compass } from 'lucide-react';

interface DiscoveryViewProps {
  onGoalSubmit: (goal: string) => void;
  isLoading: boolean;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onGoalSubmit,
  isLoading,
}) => {
  const [goalText, setGoalText] = useState('');

  const demoPresets = [
    {
      id: 'demo-ml',
      label: 'Demo: ML Engineer (6 Mo)',
      goal: 'I want to become a Machine Learning Engineer in six months. I know basic Python.',
    },
    {
      id: 'demo-cyber',
      label: 'Demo: Cybersecurity (12 Mo)',
      goal: 'I want to learn cybersecurity in 12 months.',
    },
    {
      id: 'demo-fullstack',
      label: 'Demo: Full-Stack Dev (6 Mo)',
      goal: 'I want to become a Full-Stack Web Developer in 6 months.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalText.trim()) {
      onGoalSubmit(goalText.trim());
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '40px auto 60px', padding: '0 24px' }}>
      {/* Hero Badge */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <span
          className="badge"
          style={{
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '6px 16px',
            fontSize: '0.82rem',
            gap: '8px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Compass size={15} color="#2563eb" /> Prerequisite-Aware AI Curriculum Engine
        </span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontSize: '2.9rem',
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: '14px',
          color: '#0f172a',
          letterSpacing: '-0.03em',
        }}
      >
        What do you want to learn next?
      </h1>

      <p
        style={{
          fontSize: '1.12rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          maxWidth: '660px',
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}
      >
        Convert your natural-language goal into an explainable, deterministic learning roadmap with real courses, documentation, and dynamic adaptive checkpoints.
      </p>

      {/* Goal Input Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel"
        style={{
          padding: '28px 32px',
          marginBottom: '36px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-md)',
          background: '#ffffff',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Terminal size={16} color="#2563eb" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Natural Language Goal Input
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <textarea
            id="goal-input"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. I want to learn cybersecurity in 12 months, or I want to become a Machine Learning Engineer in six months."
            rows={4}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.6,
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Quick Presets:
            </span>
            {demoPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                id={preset.id}
                onClick={() => setGoalText(preset.goal)}
                className="btn-secondary"
                style={{
                  fontSize: '0.82rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  borderColor: '#cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                }}
              >
                <Sparkles size={13} color="#2563eb" /> {preset.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            id="build-path-btn"
            disabled={isLoading || !goalText.trim()}
            className="btn-primary"
            style={{
              fontSize: '0.98rem',
              padding: '11px 26px',
              opacity: !goalText.trim() || isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <>Parsing Goal NLU...</>
            ) : (
              <>
                Build My Path <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Feature Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Deterministic Graph Logic</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Sequencing is driven by strict NetworkX topological sort. Prerequisite orders are mathematically validated.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '10px', color: '#059669' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Live Adaptive Triggers</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Struggling on a checkpoint? The engine sets WEAK status and injects targeted refresher resources.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ padding: '8px', background: '#fffbeb', borderRadius: '10px', color: '#d97706' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>5-Factor Recommender</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Personalized ranking across Difficulty, Format, 2-Week Sprint Capacity TimeFit, and Verified Quality.
          </p>
        </div>
      </div>
    </div>
  );
};
