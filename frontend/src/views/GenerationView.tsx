import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Cpu, Terminal } from 'lucide-react';

interface GenerationViewProps {
  onComplete: () => void;
}

const PIPELINE_STEPS = [
  { id: 1, text: 'Parsing Goal NLU & Extracting Domain Objectives', duration: 350 },
  { id: 2, text: 'Traversing NetworkX DAG & Prerequisite Ancestors', duration: 400 },
  { id: 3, text: 'Resolving Tiered Confidence State Machine', duration: 350 },
  { id: 4, text: 'Executing 5-Factor Scoring & 2-Week Milestone TimeFit', duration: 400 },
  { id: 5, text: 'Assembling Deduplicated Path & Next Best Action', duration: 350 },
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
        }, 400);
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
    <div style={{ maxWidth: '680px', margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      {/* Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#2563eb',
        }}
        className="animate-pulse-subtle"
      >
        <Cpu size={32} color="#2563eb" />
      </div>

      <h2 style={{ fontSize: '2.1rem', marginBottom: '10px', color: '#0f172a' }}>Synthesizing Roadmap</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '1rem' }}>
        Deterministic NetworkX graph traversal & 5-factor resource optimization in progress...
      </p>

      {/* Progress Bar */}
      <div style={{ maxWidth: '380px', margin: '0 auto 28px' }}>
        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: '#2563eb',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Terminal Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          textAlign: 'left',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          <Terminal size={15} color="#2563eb" />
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
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
                gap: '12px',
                padding: '10px 0',
                borderBottom: step.id < PIPELINE_STEPS.length ? '1px solid #f8fafc' : 'none',
                opacity: isDone || isCurrent ? 1 : 0.35,
                transition: 'all 0.2s ease',
              }}
            >
              {isDone ? (
                <CheckCircle2 size={18} color="#059669" />
              ) : isCurrent ? (
                <Loader2 size={18} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '1.5px solid #cbd5e1',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: '0.9rem',
                  fontFamily: isCurrent || isDone ? 'var(--font-mono)' : 'inherit',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isDone ? '#0f172a' : isCurrent ? '#2563eb' : '#64748b',
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
