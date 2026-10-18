import React from 'react';
import { 
  Sparkles, Search, ChevronDown, Bell, Moon, Sun, Globe, 
  Layers, User, Zap, Cpu, CheckSquare, Plus, ArrowRight, Key, Menu 
} from 'lucide-react';
import { PRARUSH_LOCALES, tPrarush } from '../utils/prarushI18n.js';
import { isProSubscriber } from '../utils/prarushFreemium.js';
import { AI_MODELS } from '../utils/prarushAI.js';

export default function PrarushHeader({
  workspaces = [],
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenCommandCenter,
  selectedModelId = 'prarush-neural-4',
  onSelectModel,
  currentLocale = 'en',
  onChangeLocale,
  isDarkMode = true,
  onToggleTheme,
  currentUser,
  onOpenProfile,
  onOpenSubscription,
  onQuickCreateTask,
  onNavigateTab,
  onToggleMobileMenu
}) {
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const activeModel = AI_MODELS.find(m => m.id === selectedModelId) || AI_MODELS[0];
  const isPro = isProSubscriber();

  return (
    <header className="prarush-top-header" style={{
      height: 60,
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      gap: 8
    }}>
      {/* Left: Mobile Hamburger + Brand + Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          style={{
            display: 'none', // Shown on <= 900px via CSS
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer'
          }}
          aria-label="Toggle Menu"
        >
          <Menu size={18} color="#06b6d4" />
        </button>

        {/* Brand Logo */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1rem',
            flexShrink: 0
          }}>
            P
          </div>
          <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              PRARUSH
            </span>
            <span style={{
              fontSize: '0.62rem',
              color: '#06b6d4',
              background: 'rgba(6, 182, 212, 0.15)',
              padding: '1px 6px',
              borderRadius: 4,
              fontWeight: 800,
              marginLeft: 6
            }}>
              v2.0
            </span>
          </div>
        </div>

        {/* Workspace Selector Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div 
            className="sim-btn workspace-badge-btn"
            style={{
              padding: '5px 8px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.76rem',
              color: '#e2e8f0',
              cursor: 'pointer',
              maxWidth: 130
            }}
          >
            <span>{activeWorkspace?.icon || '🌟'}</span>
            <span style={{ maxWidth: 85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {activeWorkspace?.name || 'Workspace'}
            </span>
            <ChevronDown size={12} color="#94a3b8" />
          </div>

          <select
            aria-label="Switch Workspace"
            value={activeWorkspaceId}
            onChange={(e) => onSelectWorkspace(e.target.value)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.icon} {ws.name} ({ws.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Desktop Command Palette Trigger Button */}
      <button
        onClick={onOpenCommandCenter}
        className="header-command-center-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 10,
          padding: '6px 14px',
          color: '#94a3b8',
          fontSize: '0.78rem',
          cursor: 'pointer',
          flex: 1,
          maxWidth: 340,
          margin: '0 8px',
          transition: 'all 0.2s ease'
        }}
        title="Open Command Center (Ctrl+K / Cmd+K)"
      >
        <Search size={14} color="#06b6d4" />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tPrarush('commandBarPlaceholder', currentLocale)}
        </span>
        <kbd className="hidden-mobile" style={{
          fontSize: '0.62rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '2px 6px',
          borderRadius: 4,
          color: '#cbd5e1',
          fontFamily: 'monospace'
        }}>
          Ctrl+K
        </kbd>
      </button>

      {/* Right Actions: Mobile Search, Model Badge, Language, Theme, BYOK Key, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Mobile Search Icon Button */}
        <button
          className="mobile-search-icon-btn"
          style={{
            display: 'none', // Shown on <= 768px via CSS
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#06b6d4',
            cursor: 'pointer'
          }}
          onClick={onOpenCommandCenter}
          title="Search / Command Center"
        >
          <Search size={15} />
        </button>

        {/* Active Model Indicator (Desktop Only) */}
        <div className="hidden-mobile" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div
            className="sim-btn"
            style={{
              padding: '4px 8px',
              borderRadius: 8,
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: `1px solid ${activeModel.badgeColor}40`,
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
            title={`Active Model: ${activeModel.name}`}
          >
            <span>{activeModel.icon}</span>
            <span style={{ maxWidth: 85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeModel.name.split(' ')[0]}
            </span>
            <ChevronDown size={11} color="#94a3b8" />
          </div>

          <select
            aria-label="Select AI Model"
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.icon} {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Multi-Language Selector (Desktop Only) */}
        <div className="hidden-mobile" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            className="header-icon-btn"
            style={{ width: 32, height: 32, fontSize: '0.85rem' }}
            title="Language / Locale"
            aria-label="Change Language"
          >
            {PRARUSH_LOCALES.find(l => l.code === currentLocale)?.flag || '🌐'}
          </button>
          <select
            aria-label="Select Language"
            value={currentLocale}
            onChange={(e) => onChangeLocale(e.target.value)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          >
            {PRARUSH_LOCALES.map(loc => (
              <option key={loc.code} value={loc.code}>
                {loc.flag} {loc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick BYOK API Keys Gateway (Both Desktop & Mobile) */}
        <button
          className="header-icon-btn"
          style={{ 
            width: 32, 
            height: 32, 
            background: 'rgba(6, 182, 212, 0.14)', 
            border: '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.25)' 
          }}
          onClick={() => onNavigateTab && onNavigateTab('model_hub')}
          title="Configure BYOK API Keys (Anthropic, OpenAI, Gemini, OpenRouter)"
          aria-label="BYOK API Keys Gateway"
        >
          <Key size={14} color="#06b6d4" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          className="header-icon-btn"
          style={{ width: 32, height: 32 }}
          onClick={onToggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#38bdf8" />}
        </button>

        {/* Freemium Upgrade Pill (Desktop Only) */}
        <button
          className="hidden-mobile"
          onClick={onOpenSubscription}
          style={{
            height: 30,
            padding: '0 10px',
            borderRadius: 999,
            fontSize: '0.68rem',
            fontWeight: 800,
            background: isPro 
              ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)' 
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: isPro ? '1px solid rgba(6, 182, 212, 0.5)' : 'none',
            color: isPro ? '#38bdf8' : '#090d16',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer'
          }}
          title={isPro ? "Prarush Pro Active" : "Upgrade to Prarush Pro"}
        >
          <Sparkles size={12} color={isPro ? '#38bdf8' : '#090d16'} />
          <span>{isPro ? 'PRO ACTIVE' : 'UPGRADE'}</span>
        </button>

        {/* User Profile Avatar */}
        <button
          className="header-icon-btn"
          style={{ width: 32, height: 32 }}
          onClick={onOpenProfile}
          title={currentUser ? `Signed in as ${currentUser.name}` : "Sign In / Profile"}
          aria-label="User Profile"
        >
          <span style={{ fontSize: '0.95rem' }}>{currentUser?.avatar || '👤'}</span>
        </button>
      </div>
    </header>
  );
}
