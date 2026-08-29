import React, { useState } from 'react';
import { LearnerProfile, RoadmapResponse } from './types';
import { api } from './services/api';
import { DiscoveryView } from './views/DiscoveryView';
import { ProfileCardsView } from './views/ProfileCardsView';
import { GenerationView } from './views/GenerationView';
import { DashboardView } from './views/DashboardView';
import { Threads } from './components/Threads';
import { CardNav, CardNavItem } from './components/CardNav';
import { Compass, Sparkles, Cpu, Layers } from 'lucide-react';

type AppScreen = 'discovery' | 'profile_cards' | 'generation' | 'dashboard';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('discovery');
  const [goalRaw, setGoalRaw] = useState<string>('');
  const [partialProfile, setPartialProfile] = useState<Partial<LearnerProfile>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<LearnerProfile | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Screen 1: Discovery Submit
  const handleGoalSubmit = async (goal: string) => {
    setGoalRaw(goal);
    setIsLoading(true);
    try {
      const parsed = await api.parseGoal(goal);
      setPartialProfile({ ...parsed.profile, goal_raw: goal });
      setMissingFields(parsed.missing_fields);

      if (parsed.missing_fields.length > 0) {
        setScreen('profile_cards');
      } else {
        const completeProfile = parsed.profile as LearnerProfile;
        setActiveProfile(completeProfile);
        const generated = await api.generateRoadmap(completeProfile);
        setRoadmapData(generated);
        setScreen('generation');
      }
    } catch (err: any) {
      alert(`Error parsing goal: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Screen 2: Profile Cards Submit
  const handleProfileComplete = async (completedProfile: LearnerProfile) => {
    setIsLoading(true);
    setActiveProfile(completedProfile);
    try {
      const generated = await api.generateRoadmap(completedProfile);
      setRoadmapData(generated);
      setScreen('generation');
    } catch (err: any) {
      alert(`Error generating roadmap: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Screen 3: Generation Animation Finished
  const handleGenerationDone = () => {
    setScreen('dashboard');
  };

  // Reset flow
  const handleReset = () => {
    setScreen('discovery');
    setGoalRaw('');
    setPartialProfile({});
    setMissingFields([]);
    setActiveProfile(null);
    setRoadmapData(null);
  };

  // CardNav Menu Items
  const navItems: CardNavItem[] = [
    {
      label: 'Curriculum Engine',
      bgColor: 'rgba(38, 24, 16, 0.95)',
      textColor: '#ffffff',
      links: [
        { label: '36 Skill DAG Graph', ariaLabel: '36 Skill DAG Graph' },
        { label: 'Deterministic Kahn Sort', ariaLabel: 'Kahn Topological Sort' },
        { label: 'Gap Traversal Engine', ariaLabel: 'Gap Traversal' },
      ],
    },
    {
      label: 'Adaptive System',
      bgColor: 'rgba(25, 30, 45, 0.95)',
      textColor: '#ffffff',
      links: [
        { label: 'Statistics Checkpoint Quiz', ariaLabel: 'Checkpoint Quiz' },
        { label: '5-Factor Scoring (TimeFit)', ariaLabel: '5-Factor Recommender' },
        { label: 'Track Swap (NLP ↔ Vision)', ariaLabel: 'Track Swap' },
      ],
    },
    {
      label: 'Resources & Docs',
      bgColor: 'rgba(28, 20, 36, 0.95)',
      textColor: '#ffffff',
      links: [
        { label: 'Priya Canonical Flow', onClick: handleReset, ariaLabel: 'Priya Persona Flow' },
        { label: 'FastAPI Interactive Docs', href: 'http://127.0.0.1:8000/docs', ariaLabel: 'API Docs' },
        { label: 'Backend Health Check', href: 'http://127.0.0.1:8000/api/health', ariaLabel: 'API Health' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Interactive WebGL Threads Background from React Bits */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.38,
        }}
      >
        <Threads
          color={[0.98, 0.45, 0.09]}
          amplitude={1.25}
          distance={0.12}
          enableMouseInteraction={true}
        />
      </div>

      {/* React Bits CardNav Header */}
      <header style={{ padding: '20px 24px 10px', position: 'sticky', top: 0, zIndex: 200 }}>
        <CardNav
          logo={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 14px var(--primary-glow)',
                }}
              >
                <Compass size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Pathfinder
              </span>
              <span
                className="badge"
                style={{
                  background: 'rgba(245, 158, 11, 0.16)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  fontSize: '0.66rem',
                  padding: '2px 7px',
                }}
              >
                v1.0
              </span>
            </div>
          }
          items={navItems}
          baseColor="rgba(17, 20, 30, 0.92)"
          menuColor="#fdba74"
          buttonBgColor="#f97316"
          buttonTextColor="#ffffff"
          ctaText={screen === 'discovery' ? 'Priya Demo' : 'New Goal'}
          onCtaClick={handleReset}
        />
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {screen === 'discovery' && (
          <DiscoveryView onGoalSubmit={handleGoalSubmit} isLoading={isLoading} />
        )}

        {screen === 'profile_cards' && (
          <ProfileCardsView
            initialProfile={partialProfile}
            missingFields={missingFields}
            onSubmit={handleProfileComplete}
            isLoading={isLoading}
          />
        )}

        {screen === 'generation' && (
          <GenerationView onComplete={handleGenerationDone} />
        )}

        {screen === 'dashboard' && activeProfile && roadmapData && (
          <DashboardView
            initialRoadmapData={roadmapData}
            initialProfile={activeProfile}
            onResetGoal={handleReset}
          />
        )}
      </main>
    </div>
  );
};
