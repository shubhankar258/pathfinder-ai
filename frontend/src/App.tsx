import React, { useState } from 'react';
import { LearnerProfile, RoadmapResponse } from './types';
import { api } from './services/api';
import { DiscoveryView } from './views/DiscoveryView';
import { ProfileCardsView } from './views/ProfileCardsView';
import { GenerationView } from './views/GenerationView';
import { DashboardView } from './views/DashboardView';
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HUD Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(9, 11, 16, 0.9)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          onClick={handleReset}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f97316, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px var(--primary-glow)',
            }}
          >
            <Compass size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Pathfinder
              </span>
              <span
                className="badge"
                style={{
                  background: 'rgba(245, 158, 11, 0.16)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                }}
              >
                v1.0 Engine
              </span>
            </div>
          </div>
        </div>

        {/* Engine status pills */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
            <span>36 DAG Nodes</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: '#fdba74',
              background: 'rgba(249, 115, 22, 0.14)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
            }}
          >
            <Sparkles size={13} color="#f97316" />
            <span>Persona: <strong>Priya</strong></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
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
