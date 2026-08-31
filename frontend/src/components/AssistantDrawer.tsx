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
        background: '#ffffff',
        borderLeft: '1px solid #cbd5e1',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.1)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              background: '#eff6ff',
              borderRadius: '10px',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
            }}
          >
            <Bot size={20} color="#2563eb" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Pathfinder AI Assistant</h3>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontFamily: 'var(--font-mono)' }}>
              ● Connected to NetworkX DAG state
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}>
          <X size={17} />
        </button>
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  background: '#eff6ff',
                  borderRadius: '50%',
                  height: '32px',
                  width: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #bfdbfe',
                }}
              >
                <Bot size={16} color="#2563eb" />
              </div>
            )}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: m.sender === 'user' ? '#2563eb' : '#f1f5f9',
                color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                fontSize: '0.92rem',
                lineHeight: 1.55,
                border: m.sender === 'assistant' ? '1px solid #e2e8f0' : 'none',
              }}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div
                style={{
                  padding: '6px',
                  background: '#e2e8f0',
                  borderRadius: '50%',
                  height: '32px',
                  width: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={15} color="#475569" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '50%', height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#2563eb" />
            </div>
            <div style={{ padding: '10px 16px', background: '#f1f5f9', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#475569', fontFamily: 'var(--font-mono)' }}>
              Analyzing graph prerequisite context...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <Sparkles size={13} color="#2563eb" /> Suggested questions:
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
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.color = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
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
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '10px',
          background: '#ffffff',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask why a skill is in your path..."
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-md)',
            color: '#0f172a',
            fontSize: '0.92rem',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb';
            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#cbd5e1';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
