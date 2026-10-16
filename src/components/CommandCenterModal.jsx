import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bot, CheckSquare, FileText, Sparkles, Folder, Calendar, 
  Settings, ArrowRight, Zap, X, Shield, Cpu, Image, Layers, Code 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';

export default function CommandCenterModal({ 
  isOpen, 
  onClose, 
  onNavigate, 
  workspaces = [], 
  onSelectWorkspace,
  onOpenSubscription 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allActions = [
    { id: 'act-ai', label: 'Chat with AI Assistant (Neural-4, Claude, GPT-4o)', icon: Bot, category: 'AI Suite', action: () => onNavigate('ai_assistant') },
    { id: 'act-models', label: 'Open AI Model Hub & Performance Matrices', icon: Cpu, category: 'AI Suite', action: () => onNavigate('model_hub') },
    { id: 'act-studio', label: 'Launch Content Studio (Images, Decks, Code, Audio)', icon: Sparkles, category: 'AI Suite', action: () => onNavigate('content_studio') },
    { id: 'act-kanban', label: 'View Kanban Task Board & Sprints', icon: CheckSquare, category: 'Productivity', action: () => onNavigate('kanban') },
    { id: 'act-notes', label: 'Open Rich Notes & Markdown Editor', icon: FileText, category: 'Productivity', action: () => onNavigate('notes') },
    { id: 'act-calendar', label: 'Open Calendar & Event Scheduler', icon: Calendar, category: 'Productivity', action: () => onNavigate('calendar') },
    { id: 'act-docs', label: 'Document OCR & File Management Hub', icon: Folder, category: 'Files', action: () => onNavigate('documents') },
    { id: 'act-auto', label: 'AI Automation Studio (Visual Multi-Step Workflows)', icon: Zap, category: 'Automation', action: () => onNavigate('automations') },
    { id: 'act-kb', label: 'Personal Knowledge Hub & Grounded Search', icon: Layers, category: 'Knowledge', action: () => onNavigate('knowledge') },
    { id: 'act-tpl', label: 'Browse Community Templates & Blueprints', icon: Layers, category: 'Community', action: () => onNavigate('templates') },
    { id: 'act-admin', label: 'Admin Telemetry & Model Usage Console', icon: Shield, category: 'Admin', action: () => onNavigate('admin') },
    { id: 'act-pro', label: 'Upgrade to Prarush Pro (Unlock Claude & Automations)', icon: Sparkles, category: 'Subscription', action: () => onOpenSubscription() }
  ];

  // Workspace actions
  const workspaceActions = workspaces.map(ws => ({
    id: `ws-${ws.id}`,
    label: `Switch to Workspace: ${ws.name}`,
    icon: Folder,
    category: 'Workspaces',
    action: () => {
      onSelectWorkspace(ws.id);
      onNavigate('dashboard');
    }
  }));

  const combinedActions = [...allActions, ...workspaceActions];

  const filteredActions = query.trim()
    ? combinedActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()))
    : combinedActions;

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
        audioSystem.playTone(600, 'sine', 0.08);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="command-palette-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%',
          maxWidth: 620,
          background: '#0e1422',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(6, 182, 212, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          animation: 'fadeInUp 0.2s ease-out'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Search size={20} color="#06b6d4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, ask AI, or search tools (e.g., 'Claude', 'Kanban', 'OCR')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Results List */}
        <div style={{ overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredActions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No commands found for "{query}". Try "AI", "Task", "Notes", or "Studio".
            </div>
          ) : (
            filteredActions.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    audioSystem.playTone(600, 'sine', 0.08);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#090d16' : '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={14} color={isSelected ? '#06b6d4' : '#475569'} />
                </div>
              );
            })
          )}
        </div>

        {/* Command Center Footer Hints */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          color: '#64748b'
        }}>
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span><strong>Enter</strong> to select</span>
          <span><strong>Esc</strong> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
