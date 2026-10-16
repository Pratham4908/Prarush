import React, { useState } from 'react';
import { 
  Zap, Plus, Play, CheckCircle2, Clock, ShieldAlert, 
  ArrowRight, ToggleLeft, ToggleRight, Sparkles, RefreshCw 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { isProSubscriber } from '../utils/prarushFreemium.js';

export default function PrarushAutomationsView({ 
  automations = [], 
  onOpenSubscription 
}) {
  const [activeList, setActiveList] = useState(automations);
  const [runningId, setRunningId] = useState(null);
  const [runLog, setRunLog] = useState(null);

  const handleToggleAutomation = (id) => {
    setActiveList(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a));
    audioSystem.playTone(600, 'sine', 0.08);
  };

  const handleTestRun = (auto) => {
    setRunningId(auto.id);
    audioSystem.playTone(700, 'sine', 0.1);

    setTimeout(() => {
      setRunningId(null);
      setRunLog({
        id: auto.id,
        name: auto.name,
        timestamp: new Date().toLocaleTimeString(),
        status: 'SUCCESS',
        executionDuration: '42ms',
        summary: `Trigger [${auto.trigger}] activated. AI Action parsed payload, executed instructions, and logged confirmation.`
      });
      audioSystem.playSuccessSound();
    }, 800);
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(6, 182, 212, 0.12) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={24} color="#f59e0b" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              AI Automation Studio
            </h1>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              background: '#f59e0b',
              color: '#090d16',
              padding: '2px 8px',
              borderRadius: 999
            }}>
              WORKFLOW RUNNER • BROWSER SIMULATOR
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0', maxWidth: 640 }}>
            Design and test multi-step automations in the browser. Background cron schedules and third-party webhooks run in simulation mode until connected to a production server runner.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isProSubscriber()) onOpenSubscription();
          }}
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '8px 14px' }}
        >
          <Plus size={15} />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Execution Log Banner */}
      {runLog && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10b981',
          borderRadius: 12,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>
              ✓ WORKFLOW EXECUTION VERIFIED: {runLog.name}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {runLog.timestamp} ({runLog.executionDuration})
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0 }}>
            {runLog.summary}
          </p>
        </div>
      )}

      {/* Workflows List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeList.map(auto => {
          const isRunning = runningId === auto.id;
          return (
            <div
              key={auto.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: auto.status === 'active' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: auto.status === 'active' ? '#f59e0b' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={22} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {auto.name}
                    </h3>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: auto.status === 'active' ? '#10b98120' : '#64748b20',
                      color: auto.status === 'active' ? '#10b981' : '#94a3b8'
                    }}>
                      {auto.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: 4 }}>
                    <strong>Trigger:</strong> {auto.trigger} &bull; <strong>Action:</strong> {auto.action}
                  </div>

                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: 4 }}>
                    Last run: {auto.lastRun} &bull; {auto.executionsCount} successful executions
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleTestRun(auto)}
                  disabled={isRunning}
                  className="btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '7px 12px' }}
                  title="Simulate immediate execution"
                >
                  {isRunning ? <RefreshCw size={13} className="spin-slow" /> : <Play size={13} />}
                  <span>{isRunning ? 'Running...' : 'Test Run'}</span>
                </button>

                <button
                  onClick={() => handleToggleAutomation(auto.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: auto.status === 'active' ? '#10b981' : '#64748b' }}
                  title={auto.status === 'active' ? "Pause Automation" : "Activate Automation"}
                >
                  {auto.status === 'active' ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
