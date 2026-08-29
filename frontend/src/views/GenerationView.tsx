import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Cpu, Terminal } from 'lucide-react';

interface GenerationViewProps {
  onComplete: () => void;
}

const PIPELINE_STEPS = [
  { id: 1, text: 'Parsing Goal NLU & Extracting Domain Objectives', duration: 400 },
  { id: 2, text: 'Traversing NetworkX DAG & Prerequisite Ancestors', duration: 500 },
  { id: 3, text: 'Resolving Tiered Confidence State Machine', duration: 450 },
  { id: 4, text: 'Executing 5-Factor Scoring & 2-Week Milestone TimeFit', duration: 500 },
  { id: 5, text: 'Assembling Deduplicated Path & Next Best Action', duration: 400 },
];

export const GenerationView: React.FC<GenerationViewProps> = ({ onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    let timer: any;

    const runStep = (stepIdx: number) => {
      if (stepIdx > PIPELINE_STEPS.length) {
        timer = setTimeout(() => {
          onComplete();
        }, 500);
        return;
      }

      setCurrentStep(stepIdx);
      const step = PIPELINE_STEPS[stepIdx - 1];

      timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
        runStep(stepIdx + 1);
      }, step.duration);
    };

    runStep(1);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round((completedSteps.length / PIPELINE_STEPS.length) * 100));

  return (
    <div style={{ maxWidth: '680px', margin: '70px auto', padding: '0 24px', textAlign: 'center' }}>
      {/* Glowing Pulsing Icon */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(245, 158, 11, 0.25))',
          border: '1.5px solid rgba(249, 115, 22, 0.45)',
          boxShadow: '0 0 32px var(--primary-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#f97316',
        }}
        className="animate-pulse-subtle"
      >
        <Cpu size={36} color="#fb923c" />
      </div>

      <h2 style={{ fontSize: '2.3rem', marginBottom: '12px' }}>Synthesizing Roadmap</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem' }}>
        Deterministic NetworkX graph traversal & 5-factor resource optimization in progress...
      </p>

      {/* Progress Bar */}
      <div style={{ maxWidth: '420px', margin: '0 auto 28px' }}>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f97316, #f59e0b)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* HUD Terminal Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          textAlign: 'left',
          background: 'rgba(9, 11, 16, 0.88)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '10px' }}>
          <Terminal size={16} color="#f97316" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            PATHFINDER_PIPELINE_EXECUTION
          </span>
        </div>

        {PIPELINE_STEPS.map((step) => {
          const isDone = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id && !isDone;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '11px 0',
                borderBottom: step.id < PIPELINE_STEPS.length ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                opacity: isDone || isCurrent ? 1 : 0.3,
                transition: 'all 0.25s ease',
              }}
            >
              {isDone ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : isCurrent ? (
                <Loader2 size={20} color="#fb923c" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--text-muted)',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: '0.92rem',
                  fontFamily: isCurrent || isDone ? 'var(--font-mono)' : 'inherit',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isDone ? 'var(--text-primary)' : isCurrent ? '#fed7aa' : 'var(--text-muted)',
                }}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
