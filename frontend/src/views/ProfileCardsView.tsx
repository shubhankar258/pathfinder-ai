import React, { useState } from 'react';
import { LearnerProfile, LearningFormat } from '../types';
import { Clock, BookOpen, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProfileCardsViewProps {
  initialProfile: Partial<LearnerProfile>;
  missingFields: string[];
  onSubmit: (completedProfile: LearnerProfile) => void;
  isLoading: boolean;
}

export const ProfileCardsView: React.FC<ProfileCardsViewProps> = ({
  initialProfile,
  missingFields,
  onSubmit,
  isLoading,
}) => {
  const [weeklyHours, setWeeklyHours] = useState<number>(initialProfile.weekly_hours || 8);
  const [learningFormat, setLearningFormat] = useState<LearningFormat>(
    initialProfile.learning_format || 'hands_on'
  );
  const [interestDomain, setInterestDomain] = useState<string>(
    initialProfile.interest_domain || 'NLP'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProfile: LearnerProfile = {
      user_id: initialProfile.user_id || 'learner_' + Date.now(),
      goal_raw: initialProfile.goal_raw || '',
      target_role: initialProfile.target_role || 'Machine Learning Engineer',
      target_skill: initialProfile.target_skill || 'ml_engineer_target',
      timeline_weeks: initialProfile.timeline_weeks || 24,
      weekly_hours: weeklyHours,
      experience_level: initialProfile.experience_level || 'Basic Python',
      learner_level: initialProfile.learner_level || 1,
      learning_format: learningFormat,
      interest_domain: interestDomain,
      skill_confidence: initialProfile.skill_confidence || {},
    };
    onSubmit(finalProfile);
  };

  const showWeekly = missingFields.includes('weekly_hours') || initialProfile.weekly_hours === null;
  const showFormat = missingFields.includes('learning_format') || initialProfile.learning_format === null;
  const showInterest = missingFields.includes('interest_domain') || initialProfile.interest_domain === null;

  return (
    <div style={{ maxWidth: '780px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>
          Personalize Pacing & Track
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Goal mapped to <strong style={{ color: '#fed7aa' }}>{initialProfile.target_role || 'Machine Learning'}</strong>. Select preferences for fields that were not specified in your prompt.
        </p>
      </div>

      {/* Extracted Fields Summary */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 22px',
          marginBottom: '28px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          background: 'rgba(249, 115, 22, 0.09)',
          border: '1px solid rgba(249, 115, 22, 0.35)',
        }}
      >
        <CheckCircle2 color="#f97316" size={24} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Structured NLU Extraction
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Target Role: <span style={{ color: '#fed7aa' }}>{initialProfile.target_role || 'ML Engineer'}</span> • Timeline: <span style={{ color: '#fed7aa' }}>{initialProfile.timeline_weeks || 24} weeks</span> • Experience: <span style={{ color: '#fed7aa' }}>{initialProfile.experience_level || 'Basic Python'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Missing Field 1: Weekly Hours */}
        {showWeekly && (
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Clock size={20} color="#f97316" />
              <h3 style={{ fontSize: '1.15rem' }}>Weekly Study Commitment</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[4, 6, 8, 12].map((hrs) => {
                const isActive = weeklyHours === hrs;
                return (
                  <button
                    type="button"
                    key={hrs}
                    onClick={() => setWeeklyHours(hrs)}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: isActive ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-surface-2)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      textAlign: 'center',
                      boxShadow: isActive ? '0 0 16px rgba(249, 115, 22, 0.35)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)' }}>{hrs} hrs</div>
                    <div style={{ fontSize: '0.75rem', color: isActive ? '#fed7aa' : 'var(--text-muted)' }}>
                      {hrs === 8 ? 'Recommended' : 'per week'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Field 2: Learning Format */}
        {showFormat && (
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BookOpen size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem' }}>Preferred Learning Format</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { id: 'hands_on', label: 'Hands-on Projects', desc: 'Code labs, notebooks & active building' },
                { id: 'interactive', label: 'Interactive Challenges', desc: 'Step-by-step quizzes & exercises' },
                { id: 'video', label: 'Video Lectures', desc: 'Visual deep dives & conceptual overviews' },
                { id: 'reading', label: 'Documentation & Guides', desc: 'In-depth reference books & papers' },
              ].map((fmt) => {
                const isActive = learningFormat === fmt.id;
                return (
                  <button
                    type="button"
                    key={fmt.id}
                    onClick={() => setLearningFormat(fmt.id as LearningFormat)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--success)' : 'var(--border-subtle)'}`,
                      background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-2)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      textAlign: 'left',
                      boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: isActive ? '#34d399' : 'var(--text-primary)', marginBottom: '4px', fontSize: '0.98rem' }}>
                      {fmt.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Field 3: Interest Domain */}
        {showInterest && (
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Compass size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.15rem' }}>Specialization Interest Track</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { id: 'NLP', label: 'Natural Language Processing', short: 'NLP & LLMs' },
                { id: 'Computer Vision', label: 'Computer Vision', short: 'Vision & CNNs' },
                { id: 'General ML', label: 'General Machine Learning', short: 'MLOps & Systems' },
              ].map((domain) => {
                const isActive = interestDomain === domain.id;
                return (
                  <button
                    type="button"
                    key={domain.id}
                    onClick={() => setInterestDomain(domain.id)}
                    style={{
                      padding: '16px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                      background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-2)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      textAlign: 'center',
                      boxShadow: isActive ? '0 0 16px rgba(245, 158, 11, 0.35)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: isActive ? '#fbbf24' : 'var(--text-primary)', marginBottom: '4px', fontSize: '0.98rem' }}>
                      {domain.short}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{domain.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            id="generate-path-btn"
            disabled={isLoading}
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '14px 40px' }}
          >
            {isLoading ? 'Generating Roadmap...' : 'Generate My Learning Path'} <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
