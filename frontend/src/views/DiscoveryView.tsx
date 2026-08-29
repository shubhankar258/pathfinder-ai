import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers, Zap, ShieldCheck, Terminal, Cpu } from 'lucide-react';

interface DiscoveryViewProps {
  onGoalSubmit: (goal: string) => void;
  isLoading: boolean;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onGoalSubmit,
  isLoading,
}) => {
  const [goalText, setGoalText] = useState('');

  const priyaGoal =
    'I want to become a Machine Learning Engineer in six months. I know basic Python.';

  const handlePriyaClick = () => {
    setGoalText(priyaGoal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalText.trim()) {
      onGoalSubmit(goalText.trim());
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '48px auto', padding: '0 24px' }}>
      {/* Hero Badge */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span
          className="badge"
          style={{
            background: 'rgba(249, 115, 22, 0.15)',
            color: '#fdba74',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            padding: '6px 16px',
            fontSize: '0.82rem',
            gap: '8px',
          }}
        >
          <Cpu size={15} color="#f97316" /> Prerequisite-Aware AI Curriculum Engine
        </span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontSize: '3.2rem',
          textAlign: 'center',
          lineHeight: 1.15,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #ffffff 30%, #fed7aa 70%, #f97316 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        What do you want to learn next?
      </h1>

      <p
        style={{
          fontSize: '1.15rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 36px',
        }}
      >
        Convert your goal into an explainable, deterministic learning roadmap that adapts dynamically to your confidence and checkpoint performance.
      </p>

      {/* Goal Input Glass Panel */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel"
        style={{
          padding: '24px 28px',
          marginBottom: '36px',
          border: '1.5px solid rgba(249, 115, 22, 0.3)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Terminal size={16} color="#f97316" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Natural Language Goal Input
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <textarea
            id="goal-input"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. I want to become a Machine Learning Engineer in six months. I know basic Python."
            rows={4}
            style={{
              width: '100%',
              background: 'rgba(9, 11, 16, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.55,
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 18px rgba(249, 115, 22, 0.35)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Quick Persona:
            </span>
            <button
              type="button"
              id="priya-demo-btn"
              onClick={handlePriyaClick}
              className="btn-secondary"
              style={{
                fontSize: '0.85rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                borderColor: 'rgba(249, 115, 22, 0.5)',
                background: 'rgba(249, 115, 22, 0.15)',
                color: '#fed7aa',
              }}
            >
              <Sparkles size={14} color="#f97316" /> Priya (ML Engineer in 6 Mo)
            </button>
          </div>

          <button
            type="submit"
            id="build-path-btn"
            disabled={isLoading || !goalText.trim()}
            className="btn-primary"
            style={{
              fontSize: '1rem',
              padding: '12px 28px',
              opacity: !goalText.trim() || isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <>Parsing Goal NLU...</>
            ) : (
              <>
                Build My Path <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bento Grid Feature Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
        }}
      >
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(249, 115, 22, 0.16)', borderRadius: '10px', color: '#f97316' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Deterministic Graph Logic</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Sequencing is driven by strict NetworkX topological sort. Prerequisite orders are never hallucinated by LLMs.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#34d399' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Live Adaptive Triggers</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Struggling on a checkpoint? The engine automatically force-sets WEAK status and inserts targeted refresher resources.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.16)', borderRadius: '10px', color: '#f59e0b' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>5-Factor Recommender</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Personalized ranking across Difficulty, Format, 2-Week Milestone capacity TimeFit, Topics, and Curated Quality.
          </p>
        </div>
      </div>
    </div>
  );
};
