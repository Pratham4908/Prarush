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
    id: 'ws-personal',
    name: 'Personal Life & Goals',
    icon: '🌟',
    description: 'Habits, personal projects, wellness, and life planning',
    color: '#06b6d4',
    category: 'personal',
    createdAt: '2026-01-10T08:00:00Z'
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
    description: 'Storyboards, AI image prompts, video scripts, presentation decks',
    color: '#f59e0b',
    category: 'creator',
    createdAt: '2026-01-20T11:00:00Z'
  },
  {
    id: 'ws-business',
    name: 'Venture & Business Operations',
    icon: '💼',
    description: 'Pitch decks, marketing campaigns, customer feedback, financial forecasts',
    color: '#ec4899',
    category: 'business',
    createdAt: '2026-02-01T12:00:00Z'
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
    title: 'Integrate Claude 3.5 Sonnet & GPT-4o Multi-Model API Hub',
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
    title: 'Prepare Autonomous Agent Architecture Literature Review',
    description: 'Summarize key papers on Tree-of-Thought, ReAct prompting, and vector memory retrieval pipelines.',
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
    title: 'Design Prarush Platform Keynote & Demo Video Storyboard',
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
    title: 'Finalize Prarush Freemium Tier Economics & Pricing Model',
    description: 'Calibrate token margins for Free ($0), Pro ($12/mo), and Enterprise ($29/mo) plans.',
    status: 'done',
    priority: 'high',
    deadline: '2026-10-16',
    tags: ['Finances', 'Freemium', 'Strategy'],
    assignee: 'Product Strategist',
    createdAt: '2026-10-10T14:00:00Z'
  },
  {
    id: 'task-106',
    workspaceId: 'ws-personal',
    title: 'Complete Weekly 10K Running & Mindfulness Benchmark',
    description: 'Track recovery pace, maintain hydration log, and complete deep meditation session.',
    status: 'todo',
    priority: 'low',
    deadline: '2026-10-20',
    tags: ['Wellness', 'Health', 'Habits'],
    assignee: 'Self',
    createdAt: '2026-10-16T08:00:00Z'
  }
];

export const INITIAL_NOTES = [
  {
    id: 'note-201',
    workspaceId: 'ws-work',
    title: 'Prarush Universal AI System Architecture',
    content: `# Prarush Universal System Architecture\n\n## 1. High-Performance Core\n- **Client:** React 19 with Vite 8.3 & Lucide React design system.\n- **State Management:** Reactive local-first synchronization with persistent browser storage.\n- **Multi-Model Routing:** Universal adapter interfacing with Prarush Neural-4, Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.\n\n## 2. Security & Data Isolation\n- Client-side token encryption for session credentials.\n- Zero third-party data tracking; complete GDPR data export portability.\n- Row-level access control simulation across personal and team workspaces.`,
    tags: ['Architecture', 'Tech Spec', 'System Design'],
    pinned: true,
    updatedAt: '2026-10-16T14:30:00Z'
  },
  {
    id: 'note-202',
    workspaceId: 'ws-study',
    title: 'Reinforcement Learning from Human Feedback (RLHF) Primer',
    content: `# RLHF & Preference Optimization\n\nRLHF combines reward modeling with proximal policy optimization (PPO) or Direct Preference Optimization (DPO).\n\n### Key Stages:\n1. **Pre-training:** Massive web-scale language modeling.\n2. **Supervised Fine-Tuning (SFT):** Curated prompt-response pairs.\n3. **Reward Modeling:** Pairwise ranking of model completions.\n4. **Optimization:** Aligning policy models to maximize human preference scores while constraining KL divergence.`,
    tags: ['Machine Learning', 'RLHF', 'Study'],
    pinned: false,
    updatedAt: '2026-10-15T16:20:00Z'
  },
  {
    id: 'note-203',
    workspaceId: 'ws-creator',
    title: 'Viral Product Launch Playbook & Social Campaign',
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
    name: 'Prarush-Product-Specification-v2.pdf',
    type: 'pdf',
    sizeKB: 2450,
    uploadedAt: '2026-10-14T09:00:00Z',
    summary: 'Comprehensive 42-page technical blueprint detailing the multi-agent AI system, security architecture, and Capacitor mobile deployment guidelines.',
    ocrText: 'PRARUSH UNIVERSAL PLATFORM SPECIFICATION. Version 2.0.0. Core modules include AI Model Hub, Kanban Automation, Document OCR, and Cross-Platform PWA packaging.',
    status: 'analyzed'
  },
  {
    id: 'doc-302',
    workspaceId: 'ws-business',
    name: 'Q4-Financial-Projections-and-Freemium-Model.xlsx',
    type: 'sheet',
    sizeKB: 840,
    uploadedAt: '2026-10-15T14:20:00Z',
    summary: 'Financial model showing expected MRR growth from Free to Pro ($12/mo) and Team ($29/mo) plans, projecting profitability at 15,000 active subscribers.',
    ocrText: 'Revenue forecast: Free User baseline: 120,000. Pro Conversion: 4.8%. Team Seats: 1,200. Operating Margin: 72% after LLM inference costs.',
    status: 'analyzed'
  },
  {
    id: 'doc-303',
    workspaceId: 'ws-creator',
    name: 'Brand-Styleguide-Palette-and-Typography.png',
    type: 'image',
    sizeKB: 1850,
    uploadedAt: '2026-10-16T08:10:00Z',
    summary: 'Brand visual identity asset package featuring cyber-luxe dark mode palette (#090d16), cyan (#06b6d4), gold (#f59e0b), and violet (#8b5cf6).',
    ocrText: 'PRARUSH DESIGN TOKENS. Primary Font: Outfit & Plus Jakarta Sans. Accent Neon Cyan: #06b6d4. Accent Gold: #f59e0b. Border Glass: rgba(255,255,255,0.08).',
    status: 'analyzed'
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
    title: 'Vector Embeddings & Semantic Search Pipelines',
    source: 'Prarush AI Research Archive',
    snippet: 'Cosine similarity across dense 1536-dimensional vectors allows instant retrieval of semantically related notes and documents even without exact keyword matches.',
    tags: ['AI', 'Embeddings', 'Search'],
    date: '2026-10-12'
  },
  {
    id: 'kb-502',
    title: 'Progressive Web App (PWA) Offline Service Worker Best Practices',
    source: 'W3C Web Standards & MDN',
    snippet: 'Stale-while-revalidate caching delivers sub-millisecond perceived page load times while background network requests refresh cached assets automatically.',
    tags: ['PWA', 'Performance', 'Web'],
    date: '2026-10-14'
  },
  {
    id: 'kb-503',
    title: 'GDPR Data Subject Rights & Client-Side Encryption Guidelines',
    source: 'EU Digital Privacy Framework 2026',
    snippet: 'Under GDPR Article 17 (Right to Erasure) and Article 20 (Data Portability), platforms must provide machine-readable JSON data export and permanent 1-click deletion.',
    tags: ['GDPR', 'Privacy', 'Compliance'],
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
