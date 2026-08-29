import React, { useState } from 'react';
import { LearnerProfile, RoadmapItem } from '../types';
import { api } from '../services/api';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LearnerProfile;
  roadmap: RoadmapItem[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

const SAMPLE_PROMPTS = [
  'Why am I learning statistics right now?',
  'Can I skip Python OOP?',
  'What if I have less time this week?',
  'Why did I get a refresher module?',
];

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  roadmap,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your Pathfinder curriculum assistant. I can explain why skills are sequenced in your path, how prerequisite graphs connect, and how your roadmap adapts to your learning pace.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await api.askAssistant(q, roadmap, profile);
      const assistantMsg: ChatMessage = {
        id: 'a_' + Date.now(),
        sender: 'assistant',
        text: answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'e_' + Date.now(),
        sender: 'assistant',
        text: `Sorry, I couldn't process your question: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '460px',
        maxWidth: '100vw',
        background: 'linear-gradient(180deg, rgba(18, 23, 36, 0.88) 0%, rgba(10, 14, 22, 0.94) 100%)',
        backdropFilter: 'blur(36px) saturate(200%)',
        WebkitBackdropFilter: 'blur(36px) saturate(200%)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 0 60px rgba(0, 0, 0, 0.8), inset 1px 0 2px rgba(255, 255, 255, 0.2)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '22px 26px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '9px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(245, 158, 11, 0.25))',
              borderRadius: '12px',
              border: '1px solid rgba(249, 115, 22, 0.4)',
              color: '#f97316',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            }}
          >
            <Bot size={22} color="#fb923c" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Pathfinder AI Assistant</h3>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              ● Connected to NetworkX DAG state
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ padding: '7px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '10px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
            }}
          >
            {m.sender === 'assistant' && (
              <div
                style={{
                  padding: '6px',
                  background: 'rgba(249, 115, 22, 0.22)',
                  borderRadius: '50%',
                  height: '34px',
                  width: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                }}
              >
                <Bot size={17} color="#f97316" />
              </div>
            )}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: m.sender === 'user'
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.95), rgba(234, 88, 12, 0.95))'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                color: '#ffffff',
                fontSize: '0.94rem',
                lineHeight: 1.55,
                border: m.sender === 'assistant' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: m.sender === 'user'
                  ? '0 4px 16px rgba(249, 115, 22, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                  : '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              }}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div
                style={{
                  padding: '6px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  borderRadius: '50%',
                  height: '34px',
                  width: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div style={{ padding: '6px', background: 'rgba(249, 115, 22, 0.22)', borderRadius: '50%', height: '34px', width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={17} color="#f97316" />
            </div>
            <div style={{ padding: '12px 18px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#fed7aa', fontFamily: 'var(--font-mono)' }}>
              Analyzing graph prerequisite context...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#f97316" /> Suggested questions:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              style={{
                textAlign: 'left',
                fontSize: '0.86rem',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(10px)',
                color: '#fed7aa',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        style={{
          padding: '18px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '10px',
          background: 'rgba(10, 14, 22, 0.9)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask why a skill is in your path..."
          style={{
            flex: 1,
            padding: '12px 18px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.94rem',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 16px rgba(249, 115, 22, 0.3)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary"
          style={{ padding: '12px 18px' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
