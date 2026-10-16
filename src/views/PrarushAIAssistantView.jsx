import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Volume2, ArrowRight, Download, Trash2, 
  Paperclip, Cpu, RefreshCw, CheckCircle2, Copy, Check 
} from 'lucide-react';
import { AI_MODELS, processPrarushAIQuery } from '../utils/prarushAI.js';
import { audioSystem } from '../utils/audioSystem.js';
import { checkQuota, recordUsage, isProSubscriber } from '../utils/prarushFreemium.js';

export default function PrarushAIAssistantView({
  selectedModelId = 'prarush-neural-4',
  onSelectModel,
  onOpenSubscription,
  onNavigate
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      modelUsed: 'Prarush Neural-4 Turbo',
      title: '👋 Welcome to Prarush Universal AI Assistant',
      text: 'I am your unified AI copilot. You can ask me to **write code**, **generate presentations**, **summarize research documents**, **build workflow automations**, or brainstorm project strategies. How can I assist your workflow today?',
      suggestions: [
        'Generate Python code for portfolio Sharpe ratio',
        'Create a 3-slide pitch deck for Prarush',
        'Summarize RLHF alignment principles',
        'Compare Claude 3.5 vs GPT-4o vs Neural-4'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const activeModel = AI_MODELS.find(m => m.id === selectedModelId) || AI_MODELS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const q = (textToSend || inputText).trim();
    if (!q) return;

    // Check freemium query quota
    const quota = checkQuota('aiQueries');
    if (!quota.allowed) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'user', text: q },
        {
          id: Date.now() + 1,
          sender: 'ai',
          modelUsed: activeModel.name,
          title: '⭐ Daily Free AI Quota Reached',
          text: quota.message,
          isQuotaBlock: true
        }
      ]);
      setInputText('');
      return;
    }

    recordUsage('aiQueries');

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    audioSystem.playTone(700, 'sine', 0.08);

    // AI reasoning latency simulation
    setTimeout(() => {
      const response = processPrarushAIQuery(q, selectedModelId);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        ...response
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      audioSystem.playTone(880, 'sine', 0.1);
    }, 450);
  };

  const handleCopy = (id, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      audioSystem.playTone(600, 'sine', 0.08);
    }
  };

  const handleSpeak = (text) => {
    if (isSpeaking) {
      audioSystem.stopAudio();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioSystem.speak(text, null, null, () => setIsSpeaking(false));
    }
  };

  const handleExportChat = () => {
    const formatted = messages.map(m => `### ${m.sender === 'user' ? 'You' : m.modelUsed || 'AI'}\n${m.text || m.code || ''}\n\n`).join('\n---\n\n');
    const blob = new Blob([formatted], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prarush-ai-conversation-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    audioSystem.playSuccessSound();
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 12 }}>
      {/* Top AI Control Bar: Model Selector, Capabilities, Export */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 14,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{activeModel.name}</strong>
              <span style={{
                fontSize: '0.62rem',
                background: `${activeModel.badgeColor}25`,
                color: activeModel.badgeColor,
                padding: '1px 6px',
                borderRadius: 4,
                fontWeight: 800
              }}>
                {activeModel.badge}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Context: {activeModel.contextWindow} &bull; Latency: {activeModel.speed}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quick Model Dropdown */}
          <select
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#e2e8f0',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportChat}
            className="sim-btn"
            style={{ fontSize: '0.72rem', padding: '6px 10px' }}
            title="Export conversation as Markdown"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="sim-btn"
            style={{ fontSize: '0.72rem', padding: '6px 10px' }}
            title="Clear Chat"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.sender === 'user' ? '75%' : '85%',
              background: msg.sender === 'user'
                ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)'
                : 'var(--bg-card)',
              color: msg.sender === 'user' ? '#090d16' : '#f8fafc',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-glass)',
              borderRadius: 14,
              padding: '12px 16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {/* Header info for AI message */}
            {msg.sender === 'ai' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                  {msg.modelUsed || 'Prarush AI'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleSpeak(msg.text || msg.code || '')}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    title="Read Aloud"
                  >
                    <Volume2 size={13} />
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text || msg.code || '')}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    title="Copy Text"
                  >
                    {copiedId === msg.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            )}

            {/* Title if present */}
            {msg.title && (
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                {msg.title}
              </div>
            )}

            {/* Standard Text */}
            {msg.text && (
              <div style={{ fontSize: '0.82rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
            )}

            {/* Code Output Presentation */}
            {msg.code && (
              <div style={{
                marginTop: 8,
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.68rem',
                  color: '#94a3b8'
                }}>
                  <span>Language: {msg.language}</span>
                  <button
                    onClick={() => handleCopy(msg.id, msg.code)}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.65rem' }}
                  >
                    {copiedId === msg.id ? 'Copied ✓' : 'Copy Code'}
                  </button>
                </div>
                <pre style={{
                  padding: 12,
                  margin: 0,
                  fontSize: '0.74rem',
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  fontFamily: 'Consolas, Monaco, monospace'
                }}>
                  <code>{msg.code}</code>
                </pre>
              </div>
            )}

            {/* Slide Presentation Output */}
            {msg.slides && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {msg.slides.map((s, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 8,
                    padding: 10
                  }}>
                    <strong style={{ fontSize: '0.78rem', color: '#f59e0b' }}>
                      Slide {s.slideNumber}: {s.title}
                    </strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.72rem', color: '#cbd5e1' }}>
                      {s.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ marginTop: 2 }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Citations Grounding */}
            {msg.citations && (
              <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>VERIFIED SOURCES: </span>
                <span style={{ fontSize: '0.65rem', color: '#38bdf8' }}>{msg.citations.join(' • ')}</span>
              </div>
            )}

            {/* Quota Block Upgrade Button */}
            {msg.isQuotaBlock && (
              <button
                onClick={onOpenSubscription}
                className="btn-primary"
                style={{ marginTop: 10, fontSize: '0.74rem', padding: '6px 12px', background: '#f59e0b', color: '#090d16' }}
              >
                Upgrade to Prarush Pro ($12/mo)
              </button>
            )}

            {/* Follow-up Suggestions */}
            {msg.suggestions && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {msg.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '4px 8px',
                      color: '#38bdf8',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#38bdf8',
            fontSize: '0.75rem'
          }}>
            <RefreshCw size={14} className="spin-slow" />
            <span>{activeModel.name} is thinking &amp; synthesizing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 14,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <input
          type="text"
          placeholder={`Message ${activeModel.name}... (e.g. 'Generate slide deck', 'Write Python API')`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '0.85rem'
          }}
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.78rem' }}
        >
          <Send size={14} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
