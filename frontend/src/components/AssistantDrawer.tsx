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
        width: '450px',
        maxWidth: '100vw',
        background: 'var(--bg-surface-1)',
        borderLeft: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(9, 11, 16, 0.92)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(245, 158, 11, 0.25))',
              borderRadius: '10px',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#f97316',
            }}
          >
            <Bot size={20} color="#fb923c" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.12rem', color: '#ffffff' }}>Pathfinder AI Assistant</h3>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              ● Connected to NetworkX DAG state
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  background: 'rgba(249, 115, 22, 0.2)',
                  borderRadius: '50%',
                  height: '32px',
                  width: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={16} color="#f97316" />
              </div>
            )}
            <div
              style={{
                padding: '13px 18px',
                borderRadius: 'var(--radius-md)',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(17, 20, 30, 0.85)',
                color: '#ffffff',
                fontSize: '0.92rem',
                lineHeight: 1.55,
                border: m.sender === 'assistant' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div
                style={{
                  padding: '6px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  height: '32px',
                  width: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div style={{ padding: '6px', background: 'rgba(249, 115, 22, 0.2)', borderRadius: '50%', height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#f97316" />
            </div>
            <div style={{ padding: '12px 18px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#fed7aa', fontFamily: 'var(--font-mono)' }}>
              Analyzing graph prerequisite context...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(9, 11, 16, 0.78)' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={13} color="#f97316" /> Suggested questions:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              style={{
                textAlign: 'left',
                fontSize: '0.84rem',
                padding: '7px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#fed7aa',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
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
          padding: '18px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '10px',
          background: 'var(--bg-surface-1)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask why a skill is in your path..."
          style={{
            flex: 1,
            padding: '11px 16px',
            background: 'rgba(9, 11, 16, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary"
          style={{ padding: '11px 16px' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
