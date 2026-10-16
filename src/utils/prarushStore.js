// Prarush Universal Digital Platform: Core State & Persistent Data Store
// Manages Workspaces, Tasks (Kanban), Notes, Documents, Automations, Knowledge, Calendar, Activity

export const STORAGE_KEYS = {
  WORKSPACES: 'prarush_workspaces',
  TASKS: 'prarush_tasks',
  NOTES: 'prarush_notes',
  DOCUMENTS: 'prarush_documents',
  AUTOMATIONS: 'prarush_automations',
  KNOWLEDGE: 'prarush_knowledge',
  EVENTS: 'prarush_events',
  NOTIFICATIONS: 'prarush_notifications',
  ACTIVITY: 'prarush_activity_log',
  ACTIVE_WORKSPACE: 'prarush_active_workspace_id',
  THEME: 'prarush_theme_mode'
};

export const DEFAULT_WORKSPACES = [
  {
    id: 'ws-work',
    name: 'Software Engineering & Dev',
    icon: '💻',
    description: 'Sprint planning, code repositories, system architecture, API specs',
    color: '#10b981',
    category: 'developer',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'ws-creator',
    name: 'Content & Creative Studio',
    icon: '🎨',
    description: 'Storyboards, AI prompt workflows, video scripts, presentation decks',
    color: '#f59e0b',
    category: 'creator',
    createdAt: '2026-01-20T11:00:00Z'
  },
  {
    id: 'ws-study',
    name: 'Academic & Research',
    icon: '🎓',
    description: 'Course notes, exam prep, literature reviews, and research citations',
    color: '#8b5cf6',
    category: 'study',
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'ws-business',
    name: 'Venture & Business Operations',
    icon: '💼',
    description: 'Pitch decks, marketing campaigns, customer feedback, financial forecasts',
    color: '#ec4899',
    category: 'business',
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'ws-personal',
    name: 'Personal Life & Goals',
    icon: '🌟',
    description: 'Habits, personal side projects, and reading list',
    color: '#06b6d4',
    category: 'personal',
    createdAt: '2026-01-10T08:00:00Z'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    workspaceId: 'ws-work',
    title: 'Deploy Prarush Microservices to Kubernetes Cluster',
    description: 'Set up Helm charts, ingress controllers with TLS certificates, and configure auto-scaling policies.',
    status: 'in_progress', // todo | in_progress | review | done
    priority: 'high', // low | medium | high | urgent
    deadline: '2026-10-24',
    tags: ['DevOps', 'Kubernetes', 'Backend'],
    assignee: 'Pratham (Lead Engineer)',
    createdAt: '2026-10-14T10:00:00Z'
  },
  {
    id: 'task-102',
    workspaceId: 'ws-work',
    title: '[Sample] Integrate Claude Sonnet 4.5 & GPT-4o Multi-Model API Hub',
    description: 'Implement streaming SSE endpoints with token rate limiting, fallback error handling, and latency tracking.',
    status: 'done',
    priority: 'urgent',
    deadline: '2026-10-18',
    tags: ['AI Engine', 'API', 'LLM'],
    assignee: 'Pratham (Lead Engineer)',
    createdAt: '2026-10-12T09:00:00Z'
  },
  {
    id: 'task-103',
    workspaceId: 'ws-study',
    title: '[Sample] Autonomous Agent Architecture Literature Review',
    description: 'Summarize key papers on Tree-of-Thought, ReAct prompting, and local retrieval pipelines.',
    status: 'todo',
    priority: 'medium',
    deadline: '2026-10-28',
    tags: ['Research', 'AI Theory', 'Paper'],
    assignee: 'Academic Scout',
    createdAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'task-104',
    workspaceId: 'ws-creator',
    title: '[Sample] Design Prarush Platform Keynote & Demo Storyboard',
    description: 'Generate high-fidelity AI UI visuals, craft narrative script, and record product walkthrough video.',
    status: 'review',
    priority: 'high',
    deadline: '2026-10-22',
    tags: ['Creative', 'Video', 'Launch'],
    assignee: 'Design Lead',
    createdAt: '2026-10-14T15:00:00Z'
  },
  {
    id: 'task-105',
    workspaceId: 'ws-business',
    title: '[Sample] Finalize Local-First Pricing Tier Disclosures',
    description: 'Calibrate disclosures for Free ($0), Pro ($12/mo preview), and Team ($29/mo preview) plans with disabled checkout.',
    status: 'done',
    priority: 'high',
    deadline: '2026-10-16',
    tags: ['Finances', 'Freemium', 'Strategy'],
    assignee: 'Product Strategist',
    createdAt: '2026-10-10T14:00:00Z'
  },
  {
    id: 'task-106',
    workspaceId: 'ws-work',
    title: '[Sample] Implement Local-First IndexedDB Binary Storage Cache',
    description: 'Benchmark sub-5ms client query latency and implement atomic transaction journaling.',
    status: 'todo',
    priority: 'medium',
    deadline: '2026-10-25',
    tags: ['Database', 'Wasm', 'Offline'],
    assignee: 'Pratham (Lead Engineer)',
    createdAt: '2026-10-16T08:00:00Z'
  }
];

