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
  const getDomainTracks = () => {
    const role = (initialProfile.target_role || '').toLowerCase();
    if (role.includes('cyber') || role.includes('security')) {
      return [
        { id: 'Ethical Hacking & Pen Testing', label: 'Ethical Hacking & Penetration Testing', short: 'Ethical Hacking' },
        { id: 'SOC & Threat Analysis', label: 'Security Operations & Incident Defense', short: 'SOC & Blue Team' },
        { id: 'Cloud Security', label: 'Zero Trust & Cloud Infrastructure Security', short: 'Cloud Security' },
      ];
    }
    if (role.includes('full') || role.includes('web') || role.includes('frontend') || role.includes('backend')) {
      return [
        { id: 'Frontend & UI/UX', label: 'Modern React & Component Engineering', short: 'Frontend & UI/UX' },
        { id: 'Backend & Microservices', label: 'REST APIs, Databases & System Design', short: 'Backend & APIs' },
        { id: 'Full-Stack Systems', label: 'End-to-End Web Architecture & DevOps', short: 'Full-Stack Systems' },
      ];
    }
    if (role.includes('devops') || role.includes('cloud')) {
      return [
        { id: 'Kubernetes & Platform Eng', label: 'Kubernetes Cluster & Cloud Native', short: 'Kubernetes & Cloud' },
        { id: 'CI/CD & GitOps', label: 'Automated CI/CD & Infrastructure as Code', short: 'CI/CD & Terraform' },
        { id: 'Cloud Architecture', label: 'AWS/GCP Scalable Solutions Architecture', short: 'Cloud Solutions' },
      ];
    }
    return [
      { id: 'NLP', label: 'Natural Language Processing', short: 'NLP & LLMs' },
      { id: 'Computer Vision', label: 'Computer Vision', short: 'Vision & CNNs' },
      { id: 'General ML', label: 'General Machine Learning', short: 'MLOps & Systems' },
    ];
  };

  const domainTracks = getDomainTracks();
  const [interestDomain, setInterestDomain] = useState<string>(
    initialProfile.interest_domain || domainTracks[0].id
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
      experience_level: initialProfile.experience_level || 'Beginner',
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
    <div style={{ maxWidth: '820px', margin: '36px auto 60px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#0f172a' }}>
          Personalize Pacing & Track
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Goal mapped to <strong style={{ color: '#0f172a' }}>{initialProfile.target_role || 'Specialist Track'}</strong>. Tailor your learning schedule and specialization track.
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
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
        }}
      >
        <CheckCircle2 color="#2563eb" size={22} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.78rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Structured NLU Extraction
          </div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.94rem' }}>
            Target: <span style={{ color: '#2563eb' }}>{initialProfile.target_role || 'ML Engineer'}</span> • Timeline: <span style={{ color: '#2563eb' }}>{initialProfile.timeline_weeks || 24} weeks</span> • Level: <span style={{ color: '#2563eb' }}>{initialProfile.experience_level || 'Beginner'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Missing Field 1: Weekly Hours */}
        {showWeekly && (
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Clock size={19} color="#2563eb" />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Weekly Study Commitment</h3>
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
                      border: `1.5px solid ${isActive ? '#2563eb' : '#e2e8f0'}`,
                      background: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? '#1d4ed8' : '#334155',
                      fontWeight: 600,
                      textAlign: 'center',
                      boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'var(--shadow-xs)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)' }}>{hrs} hrs</div>
                    <div style={{ fontSize: '0.74rem', color: isActive ? '#2563eb' : 'var(--text-muted)' }}>
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
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BookOpen size={19} color="#059669" />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Preferred Learning Format</h3>
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
                      border: `1.5px solid ${isActive ? '#059669' : '#e2e8f0'}`,
                      background: isActive ? '#ecfdf5' : '#ffffff',
                      color: isActive ? '#065f46' : '#334155',
                      textAlign: 'left',
                      boxShadow: isActive ? '0 2px 8px rgba(5, 150, 105, 0.15)' : 'var(--shadow-xs)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: isActive ? '#047857' : '#0f172a', marginBottom: '4px', fontSize: '0.96rem' }}>
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
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '32px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Compass size={19} color="#d97706" />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Specialization Interest Track</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {domainTracks.map((domain) => {
                const isActive = interestDomain === domain.id;
                return (
                  <button
                    type="button"
                    key={domain.id}
                    onClick={() => setInterestDomain(domain.id)}
                    style={{
                      padding: '16px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? '#d97706' : '#e2e8f0'}`,
                      background: isActive ? '#fffbeb' : '#ffffff',
                      color: isActive ? '#92400e' : '#334155',
                      textAlign: 'center',
                      boxShadow: isActive ? '0 2px 8px rgba(217, 119, 6, 0.15)' : 'var(--shadow-xs)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: isActive ? '#b45309' : '#0f172a', marginBottom: '4px', fontSize: '0.95rem' }}>
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
            style={{ fontSize: '1rem', padding: '12px 36px' }}
          >
            {isLoading ? 'Generating Roadmap...' : 'Generate My Learning Path'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
