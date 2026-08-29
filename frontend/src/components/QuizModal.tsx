import React, { useState, useEffect } from 'react';
import { QuizData } from '../types';
import { api } from '../services/api';
import { X, Award, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface QuizModalProps {
  skillId: string;
  onClose: () => void;
  onQuizCompleted: (score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ skillId, onClose, onQuizCompleted }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getQuiz(skillId)
      .then((data) => {
        setQuizData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [skillId]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handlePriyaQuickFail = () => {
    if (!quizData) return;
    const answers: Record<string, number> = {};
    quizData.questions.forEach((q, idx) => {
      // 1 correct, 2 wrong -> 1/3 = 33%
      answers[q.id] = idx === 0 ? q.correct_index : (q.correct_index === 0 ? 1 : 0);
    });
    setSelectedAnswers(answers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData) return;

    setIsSubmitting(true);
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_index) {
        correct++;
      }
    });

    const score = correct / quizData.questions.length;
    setTimeout(() => {
      onQuizCompleted(score);
      onClose();
    }, 400);
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 14, 0.7)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div className="glass-panel" style={{ padding: '32px' }}>Loading Assessment Questions...</div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 14, 0.7)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '420px' }}>
          <h3>Quiz Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '14px 0' }}>{error || 'No checkpoint quiz registered for this skill.'}</p>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount === quizData.questions.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 14, 0.72)',
        backdropFilter: 'blur(30px) saturate(190%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
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
          maxWidth: '760px',
          width: '100%',
          padding: '36px',
          background: 'linear-gradient(135deg, rgba(22, 28, 44, 0.9) 0%, rgba(14, 18, 28, 0.88) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={20} color="#f59e0b" />
              <span className="badge badge-refresher">
                Hand-Authored Skill Checkpoint
              </span>
            </div>
            <h2 style={{ fontSize: '1.7rem', color: '#ffffff' }}>{quizData.skill_name} Verification</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Pass threshold: ≥ 50% to verify. Scores &lt; 50% trigger an automatic adaptive refresher.
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Demo Quick-Fill Helper */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            id="priya-fail-quiz-btn"
            onClick={handlePriyaQuickFail}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.9rem',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              background: 'rgba(239, 68, 68, 0.14)',
              color: '#fca5a5',
              padding: '12px 18px',
            }}
          >
            <Sparkles size={16} color="#ef4444" /> Quick-Fill Priya's Checkpoint (1/3 Correct = 33% Failure)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {quizData.questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                background: 'rgba(10, 14, 24, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '1.02rem', marginBottom: '16px', color: '#ffffff' }}>
                Q{idx + 1}. {q.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.09)'}`,
                        background: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        fontSize: '0.94rem',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={isSelected}
                        onChange={() => handleSelect(q.id, optIdx)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {answeredCount} of {quizData.questions.length} answered
            </span>

            <button
              type="submit"
              id="submit-quiz-btn"
              disabled={!isComplete || isSubmitting}
              className="btn-primary"
              style={{ padding: '13px 32px', opacity: isComplete ? 1 : 0.5 }}
            >
              {isSubmitting ? 'Evaluating Score...' : 'Submit Checkpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
