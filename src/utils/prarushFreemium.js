import JSZip from 'jszip';
import { getAllFilesForUserFromIndexedDB } from './indexedDbStore.js';

// Prarush Universal Platform: Freemium & Subscription Entitlement Engine
// Handles Free vs Prarush Pro vs Prarush Team tiers, usage quotas, sandbox checkout, and GDPR data export

const SUB_STORAGE_KEY = 'prarush_subscription';
const USAGE_STORAGE_KEY = 'prarush_daily_usage';

export const PRARUSH_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Scout',
    priceMonthly: 0,
    priceAnnual: 0,
    badge: 'FREE',
    badgeColor: '#94a3b8',
    description: 'Essential local-first AI capabilities and productivity tools for developers and creators.',
    features: [
      'Local offline AI rules & templates (Prarush Local Engine)',
      'Up to 2 active workspaces',
      'Kanban task manager & markdown notes editor',
      'Community template browsing',
      'Local file & document storage in browser memory',
      'Zero tracking and private client-side execution'
    ],
    limits: {
      aiQueriesPerDay: 20,
      workspaces: 2,
      storageMB: 500,
      aiImageGen: 5,
      automationWorkflows: 1,
      multiModelAccess: false,
      ocrExtraction: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'Prarush Pro (Planned)',
    priceMonthly: 12,
    priceAnnual: 96, // $8/mo, ~33% discount
    badge: 'PLANNED ⭐',
    badgeColor: '#06b6d4',
    description: 'Planned future upgrade for cloud-synchronized workspaces and managed AI endpoints (Purchases disabled in preview).',
    features: [
      '[Planned Cloud] Cloud database synchronization (PostgreSQL / Supabase)',
      '[Planned Cloud] Cross-device state replication for mobile and web',
      '[Planned Cloud] Managed high-throughput AI endpoints (Claude Sonnet 4.5, GPT-4o, Gemini Flash)',
      '[Planned Cloud] Cloud OCR text extraction microservice for binary PDFs & images',
      '[Planned Cloud] 50 GB secure cloud backup storage',
      '[Planned Cloud] Automated continuous cloud snapshots'
    ],
    limits: {
      aiQueriesPerDay: Infinity,
      workspaces: Infinity,
      storageMB: 50000,
      aiImageGen: Infinity,
      automationWorkflows: Infinity,
      multiModelAccess: true,
      ocrExtraction: true
    }
  },
  TEAM: {
    id: 'team',
    name: 'Prarush Team (Planned)',
    priceMonthly: 29,
    priceAnnual: 276, // $23/seat/mo
    badge: 'BUSINESS 🚀',
    badgeColor: '#f59e0b',
    description: 'Planned business tier for shared team workspaces, RBAC, and collaborative automation (Purchases disabled in preview).',
    features: [
      '[Planned Cloud] Everything in Prarush Pro',
      '[Planned Cloud] Shared team workspaces & collaborative real-time Kanban boards',
      '[Planned Cloud] Role-based access control (Admin, Editor, Viewer)',
      '[Planned Cloud] Organizational audit logs & security telemetry',
      '[Planned Cloud] Custom webhook bridges (GitHub, Slack, Jira)',
      '[Planned Cloud] Pooled team cloud storage & priority support'
    ],
    limits: {
      aiQueriesPerDay: Infinity,
      workspaces: Infinity,
      storageMB: 500000,
      aiImageGen: Infinity,
      automationWorkflows: Infinity,
      multiModelAccess: true,
      ocrExtraction: true
    }
  }
};

PRARUSH_PLANS.free = PRARUSH_PLANS.FREE;
PRARUSH_PLANS.pro = PRARUSH_PLANS.PRO;
PRARUSH_PLANS.team = PRARUSH_PLANS.TEAM;

export function getSubscription() {
  try {
    const raw = localStorage.getItem(SUB_STORAGE_KEY);
    if (!raw) {
      return {
        planId: 'free',
        status: 'active',
        billingCycle: 'none',
        startedAt: null,
        renewsAt: null
      };
    }
    return JSON.parse(raw);
  } catch {
    return { planId: 'free', status: 'active', billingCycle: 'none' };
  }
}

export function isProSubscriber() {
  const sub = getSubscription();
  return (sub.planId === 'pro' || sub.planId === 'team') && sub.status === 'active';
}

export function isTeamSubscriber() {
  const sub = getSubscription();
  return sub.planId === 'team' && sub.status === 'active';
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function getDailyUsage(featureKey) {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const today = getTodayString();
    if (data.date !== today) return 0;
    return data.counts?.[featureKey] || 0;
  } catch {
    return 0;
  }
}

export function recordUsage(featureKey) {
  try {
    const today = getTodayString();
    let data = { date: today, counts: {} };
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        data = parsed;
      }
    }
    data.counts[featureKey] = (data.counts[featureKey] || 0) + 1;
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
    return data.counts[featureKey];
  } catch {
    return 1;
  }
}

