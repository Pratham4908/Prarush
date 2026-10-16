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
    description: 'Essential AI capabilities and productivity tools for students and casual creators.',
    features: [
      '20 AI queries per day (Prarush Neural-4 & Llama 3)',
      'Up to 2 active workspaces',
      'Kanban task manager & basic notes editor',
      'Community template browsing',
      '500 MB file & document storage',
      'Standard processing priority'
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
    name: 'Prarush Pro',
    priceMonthly: 12,
    priceAnnual: 96, // $8/mo, ~33% discount
    badge: 'PRO ⭐',
    badgeColor: '#06b6d4',
    description: 'Ultimate power tools for developers, researchers, creators, and power users.',
    features: [
      'Unlimited AI queries across Claude 3.5, GPT-4o, Gemini 1.5 & Neural-4',
      'Unlimited workspaces (Personal, Study, Work, Creator, Business)',
      'AI Automation Studio (Visual multi-step workflow runner)',
      'AI Image Generator & Presentation Deck Creator',
      'Document OCR text extraction, PDF analysis & file compression',
      '50 GB secure cloud storage',
      'Priority GPU compute & sub-50ms latency',
      'Code Studio with syntax highlighting & run simulation'
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
    name: 'Prarush Team',
    priceMonthly: 29,
    priceAnnual: 276, // $23/seat/mo
    badge: 'ENTERPRISE 🚀',
    badgeColor: '#f59e0b',
    description: 'Shared intelligence, organizational audit logs, and collaborative automation for teams.',
    features: [
      'Everything in Prarush Pro',
      'Shared team workspaces & collaborative task boards',
      'Role-based access control (Admin, Editor, Viewer)',
      'Organizational audit logs & security telemetry',
      'Custom webhook bridges (GitHub, Slack, Jira)',
      '500 GB pooled team storage',
      'Dedicated SLA & 99.9% uptime guarantee'
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
      message: 'Access to Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro requires Prarush Pro.'
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
      message: 'OCR document text extraction requires Prarush Pro.'
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
  const tasks = localStorage.getItem('prarush_tasks');
  const notes = localStorage.getItem('prarush_notes');
  const docs = localStorage.getItem('prarush_documents');
  const automations = localStorage.getItem('prarush_automations');
  const kb = localStorage.getItem('prarush_knowledge');

  const exportPayload = {
    platform: 'Prarush Universal AI Digital Platform',
    version: '2.0.0-production',
    exportTimestamp: new Date().toISOString(),
    userProfile: user || { role: 'Guest Scout' },
    subscription: sub,
    workspacesData: {
      tasks: tasks ? JSON.parse(tasks) : [],
      notes: notes ? JSON.parse(notes) : [],
      documents: docs ? JSON.parse(docs) : [],
      automations: automations ? JSON.parse(automations) : [],
      knowledgeBase: kb ? JSON.parse(kb) : []
    }
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prarush-gdpr-data-export-${user?.id || 'guest'}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