export const INITIAL_NOTES = [
  {
    id: 'note-201',
    workspaceId: 'ws-work',
    title: '[Sample] Prarush Local-First System Architecture',
    content: `# Prarush Local-First Architecture\n\n## 1. High-Performance Core\n- **Client:** React 19 with Vite 8.3 & Lucide React design system.\n- **State Management:** Reactive local-first synchronization with persistent browser storage (LocalStorage & IndexedDB).\n- **Multi-Model Routing:** Direct BYOK inference with Claude Sonnet 4.5, GPT-4o, and Gemini 3.8 Flash.\n\n## 2. Security & Data Isolation\n- Client-side token encryption for session credentials.\n- Zero third-party data tracking; complete GDPR data export portability.\n- Strict per-user local storage isolation with zero cross-profile leakage.`,
    tags: ['Architecture', 'Tech Spec', 'System Design'],
    pinned: true,
    updatedAt: '2026-10-16T14:30:00Z'
  },
  {
    id: 'note-202',
    workspaceId: 'ws-study',
    title: '[Sample] Reinforcement Learning & Preference Optimization Primer',
    content: `# RLHF & Preference Optimization\n\nRLHF combines reward modeling with proximal policy optimization (PPO) or Direct Preference Optimization (DPO).\n\n### Key Stages:\n1. **Pre-training:** Massive web-scale language modeling.\n2. **Supervised Fine-Tuning (SFT):** Curated prompt-response pairs.\n3. **Reward Modeling:** Pairwise ranking of model completions.\n4. **Optimization:** Aligning policy models to maximize human preference scores while constraining KL divergence.`,
    tags: ['Machine Learning', 'RLHF', 'Study'],
    pinned: false,
    updatedAt: '2026-10-15T16:20:00Z'
  },
  {
    id: 'note-203',
    workspaceId: 'ws-creator',
    title: '[Sample] Viral Product Launch Playbook & Social Campaign',
    content: `# Product Launch Checklist\n\n- [x] Publish interactive HTML5 Pitch Deck\n- [x] Verify PWA installable manifest on mobile viewports\n- [ ] Release short product walkthrough on X / LinkedIn\n- [ ] Launch on Product Hunt with interactive sandbox demo\n- [ ] Open GitHub repository with open-source MIT license`,
    tags: ['Marketing', 'Launch', 'Checklist'],
    pinned: true,
    updatedAt: '2026-10-16T11:15:00Z'
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-301',
    workspaceId: 'ws-work',
    name: '[Sample] Prarush-Product-Specification-v2.pdf',
    type: 'pdf',
    sizeKB: 2450,
    uploadedAt: '2026-10-14T09:00:00Z',
    summary: 'Sample document metadata for technical blueprint. Note: Raw binary is not present in local IndexedDB until an authentic file is uploaded.',
    ocrText: 'PRARUSH UNIVERSAL PLATFORM SPECIFICATION. Version 2.0.0. Core modules include AI Model Hub, Kanban Automation, Document OCR, and Cross-Platform PWA packaging.',
    status: 'sample_metadata',
    isSample: true,
    hasRealBinary: false,
    isPersistedInIndexedDB: false
  },
  {
    id: 'doc-302',
    workspaceId: 'ws-business',
    name: '[Sample] Q4-Financial-Projections-and-Freemium-Model.xlsx',
    type: 'sheet',
    sizeKB: 840,
    uploadedAt: '2026-10-15T14:20:00Z',
    summary: 'Sample financial projection sheet metadata. Demonstrates file cataloging before authentic user file uploads.',
    ocrText: 'Revenue forecast: Free User baseline: 120,000. Pro Conversion: 4.8%. Team Seats: 1,200. Operating Margin: 72% after LLM inference costs.',
    status: 'sample_metadata',
    isSample: true,
    hasRealBinary: false,
    isPersistedInIndexedDB: false
  },
  {
    id: 'doc-303',
    workspaceId: 'ws-creator',
    name: '[Sample] Brand-Styleguide-Palette-and-Typography.png',
    type: 'image',
    sizeKB: 1850,
    uploadedAt: '2026-10-16T08:10:00Z',
    summary: 'Sample brand asset metadata. Note: Binary pixels are not stored locally until an authentic file is uploaded.',
    ocrText: 'PRARUSH DESIGN TOKENS. Primary Font: Outfit & Plus Jakarta Sans. Accent Neon Cyan: #06b6d4. Accent Gold: #f59e0b. Border Glass: rgba(255,255,255,0.08).',
    status: 'sample_metadata',
    isSample: true,
    hasRealBinary: false,
    isPersistedInIndexedDB: false
  }
];

