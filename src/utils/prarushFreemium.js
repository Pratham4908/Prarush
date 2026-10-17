import JSZip from 'jszip';
import { getAllFilesForUserFromIndexedDB, saveFileToIndexedDB } from './indexedDbStore.js';
import { logActivity } from './prarushStore.js';

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

export function getSubscription(userId = null) {
  try {
    const targetUserId = userId ? String(userId).trim() : null;
    let raw = null;
    if (targetUserId) {
      raw = localStorage.getItem(`prarush_usr_${targetUserId}_subscription`);
    }
    if (!raw) {
      raw = localStorage.getItem(SUB_STORAGE_KEY);
    }
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

export function isProSubscriber(userId = null) {
  const sub = getSubscription(userId);
  return (sub.planId === 'pro' || sub.planId === 'team') && sub.status === 'active';
}

export function isTeamSubscriber(userId = null) {
  const sub = getSubscription(userId);
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

export function upgradeSubscription(planId = 'pro', billingCycle = 'annual', email = 'user@prarush.ai', userId = null) {
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

  const targetUserId = userId ? String(userId).trim() : null;
  if (targetUserId) {
    localStorage.setItem(`prarush_usr_${targetUserId}_subscription`, JSON.stringify(sub));
  }
  localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(sub));
  return sub;
}

export function cancelSubscription(userId = null) {
  const sub = {
    planId: 'free',
    status: 'cancelled',
    billingCycle: 'none',
    startedAt: null,
    renewsAt: null
  };
  const targetUserId = userId ? String(userId).trim() : null;
  if (targetUserId) {
    localStorage.setItem(`prarush_usr_${targetUserId}_subscription`, JSON.stringify(sub));
  }
  localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(sub));
  return sub;
}

// Build Machine-readable JSON Data Portability Payload without triggering browser download
export function buildUserDataGDPRPayload(user) {
  const userId = user?.id || 'usr-guest';
  const sub = getSubscription(userId);
  
  // Strict Profile Scoping: Only retrieve keys strictly scoped to this user profile.
  // Never fall back to unpartitioned legacy keys which could leak another profile's data.
  const userPrefix = `prarush_usr_${userId}_`;
  const workspaces = localStorage.getItem(`${userPrefix}workspaces`);
  const tasks = localStorage.getItem(`${userPrefix}tasks`);
  const notes = localStorage.getItem(`${userPrefix}notes`);
  const docs = localStorage.getItem(`${userPrefix}documents`);
  const events = localStorage.getItem(`${userPrefix}events`);
  const automations = localStorage.getItem(`${userPrefix}automations`);
  const kb = localStorage.getItem(`${userPrefix}knowledge`);
  const activity = localStorage.getItem(`${userPrefix}activity_log`);
  const theme = localStorage.getItem('prarush_theme_mode');
  const locale = localStorage.getItem('prarush_locale');

  return {
    platform: 'Prarush Local-First Workspace for Developers & Creators',
    version: '2.0.0-prototype',
    exportSpecification: 'GDPR Article 20 / CCPA Data Portability Format (JSON)',
    exportTimestamp: new Date().toISOString(),
    exportScopeNotice: 'This JSON export contains workspaces, tasks, notes, automations, activity logs, and document metadata strictly scoped to this local profile. Binary document files stored in IndexedDB are not embedded in this JSON file.',
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
}

// GDPR Article 20: Machine-readable JSON Data Portability Export (triggers download)
export function exportUserDataGDPR(user) {
  const exportPayload = buildUserDataGDPRPayload(user);

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

// Complete Backup Archive: Bundles full metadata JSON AND all binary files from IndexedDB into a single downloadable .zip
// Uses a collision-proof Set while-loop for deduplicating final archive paths.
export async function exportCompleteBackupZip(user) {
  const userId = user?.id || 'usr-guest';
  const zip = new JSZip();

  // 1. Generate Metadata payload strictly for this user (without downloading JSON)
  const metadata = buildUserDataGDPRPayload(user);
  metadata.exportScopeNotice = 'Full system backup archive containing complete workspace metadata and all uploaded binary files retrieved from IndexedDB for this user profile.';
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // 2. Retrieve all binary files for this user from IndexedDB
  const result = await getAllFilesForUserFromIndexedDB(userId);
  if (!result || !result.success) {
    const errMsg = result?.error || 'Failed to read files from IndexedDB.';
    console.error('Backup aborted:', errMsg);
    return { success: false, error: errMsg };
  }

  const files = result.files || [];
  if (files.length > 0) {
    const docsFolder = zip.folder('documents');
    const finalArchivePaths = new Set();

    for (const f of files) {
      if (!f.blob) {
        return {
          success: false,
          error: `Document "${f.name || f.id}" could not be read from storage. Backup aborted to prevent incomplete backup.`
        };
      }

      const rawName = (f.name || `file_${f.id}`).trim();
      const dotIdx = rawName.lastIndexOf('.');
      const baseName = dotIdx > 0 ? rawName.slice(0, dotIdx) : rawName;
      const ext = dotIdx > 0 ? rawName.slice(dotIdx) : '';

      let candidateName = rawName;
      let counter = 2;
      // Collision-proof loop: checks final candidate against set of all paths already added
      while (finalArchivePaths.has(candidateName.toLowerCase())) {
        candidateName = `${baseName}_${counter}${ext}`;
        counter++;
      }

      finalArchivePaths.add(candidateName.toLowerCase());
      docsFolder.file(candidateName, f.blob);
    }
  }

  // 3. Generate .zip Blob
  let zipBlob = null;
  if (typeof zip.generateAsync === 'function') {
    zipBlob = await zip.generateAsync({ type: 'blob' });
  }

  // Trigger single browser download if document & URL are available
  if (typeof document !== 'undefined' && typeof URL !== 'undefined' && zipBlob) {
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prarush-complete-backup-${userId}-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { success: true, fileCount: files.length, zipBlob, zip };
}

// Validate a backup zip file before restoring
export async function validateBackupZip(zipBlobOrFile) {
  try {
    if (!zipBlobOrFile) {
      return { valid: false, error: 'No backup file provided.' };
    }

    const zip = await JSZip.loadAsync(zipBlobOrFile);
    const metadataFile = zip.file('metadata.json');
    if (!metadataFile) {
      return { 
        valid: false, 
        error: 'Invalid archive: Missing required "metadata.json" root manifest.' 
      };
    }

    const metadataText = await metadataFile.async('text');
    let metadata;
    try {
      metadata = JSON.parse(metadataText);
    } catch {
      return { valid: false, error: 'Invalid archive: Corrupted "metadata.json" format.' };
    }

    if (!metadata.platform || !metadata.platform.includes('Prarush')) {
      return {
        valid: false,
        error: 'Incompatible archive: The archive was not created by Prarush.'
      };
    }

    // Inspect documents folder
    const binaryFiles = [];
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (relativePath.startsWith('documents/') && !zipEntry.dir) {
        const fileName = relativePath.replace(/^documents\//, '');
        if (fileName) {
          const blob = await zipEntry.async('blob');
          binaryFiles.push({
            name: fileName,
            path: relativePath,
            size: blob.size,
            blob
          });
        }
      }
    }

    return {
      valid: true,
      metadata,
      sourceUser: metadata.userProfile || { name: 'Unknown User' },
      exportTimestamp: metadata.exportTimestamp,
      workspaceCount: metadata.workspaces?.length || 0,
      taskCount: metadata.tasks?.length || 0,
      noteCount: metadata.notes?.length || 0,
      documentCount: metadata.documents?.length || 0,
      eventCount: metadata.calendarEvents?.length || 0,
      automationCount: metadata.automations?.length || 0,
      binaryFiles
    };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to inspect backup archive: ${err.message || 'Corrupted ZIP file'}`
    };
  }
}

// Restore validated backup into target user profile with conflict handling
export async function restoreCompleteBackupZip(zipBlobOrFile, targetUser, { conflictStrategy = 'merge' } = {}) {
  const validation = await validateBackupZip(zipBlobOrFile);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const userId = targetUser?.id || 'usr-guest';
  const userPrefix = `prarush_usr_${userId}_`;
  const meta = validation.metadata;

  try {
    // 1. Process Scoped Datasets
    const datasets = [
      { key: 'workspaces', data: meta.workspaces || [] },
      { key: 'tasks', data: meta.tasks || [] },
      { key: 'notes', data: meta.notes || [] },
      { key: 'documents', data: meta.documents || [] },
      { key: 'events', data: meta.calendarEvents || [] },
      { key: 'automations', data: meta.automations || [] },
      { key: 'knowledge', data: meta.knowledgeBase || [] }
    ];

    for (const { key, data } of datasets) {
      const storageKey = `${userPrefix}${key}`;
      if (conflictStrategy === 'overwrite') {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        // Merge: keep existing items, append or update with backup items
        let existing = [];
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) existing = JSON.parse(raw);
        } catch {}
        
        const existingMap = new Map(existing.map(item => [item.id, item]));
        for (const item of data) {
          existingMap.set(item.id, item);
        }
        localStorage.setItem(storageKey, JSON.stringify(Array.from(existingMap.values())));
      }
    }

    // Restore subscription if present
    if (meta.subscription) {
      localStorage.setItem(`${userPrefix}subscription`, JSON.stringify(meta.subscription));
    }

    // 2. Restore Binary Files to IndexedDB
    let restoredFilesCount = 0;

    if (validation.binaryFiles && validation.binaryFiles.length > 0) {
      const docsMeta = meta.documents || [];
      for (const bFile of validation.binaryFiles) {
        const docRecord = docsMeta.find(d => d.name === bFile.name || d.name === bFile.name.replace(/_\d+(\.[^.]+)?$/, '$1'));
        const docId = docRecord ? docRecord.id : `restored-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const saved = await saveFileToIndexedDB(docId, bFile.blob, userId);
        if (saved) restoredFilesCount++;
      }
    }

    // Log the restore activity
    try {
      logActivity(
        'Restore Complete Backup',
        `Restored ${validation.workspaceCount} workspaces, ${validation.taskCount} tasks, and ${restoredFilesCount} files via ${conflictStrategy} mode.`,
        'ws-work',
        userId
      );
    } catch {}

    return {
      success: true,
      restoredWorkspaces: validation.workspaceCount,
      restoredTasks: validation.taskCount,
      restoredNotes: validation.noteCount,
      restoredFiles: restoredFilesCount,
      strategyUsed: conflictStrategy
    };
  } catch (err) {
    return {
      success: false,
      error: `Restore operation failed: ${err.message || 'Storage write error'}`
    };
  }
}
