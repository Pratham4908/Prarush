import React, { useState } from 'react';
import { 
  CheckSquare, Bot, FileText, Zap, Folder, Sparkles, Plus, 
  ArrowRight, Clock, TrendingUp, Cpu, Shield, Layers, Calendar, ChevronRight 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function PrarushDashboardView({
  currentWorkspace,
  tasks = [],
  notes = [],
  documents = [],
  automations = [],
  onNavigate,
  onAddTask,
  onSaveNote,
  onOpenAIWithPrompt,
  currentUser,
  onOpenSubscription
}) {
  const [quickInput, setQuickInput] = useState('');
  const [quickCaptureType, setQuickCaptureType] = useState('task'); // 'task' | 'note' | 'ai'

  const activeTasks = tasks.filter(t => t.workspaceId === currentWorkspace.id || !t.workspaceId);
  const pendingTasks = activeTasks.filter(t => t.status !== 'done');
  const activeNotes = notes.filter(n => n.workspaceId === currentWorkspace.id || !n.workspaceId);
  const activeDocs = documents.filter(d => d.workspaceId === currentWorkspace.id || !d.workspaceId);

  const handleQuickCapture = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    if (quickCaptureType === 'task') {
      onAddTask({
        title: quickInput.trim(),
        workspaceId: currentWorkspace.id,
        priority: 'medium',
        status: 'todo'
      });
      audioSystem.playSuccessSound();
      setQuickInput('');
    } else if (quickCaptureType === 'ai') {
      onOpenAIWithPrompt(quickInput.trim());
      setQuickInput('');
    } else if (quickCaptureType === 'note') {
      if (onSaveNote) {
        onSaveNote({
          title: quickInput.trim(),
          content: `# ${quickInput.trim()}\n\nCaptured from Dashboard Quick Bar on ${new Date().toLocaleDateString()}.`
        });
        audioSystem.playSuccessSound();
        setQuickInput('');
      } else {
        onNavigate('notes');
      }
    }
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Product Promise & Workflow Clarity Banner */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: 14,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <div>
            <strong style={{ color: '#38bdf8' }}>Product Promise:</strong>
            <span style={{ color: '#cbd5e1', marginLeft: 6 }}>
              Local-first workspace for developers and technical creators. 
              <strong> Capture an idea ➔ Convert to sprint task ➔ Refine with AI Copilot ➔ Track progress to completion.</strong>
            </span>
          </div>
        </div>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          padding: '2px 8px',
          borderRadius: 6
        }}>
          LOCAL-FIRST VERIFIED
        </span>
      </div>

      {/* 1. Hero Welcome & Workspace Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(139, 92, 246, 0.12) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>{currentWorkspace.icon}</span>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {currentWorkspace.name}
            </h1>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              background: 'var(--accent-cyan)',
              color: '#090d16',
              padding: '2px 8px',
              borderRadius: 999
            }}>
              ACTIVE WORKSPACE
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '6px 0 0 0', maxWidth: 620 }}>
            {currentWorkspace.description} — Local-first persistence in browser storage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            onClick={() => onNavigate('ai_assistant')}
          >
            <Bot size={16} />
            <span>Ask AI Assistant</span>
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            onClick={() => onNavigate('kanban')}
          >
            <CheckSquare size={16} />
            <span>Open Tasks</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14
      }}>
        {[
          { label: 'Pending Tasks', value: pendingTasks.length, sub: 'In current sprint', icon: CheckSquare, color: '#06b6d4' },
          { label: 'Active Notes', value: activeNotes.length, sub: 'Markdown docs', icon: FileText, color: '#8b5cf6' },
          { label: 'Analyzed Files', value: activeDocs.length, sub: 'PDF & OCR media', icon: Folder, color: '#10b981' },
          { label: 'Active Automations', value: automations.length, sub: 'Background triggers', icon: Zap, color: '#f59e0b' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}
            >
              <div style={{
                width: 42,
                height: 42,
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
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>{stat.label}</div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Universal Quick Capture Strip */}
      <form onSubmit={handleQuickCapture} style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'task', label: 'Task' },
            { id: 'ai', label: 'AI Query' },
            { id: 'note', label: 'Note' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setQuickCaptureType(t.id)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: quickCaptureType === t.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.06)',
                color: quickCaptureType === t.id ? '#090d16' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder={
            quickCaptureType === 'task' 
              ? `Quick add task to ${currentWorkspace.name}... (Press Enter)`
              : quickCaptureType === 'ai'
              ? 'Ask universal AI assistant anything... (Press Enter)'
              : 'Draft quick note title... (Press Enter)'
          }
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
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
          className="btn-primary" 
          style={{ padding: '6px 12px', fontSize: '0.74rem' }}
        >
          <Plus size={14} />
          <span>Capture</span>
        </button>
      </form>

      {/* 4. Two-Column Dashboard Grid: Sprints & AI Content Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Left Column: Priority Tasks & Sprint */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 16,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                High Priority Sprint Tasks
              </h3>
            </div>
            <button
              onClick={() => onNavigate('kanban')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>View Board</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeTasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                onClick={() => onNavigate('kanban')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: task.priority === 'urgent' ? '#f43f5e20' : task.priority === 'high' ? '#f59e0b20' : '#10b98120',
                      color: task.priority === 'urgent' ? '#fb7185' : task.priority === 'high' ? '#fbbf24' : '#6ee7b7'
                    }}>
                      {task.priority?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                      Due {task.deadline || 'This sprint'}
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: task.status === 'done' ? '#10b981' : task.status === 'in_progress' ? '#38bdf8' : '#94a3b8',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '3px 8px',
                  borderRadius: 999
                }}>
                  {task.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Creative Studio Quick Launchers */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 16,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                AI Creative &amp; Research Studio
              </h3>
            </div>
            <button
              onClick={() => onNavigate('content_studio')}
              style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>Explore All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { title: 'AI Slide Deck', desc: 'Auto-generate keynotes & pitch decks', icon: Layers, action: () => onNavigate('content_studio') },
              { title: 'AI Image Studio', desc: 'Diffusion visuals & concept art', icon: Sparkles, action: () => onNavigate('content_studio') },
              { title: 'Code Copilot', desc: 'Syntax highlighted code runner', icon: Cpu, action: () => onNavigate('content_studio') },
              { title: 'Document OCR', desc: 'Extract & summarize scanned PDFs', icon: Folder, action: () => onNavigate('documents') }
            ].map((tool, i) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={i}
                  onClick={tool.action}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <ToolIcon size={20} color="#06b6d4" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{tool.title}</div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: 2 }}>{tool.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Freemium Upgrade Callout */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.06) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b' }}>
                Prarush Pro Membership
              </div>
              <div style={{ fontSize: '0.66rem', color: '#cbd5e1' }}>
                Unlock Claude Sonnet 5.5, Sonnet 5, GPT-4o, Gemini 3.8 Flash, and unlimited workflows.
              </div>
            </div>
            <button
              onClick={onOpenSubscription}
              className="btn-primary"
              style={{
                fontSize: '0.72rem',
                padding: '6px 10px',
                background: '#f59e0b',
                color: '#090d16'
              }}
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
