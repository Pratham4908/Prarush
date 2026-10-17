import React, { useState } from 'react';
import { 
  Shield, Activity, Server, Users, DollarSign, Database, 
  CheckCircle2, AlertTriangle, RefreshCw, Lock, Cpu, HardDrive 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushAdminView() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    audioSystem.playTone(600, 'sine', 0.1);
    setTimeout(() => {
      setIsRefreshing(false);
      audioSystem.playSuccessSound();
    }, 600);
  };

  const providers = [
    { name: 'Prarush Local Rule Engine', status: 'OPERATIONAL (OFFLINE)', latency: '<1ms', uptime: '100% (Local)', load: '0% (On-Device)' },
    { name: 'Anthropic (Claude Sonnet 5.5 & Sonnet 5) [Mock Status]', status: 'SAMPLE DATA', latency: '82ms', uptime: '99.94%', load: '34%' },
    { name: 'OpenAI (GPT-4o Omni) [Mock Status]', status: 'SAMPLE DATA', latency: '89ms', uptime: '99.91%', load: '41%' },
    { name: 'Google (Gemini 3.8 Flash) [Mock Status]', status: 'SAMPLE DATA', latency: '104ms', uptime: '99.95%', load: '22%' },
    { name: 'Meta Open-Source (Llama 3.3 70B) [Mock Status]', status: 'SAMPLE DATA', latency: '61ms', uptime: '100%', load: '12%' }
  ];

  const auditLogs = [
    { time: '18:54:12', user: 'pratham@prarush.ai', event: '[Sample Log] Scout Pro Subscription Renewed ($96/yr)', level: 'INFO' },
    { time: '18:48:33', user: 'system_daemon', event: '[Sample Log] AI Automation Studio: Daily Briefing Executed (28 recipients)', level: 'SUCCESS' },
    { time: '18:32:05', user: 'guest_session_881', event: '[Sample Log] Document OCR Text Extracted (2.4 MB PDF)', level: 'INFO' },
    { time: '18:15:40', user: 'security_auditor', event: '[Sample Log] GDPR Data Export Archive Generated (JSON Schema v2.0)', level: 'COMPLIANCE' },
    { time: '17:59:11', user: 'api_gateway', event: '[Sample Log] Rate Limiter Handled 480 req/sec across European edge cluster', level: 'INFO' }
  ];

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(16, 185, 129, 0.12) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.35)',
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
            <Shield size={24} color="#06b6d4" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Prarush Admin Telemetry &amp; System Health
            </h1>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '2px 8px',
              borderRadius: 999
            }}>
              MOCK / SAMPLE TELEMETRY ONLY
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0', maxWidth: 660 }}>
            Operational architecture demonstration. All stats shown below are simulated baseline mockups for design review. In production, this view connects to real backend telemetry (Prometheus / Datadog / OpenTelemetry).
          </p>
        </div>

        <button
          onClick={handleRefreshMetrics}
          disabled={isRefreshing}
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '8px 14px' }}
        >
          <RefreshCw size={14} className={isRefreshing ? "spin-slow" : ""} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Mock Data'}</span>
        </button>
      </div>

      {/* Prominent Disclaimer Notice */}
      <div style={{
        padding: '12px 18px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: 12,
        fontSize: '0.78rem',
        color: '#fca5a5',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
        <span>
          <strong>Prototype Disclosure:</strong> This dashboard does not reflect live production server activity, actual paying subscriptions, or real cloud token usage. Prarush operates as a local-first client preview; live telemetry requires deploying a dedicated backend service.
        </span>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14
      }}>
        {[
          { label: 'Active Users (24h) [Mock]', value: '18,420', sub: 'Target benchmark simulation', icon: Users, color: '#06b6d4' },
          { label: 'Token Throughput [Mock]', value: '1.48M', sub: 'Calculated baseline target', icon: Cpu, color: '#8b5cf6' },
          { label: 'Monthly Recurring [Mock]', value: '$48,250', sub: 'Purchases currently disabled', icon: DollarSign, color: '#10b981' },
          { label: 'System Uptime [Mock]', value: '99.98%', sub: 'Local browser host', icon: Server, color: '#f59e0b' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 14,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${stat.color}18`,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#e2e8f0' }}>{stat.label}</div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Provider Health Status Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="#06b6d4" />
            <span>AI Model Provider Latency &amp; Status Monitor [Sample Values]</span>
          </h3>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            To test real live auth with your own key, visit the Model Hub view.
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '8px 12px' }}>Provider &amp; Model</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
                <th style={{ padding: '8px 12px' }}>Avg Latency</th>
                <th style={{ padding: '8px 12px' }}>30d Uptime</th>
                <th style={{ padding: '8px 12px' }}>Inference Load</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>{p.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      background: p.status.includes('OFFLINE') ? '#3b82f620' : '#f59e0b20',
                      color: p.status.includes('OFFLINE') ? '#60a5fa' : '#fbbf24',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontWeight: 800
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#38bdf8' }}>{p.latency}</td>
                  <td style={{ padding: '10px 12px' }}>{p.uptime}</td>
                  <td style={{ padding: '10px 12px' }}>{p.load}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={18} color="#f59e0b" />
            <span>Security &amp; Compliance Audit Logs [Sample Trail]</span>
          </h3>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Local-only demo. Real events require backend audit database.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {auditLogs.map((log, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{log.time}</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{log.event}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#64748b' }}>{log.user}</span>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: log.level === 'SUCCESS' ? '#10b98120' : log.level === 'COMPLIANCE' ? '#8b5cf620' : 'rgba(255,255,255,0.08)',
                  color: log.level === 'SUCCESS' ? '#10b981' : log.level === 'COMPLIANCE' ? '#a78bfa' : '#38bdf8'
                }}>
                  {log.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

