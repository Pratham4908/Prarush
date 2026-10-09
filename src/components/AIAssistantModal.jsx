import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Volume2, X, Sparkles, ArrowRight, Trash2, RefreshCw } from 'lucide-react';
import { processCityAIQuery } from '../utils/aiEngine.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function AIAssistantModal({ isOpen, onClose, onNavigateTab, activeCityName = 'MetroPulse' }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      title: '👋 UrbanSense Autonomous AI Agent',
      text: `Hello! I am your AI agent. You can ask me **ANY question** — whether it's about navigating cities, safe walking routes, local food, or general topics like science, travel packing, math calculations, advice, or casual chat. What can I do for you today?`,
      suggestions: [
        'Is it safe to walk at night?',
        'Find top budget ramen spots',
        'How does GPS triangulation work?',
        'Calculate 18% tip on $65'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  const handleSend = (queryToSend) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);
    audioSystem.playTone(700, 'sine', 0.08);

    // Realistic AI agent thinking latency
    setTimeout(() => {
      const aiResponse = processCityAIQuery(q, activeCityName);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        ...aiResponse
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      audioSystem.playTone(880, 'sine', 0.1);
    }, 450);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        title: '✨ Conversation Reset',
        text: 'Chat cleared. Ask me any new question — I am ready!',
        suggestions: [
          'What are the safest neighborhoods?',
          'Tell me a joke about cities',
          'How do I pack for a 3-day trip?'
        ]
      }
    ]);
  };

  const handleSpeak = (text) => {
    if (isSpeaking) {
      audioSystem.stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioSystem.speak(
        text.replace(/[*#_`]/g, ''),
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ height: '90%' }}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
            }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>UrbanSense AI Agent</span>
                <span style={{ fontSize: '0.62rem', background: '#10b981', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>LIVE</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                Universal NLP • Answers Any Typed Question
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button 
              className="header-icon-btn" 
              onClick={handleClearChat} 
              title="Reset Chat"
              aria-label="Reset Chat"
              style={{ width: 30, height: 30 }}
            >
              <RefreshCw size={13} />
            </button>
            <button 
              className="header-icon-btn" 
              onClick={onClose} 
              aria-label="Close AI Assistant"
              style={{ width: 30, height: 30 }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.sender === 'user' ? '84%' : '94%',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div
                style={{
                  background: msg.sender === 'user' ? 'var(--gradient-brand)' : 'var(--bg-card)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-glass)',
                  borderRadius: 16,
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {msg.title && (
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: 4, fontSize: '0.84rem' }}>
                    {msg.title}
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                {/* Structured Data Points if present */}
                {msg.dataPoints && (
                  <div style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 4
                  }}>
                    {msg.dataPoints.map((dp, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: '#94a3b8' }}>{dp.label}:</span>
                        <strong style={{ color: '#86efac' }}>{dp.value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Shortcut Button */}
                {msg.action && (
                  <button
                    className="btn-primary"
                    style={{ marginTop: 10, padding: '7px 12px', fontSize: '0.74rem' }}
                    onClick={() => {
                      onClose();
                      onNavigateTab(msg.action.tab);
                    }}
                  >
                    <span>{msg.action.label}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>

              {/* TTS Read Aloud Icon for AI messages */}
              {msg.sender === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => handleSpeak(msg.text)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.68rem'
                    }}
                  >
                    <Volume2 size={13} />
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen Aloud'}</span>
                  </button>
                </div>
              )}

              {/* Quick Follow-up Suggestions */}
              {msg.suggestions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      className="filter-chip"
                      style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                      onClick={() => handleSend(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Indicator */}
          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 14,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.74rem',
              color: '#94a3b8'
            }}>
              <Sparkles size={14} color="#06b6d4" className="animate-spin" />
              <span>UrbanSense AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Box */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(13, 19, 33, 0.95)',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          <input
            id="ai-query-input"
            type="text"
            className="form-input"
            placeholder="Type ANY question (safety, food, science, advice, math)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            className="btn-primary"
            style={{ width: 44, height: 44, flex: 'none', padding: 0 }}
            onClick={() => handleSend()}
            aria-label="Send message to AI"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