export const INITIAL_AUTOMATIONS = [
  {
    id: 'auto-401',
    name: 'Daily Morning Executive Briefing',
    trigger: 'Schedule (Every day at 08:00 AM)',
    action: 'Summarize today\'s high-priority tasks, unread documents, and AI news, then speak briefing aloud',
    status: 'active',
    lastRun: 'Today at 08:00 AM',
    executionsCount: 28,
    category: 'Productivity'
  },
  {
    id: 'auto-402',
    name: 'Automated GitHub Issue -> Kanban Task Bridge',
    trigger: 'Webhook (New GitHub Issue opened)',
    action: 'Parse issue body with AI NLP, assign priority score, and insert directly into "To Do" board',
    status: 'active',
    lastRun: 'Yesterday at 04:32 PM',
    executionsCount: 64,
    category: 'Development'
  },
  {
    id: 'auto-403',
    name: 'Invoice OCR & Expense Ledger Auto-Logging',
    trigger: 'File Upload (Receipt / Invoice PDF or PNG)',
    action: 'Extract total amount, vendor name, and date via OCR, then categorize in Business Workspace',
    status: 'active',
    lastRun: '2 days ago',
    executionsCount: 19,
    category: 'Finance'
  }
];

export const INITIAL_KNOWLEDGE_ITEMS = [
  {
    id: 'kb-501',
    title: '[Sample] Git Rebase vs. Merge Workflows for Teams',
    source: 'Sample Engineering Reference',
    snippet: 'Git rebase rewrites branch history by applying local commits sequentially onto the target branch tip, ensuring a clean linear git log. Git merge creates a dedicated merge commit, preserving exact historical branch topology.',
    tags: ['Git', 'DevOps', 'Sample'],
    date: '2026-10-12'
  },
  {
    id: 'kb-502',
    title: '[Sample] IndexedDB Asynchronous Storage vs. LocalStorage',
    source: 'Sample Web Architecture Note',
    snippet: 'LocalStorage is synchronous and limited to approximately 5MB of UTF-16 string data, which can block browser rendering on heavy reads. IndexedDB is asynchronous, transactional, and safely stores binary Blobs and Files for local-first applications.',
    tags: ['Storage', 'IndexedDB', 'Sample'],
    date: '2026-10-14'
  },
  {
    id: 'kb-503',
    title: '[Sample] REST API Client Error Handling & Status Codes',
    source: 'Sample API Integration Guide',
    snippet: 'REST APIs communicate outcomes using standardized HTTP status codes: 400 for bad payloads, 401 for missing authentication, 403 for unauthorized access, 404 for missing resources, and 429 for rate limit throttling.',
    tags: ['API', 'Backend', 'Sample'],
    date: '2026-10-15'
  }
];

