import React from 'react';
import { Compass, Landmark, ShieldCheck, Scale, Radio, Map } from 'lucide-react';
import { t } from '../utils/i18n.js';

export default function Navigation({ activeTab, onSelectTab, unreadReportsCount = 0, currentLocale = 'en' }) {
  const tabs = [
    { id: 'explore', label: t('navExplore', currentLocale), icon: Compass },
    { id: 'history', label: t('navHistory', currentLocale), icon: Landmark },
    { id: 'map', label: t('navMap', currentLocale), icon: Map },
    { id: 'safety', label: t('navSafety', currentLocale), icon: ShieldCheck },
    { id: 'compare', label: t('navCompare', currentLocale), icon: Scale },
    { id: 'pulse', label: t('navPulse', currentLocale), icon: Radio, hasBadge: unreadReportsCount > 0 },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-btn-${tab.id}`}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
          >
            <div className="nav-icon-wrap">
              <Icon size={18} />
            </div>
            <span>{tab.label}</span>
            {tab.hasBadge && <span className="nav-badge-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
