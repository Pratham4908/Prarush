import React from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Sparkles, Menu 
} from 'lucide-react';

export default function PrarushMobileBottomNav({
  activeTab,
  onSelectTab,
  onToggleDrawer,
  unreadTasksCount = 0
}) {
  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'ai_assistant', label: 'AI Copilot', icon: Bot, isHighlight: true },
    { id: 'kanban', label: 'Tasks', icon: CheckSquare, count: unreadTasksCount },
    { id: 'content_studio', label: 'Studio', icon: Sparkles }
  ];

  return (
    <nav 
      className="prarush-mobile-bottom-nav" 
      aria-label="Mobile Navigation"
      style={{
        display: 'none', // Controlled by CSS media queries in index.css
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'rgba(9, 13, 22, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1100,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      {mainTabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              color: isActive ? '#06b6d4' : '#94a3b8',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 0',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon 
                size={20} 
                color={isActive ? '#06b6d4' : '#94a3b8'} 
                strokeWidth={isActive ? 2.4 : 1.8} 
              />
              {Boolean(tab.count) && tab.count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  background: '#f43f5e',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 999,
                  minWidth: 16,
                  textAlign: 'center'
                }}>
                  {tab.count}
                </span>
              )}
            </div>

            <span style={{
              fontSize: '0.68rem',
              fontWeight: isActive ? 800 : 500,
              letterSpacing: '-0.2px',
              color: isActive ? '#fff' : '#94a3b8'
            }}>
              {tab.label}
            </span>

            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                width: 28,
                height: 3,
                background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                borderRadius: '0 0 3px 3px',
                boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)'
              }} />
            )}
          </button>
        );
      })}

      {/* "More / Menu" Drawer Button */}
      <button
        onClick={onToggleDrawer}
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '6px 0',
          transition: 'all 0.2s ease'
        }}
        aria-label="Open Workspace Menu"
      >
        <Menu size={20} color="#94a3b8" strokeWidth={1.8} />
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '-0.2px',
          color: '#94a3b8'
        }}>
          More
        </span>
      </button>
    </nav>
  );
}