export const INITIAL_KNOWLEDGE = INITIAL_KNOWLEDGE_ITEMS;

export const INITIAL_CALENDAR_EVENTS = [
  {
    id: 'evt-601',
    title: 'Prarush Platform v2.0 Global Release Keynote',
    date: '2026-10-20',
    time: '14:00 - 15:30',
    workspaceId: 'ws-work',
    category: 'launch',
    color: '#06b6d4'
  },
  {
    id: 'evt-602',
    title: 'AI Multi-Model Provider Latency & Cost Review',
    date: '2026-10-22',
    time: '11:00 - 12:00',
    workspaceId: 'ws-work',
    category: 'meeting',
    color: '#10b981'
  },
  {
    id: 'evt-603',
    title: 'Advanced Machine Learning Thesis Defense Rehearsal',
    date: '2026-10-25',
    time: '16:00 - 17:30',
    workspaceId: 'ws-study',
    category: 'study',
    color: '#8b5cf6'
  }
];

export const COMMUNITY_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Full-Stack Developer Sprint & Bug Tracker',
    category: 'Engineering',
    stars: 4.9,
    clones: 3420,
    author: 'Pratham Dev',
    description: 'Kanban boards configured with QA, In Progress, CI/CD stages, code snippets, and automated issue triage.'
  },
  {
    id: 'tpl-2',
    name: 'Graduate Student Research & Thesis Hub',
    category: 'Academic',
    stars: 4.85,
    clones: 2890,
    author: 'Prof. Elena Rostova',
    description: 'Literature review matrix, citation tracker, LaTeX formula scratchpad, and defense milestones.'
  },
  {
    id: 'tpl-3',
    name: 'Solo Founder Lean Business OS',
    category: 'Business',
    stars: 4.95,
    clones: 5120,
    author: 'Silicon Valley Scouts',
    description: 'CAC/LTV calculator, investor pitch presentation builder, customer interview logs, and roadmap.'
  },
  {
    id: 'tpl-4',
    name: 'Creative Content Studio & Storyboard Creator',
    category: 'Creator',
    stars: 4.88,
    clones: 1940,
    author: 'Aura Visuals',
    description: 'YouTube script templates, AI prompt library, visual moodboards, and multi-platform publishing schedules.'
  }
];

// Helper to get from LocalStorage with fallback
export function getStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to save to LocalStorage
export function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Storage save error for ${key}:`, err);
  }
}

// User-scoped storage isolation: isolates records per user account
export function getUserStorageKey(baseKey, userId) {
  const uid = userId ? String(userId).trim() : 'usr-guest';
  const cleanBase = baseKey.replace(/^prarush_/, '');
  return `prarush_usr_${uid}_${cleanBase}`;
}

export function getUserStoredData(baseKey, userId, fallback) {
  const scopedKey = getUserStorageKey(baseKey, userId);
  // Strictly isolated: read ONLY from scopedKey and NEVER fall back to shared unscoped keys
  return getStoredData(scopedKey, fallback);
}

export function saveUserStoredData(baseKey, userId, data) {
  const scopedKey = getUserStorageKey(baseKey, userId);
  saveStoredData(scopedKey, data);
}

// Log an activity entry
export function logActivity(action, details, workspaceId = 'ws-personal') {
  try {
    const activities = getStoredData(STORAGE_KEYS.ACTIVITY, []);
    const newEntry = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      workspaceId,
      timestamp: new Date().toISOString()
    };
    activities.unshift(newEntry);
    // Keep max 50 recent activities
    const trimmed = activities.slice(0, 50);
    saveStoredData(STORAGE_KEYS.ACTIVITY, trimmed);
    return newEntry;
  } catch {
    return null;
  }
}

// Origin-Safe Data Purge: Only delete Prarush namespace keys, never call localStorage.clear()
export function clearPrarushStorageOnly() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('prarush_')) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    return true;
  } catch (err) {
    console.error('Failed to clear Prarush local storage:', err);
    return false;
  }
}