export function checkQuota(featureKey) {
  const isPro = isProSubscriber();
  const plan = isPro ? PRARUSH_PLANS.PRO : PRARUSH_PLANS.FREE;

  if (featureKey === 'aiQueries') {
    const usage = getDailyUsage('aiQueries');
    const limit = plan.limits.aiQueriesPerDay;
    const remaining = Math.max(0, limit - usage);
    return {
      allowed: isPro || remaining > 0,
      usage,
      limit,
      remaining: isPro ? Infinity : remaining,
      upgradeRequired: !isPro && remaining <= 0,
      message: remaining <= 0 ? 'Daily free AI quota reached (20/20). Upgrade to Prarush Pro for unlimited queries.' : 'Available'
    };
  }

  if (featureKey === 'multiModelAccess') {
    return {
      allowed: plan.limits.multiModelAccess,
      upgradeRequired: !plan.limits.multiModelAccess,
      message: 'Access to managed Claude Sonnet, GPT-4o, and Gemini Flash cloud endpoints is planned for Prarush Pro. In local preview mode, configure your personal API keys in the Model Hub.'
    };
  }

  if (featureKey === 'automationWorkflows') {
    return {
      allowed: plan.limits.automationWorkflows > 1 || isPro,
      upgradeRequired: !isPro,
      message: 'Building custom multi-step automation workflows requires Prarush Pro.'
    };
  }

  if (featureKey === 'ocrExtraction') {
    return {
      allowed: plan.limits.ocrExtraction,
      upgradeRequired: !plan.limits.ocrExtraction,
      message: 'OCR document text extraction requires a backend service (planned for Prarush Pro).'
    };
  }

  return { allowed: true, upgradeRequired: false };
}

export function upgradeSubscription(planId = 'pro', billingCycle = 'annual', email = 'user@prarush.ai') {
  const renews = new Date();
  if (billingCycle === 'annual') {
    renews.setFullYear(renews.getFullYear() + 1);
  } else {
    renews.setMonth(renews.getMonth() + 1);
  }

  const sub = {
    planId,
    status: 'active',
    billingCycle,
    email,
    startedAt: new Date().toISOString(),
    renewsAt: renews.toISOString(),
    transactionId: `PRARUSH-TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`
  };

  localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(sub));
  return sub;
}

export function cancelSubscription() {
  const sub = {
    planId: 'free',
    status: 'cancelled',
    billingCycle: 'none',
    startedAt: null,
    renewsAt: null
  };
  localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(sub));
  return sub;
}

// GDPR Article 20: Machine-readable JSON Data Portability Export
export function exportUserDataGDPR(user) {
  const sub = getSubscription();
  const userId = user?.id;
  const workspaces = (userId && localStorage.getItem(`prarush_usr_${userId}_workspaces`)) || localStorage.getItem('prarush_workspaces');
  const tasks = (userId && localStorage.getItem(`prarush_usr_${userId}_tasks`)) || localStorage.getItem('prarush_tasks');
  const notes = (userId && localStorage.getItem(`prarush_usr_${userId}_notes`)) || localStorage.getItem('prarush_notes');
  const docs = (userId && localStorage.getItem(`prarush_usr_${userId}_documents`)) || localStorage.getItem('prarush_documents');
  const events = (userId && localStorage.getItem(`prarush_usr_${userId}_events`)) || localStorage.getItem('prarush_events');
  const automations = (userId && localStorage.getItem(`prarush_usr_${userId}_automations`)) || localStorage.getItem('prarush_automations');
  const kb = (userId && localStorage.getItem(`prarush_usr_${userId}_knowledge`)) || localStorage.getItem('prarush_knowledge');
  const activity = localStorage.getItem('prarush_activity_log');
  const theme = localStorage.getItem('prarush_theme_mode');
  const locale = localStorage.getItem('prarush_locale');

  const exportPayload = {
    platform: 'Prarush Local-First Workspace for Developers & Creators',
    version: '2.0.0-prototype',
    exportSpecification: 'GDPR Article 20 / CCPA Data Portability Format (JSON)',
    exportTimestamp: new Date().toISOString(),
    exportScopeNotice: 'This JSON export contains workspaces, tasks, notes, automations, and document metadata from browser LocalStorage. Binary document files stored in IndexedDB are not embedded in this JSON file.',
    userProfile: user || {
      id: 'usr-guest',
      name: 'Guest User',
      email: 'guest@prarush.local',
      role: 'Guest Scout'
    },
    subscription: sub,
    systemPreferences: {
      theme: theme ? JSON.parse(theme) : 'dark',
      locale: locale ? JSON.parse(locale) : 'en'
    },
    workspaces: workspaces ? JSON.parse(workspaces) : [],
    tasks: tasks ? JSON.parse(tasks) : [],
    notes: notes ? JSON.parse(notes) : [],
    documents: docs ? JSON.parse(docs) : [],
    calendarEvents: events ? JSON.parse(events) : [],
    automations: automations ? JSON.parse(automations) : [],
    knowledgeBase: kb ? JSON.parse(kb) : [],
    activityAuditLog: activity ? JSON.parse(activity) : []
  };

  if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prarush-metadata-export-${user?.id || 'guest'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return exportPayload;
}

// Complete Backup Archive: Bundles full metadata JSON AND all binary files from IndexedDB into a downloadable .zip
export async function exportCompleteBackupZip(user) {
  const userId = user?.id || 'usr-guest';
  const zip = new JSZip();

  // 1. Generate Metadata payload
  const metadata = exportUserDataGDPR(user);
  metadata.exportScopeNotice = 'Full system backup archive containing complete workspace metadata and all uploaded binary files retrieved from IndexedDB.';
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // 2. Retrieve all binary files for this user from IndexedDB
  const files = await getAllFilesForUserFromIndexedDB(userId);
  if (files && files.length > 0) {
    const docsFolder = zip.folder('documents');
    files.forEach((f, idx) => {
      const fileName = f.name || `file_${idx + 1}`;
      if (f.blob) {
        docsFolder.file(fileName, f.blob);
      }
    });
  }

  // 3. Generate .zip Blob and trigger browser download
  if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prarush-complete-backup-${userId}-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { success: true, fileCount: files.length };
}
