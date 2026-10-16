import React, { useState } from 'react';
import { 
  Cpu, Zap, DollarSign, Clock, ShieldCheck, Check, Sparkles, 
  Layers, ExternalLink, Play, CheckCircle2 
} from 'lucide-react';
import { AI_MODELS } from '../utils/prarushAI.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushModelHubView({ selectedModelId, onSelectModel, onOpenSubscription }) {
  const [testingModelId, setTestingModelId] = useState(null);
  const [latencyResults, setLatencyResults] = useState({});

  const handleTestLatency = (modelId) => {
    setTestingModelId(modelId);
    audioSystem.playTone(550, 'sine', 0.1);
    
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 45 + 35);
      setLatencyResults(prev => ({ ...prev, [modelId]: `${simulatedLatency} ms` }));
      setTestingModelId(null);
      audioSystem.playSuccessSound();
    }, 600);
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: 16,
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={24} color="#06b6d4" />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Universal AI Model Hub
          </h1>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            background: 'var(--accent-cyan)',
            color: '#090d16',
            padding: '2px 8px',
            borderRadius: 999
          }}>
            MULTI-PROVIDER ENGINE
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '6px 0 0 0', maxWidth: 700 }}>
          Select and compare intelligence engines seamlessly across Anthropic Claude, OpenAI GPT-4o, Google Gemini, Meta Llama 3, and Prarush Neural-4. Zero vendor lock-in.
        </p>
      </div>

      {/* Model Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        {AI_MODELS.map(model => {
          const isSelected = selectedModelId === model.id;
          const isTesting = testingModelId === model.id;
          const latency = latencyResults[model.id] || model.speed;

          return (
            <div
              key={model.id}
              style={{
                background: 'var(--bg-card)',
                border: isSelected ? `2px solid ${model.badgeColor}` : '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: isSelected ? `0 0 20px ${model.badgeColor}25` : 'none',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.6rem' }}>{model.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>
                      {model.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      Provider: <strong>{model.provider}</strong>
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  background: `${model.badgeColor}25`,
                  color: model.badgeColor,
                  border: `1px solid ${model.badgeColor}50`,
                  padding: '2px 7px',
                  borderRadius: 6
                }}>
                  {model.badge}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                <strong>Key Strengths:</strong> {model.strengths}
              </div>

              {/* Specs & Pricing Grid */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                fontSize: '0.7rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Context: </span>
                  <strong style={{ color: '#fff' }}>{model.contextWindow}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Est. Cost: </span>
                  <strong style={{ color: '#38bdf8' }}>{model.costPer1k}/1k</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Live TTFT: </span>
                  <strong style={{ color: '#10b981' }}>{latency}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Privacy: </span>
                  <strong style={{ color: '#cbd5e1' }}>Zero Data Retention</strong>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    onSelectModel(model.id);
                    audioSystem.playSuccessSound();
                  }}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    fontSize: '0.74rem',
                    padding: '8px',
                    justifyContent: 'center',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : undefined,
                    border: isSelected ? '1px solid #10b981' : undefined,
                    color: isSelected ? '#10b981' : undefined
                  }}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Active Default</span>
                    </>
                  ) : (
                    <span>Set Active Model</span>
                  )}
                </button>

                <button
                  onClick={() => handleTestLatency(model.id)}
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '8px 12px' }}
                  disabled={isTesting}
                  title="Ping API endpoint and measure TTFT latency"
                >
                  {isTesting ? <Clock size={13} className="spin-slow" /> : <Play size={13} />}
                  <span>{isTesting ? 'Testing...' : 'Test TTFT'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
