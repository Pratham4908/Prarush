import React from 'react';
import { 
  LayoutDashboard, Bot, Cpu, Sparkles, CheckSquare, FileText, 
  Folder, Zap, Layers, Calendar, Shield, Settings, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { tPrarush } from '../utils/prarushI18n.js';

export default function PrarushSidebar({ 
  activeTab, 
  onSelectTab, 
  isCollapsed = false, 
  onToggleCollapse,
  currentLocale = 'en',
  unreadTasksCount = 3,
  isMobileOpen = false,
  onCloseMobile
}) {
  const navSections = [
    {
      heading: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: tPrarush('navDashboard', currentLocale), icon: LayoutDashboard },
        { id: 'workspaces', label: tPrarush('navWorkspaces', currentLocale), icon: Layers }
      ]
    },
    {
      heading: 'AI SUITE',
      items: [
        { id: 'ai_assistant', label: tPrarush('navAIAssistant', currentLocale), icon: Bot },
        { id: 'model_hub', label: tPrarush('navModelHub', currentLocale), icon: Cpu },
        { id: 'content_studio', label: tPrarush('navCreativeStudio', currentLocale), icon: Sparkles }
      ]
    },
    {
      heading: 'PRODUCTIVITY',
      items: [
        { id: 'kanban', label: tPrarush('navKanban', currentLocale), icon: CheckSquare, count: unreadTasksCount },
        { id: 'notes', label: tPrarush('navNotes', currentLocale), icon: FileText },
        { id: 'calendar', label: tPrarush('navCalendar', currentLocale), icon: Calendar }
      ]
    },
    {
      heading: 'FILES & KNOWLEDGE',
      items: [
        { id: 'documents', label: tPrarush('navDocuments', currentLocale), icon: Folder },
        { id: 'knowledge', label: tPrarush('navKnowledge', currentLocale), icon: Layers }
      ]
    },
    {
      heading: 'AUTOMATION & ADMIN',
      items: [
        { id: 'automations', label: tPrarush('navAutomations', currentLocale), icon: Zap },
        { id: 'templates', label: tPrarush('navTemplates', currentLocale), icon: Layers },
        { id: 'admin', label: tPrarush('navAdmin', currentLocale), icon: Shield }
      ]
    }
  ];

  const handleItemClick = (id) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          className="prarush-drawer-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`prarush-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed ? 68 : 240,
          background: '#090d16',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s ease',
          flexShrink: 0,
          zIndex: 1200
        }}
      >
        {/* Mobile-Only Header with Close Button */}
        <div className="mobile-drawer-header" style={{
          display: 'none', // Shown on mobile via CSS
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '0.9rem'
            }}>
              P
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              PRARUSH OS
            </span>
          </div>

          <button
            onClick={onCloseMobile}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            aria-label="Close Navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div style={{ overflowY: 'auto', padding: isCollapsed ? '12px 6px' : '14px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {navSections.map((sec, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {!isCollapsed && (
                <div style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.8px',
                  padding: '4px 10px'
                }}>
                  {sec.heading}
                </div>
              )}

              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    title={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      padding: isCollapsed ? '10px 0' : '9px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                      color: isActive ? '#fff' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      boxShadow: isActive ? 'inset 0 0 0 1px rgba(6, 182, 212, 0.4)' : 'none',
                      minHeight: 40
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={18} color={isActive ? '#06b6d4' : '#64748b'} />
                      {!isCollapsed && (
                        <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.count && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#cbd5e1',
                            padding: '1px 6px',
                            borderRadius: 999
                          }}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Desktop Collapse Toggle Footer */}
        <div className="desktop-collapse-footer" style={{
          padding: '12px 10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}>
          {!isCollapsed && (
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
              Prarush OS v2.0
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="header-icon-btn"
            style={{ width: 28, height: 28 }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>
    </>
  );
}
