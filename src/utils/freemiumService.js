// Freemium & Subscription Entitlement Service for City Life
// Handles Free vs Scout Pro tiers, feature gating, usage quotas, payment simulation, and offline pack management.

const SUBSCRIPTION_KEY = 'citylife_subscription_data';
const USAGE_KEY = 'citylife_daily_feature_usage';
const OFFLINE_PACKS_KEY = 'citylife_downloaded_offline_packs';

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Scout',
    priceMonthly: 0,
    priceAnnual: 0,
    badge: 'FREE',
    badgeColor: '#94a3b8',
    features: [
      'Standard Interactive Map & POIs',
      'Real-time Weather & AQI Telemetry',
      'Basic SafeRoute Navigation',
      'Standard AI Urban Copilot (10 queries/day)',
      'Night Walk Guardian (3 alerts/session)',
      'Standard Audio Guides (Web Speech)'
    ],
    limits: {
      aiQueriesPerDay: 10,
      guardianAlertsPerSession: 3,
      offlinePacks: 0,
      advancedHazardAvoidance: false,
      studioAudioGuides: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'Scout Pro',
    priceMonthly: 9.99,
    priceAnnual: 79.99, // ~33% discount
    badge: 'PRO ⭐',
    badgeColor: '#f59e0b',
    features: [
      'Everything in Free Plan',
      'Offline City Pack Downloads (Map & POI Cache)',
      'Advanced SafeRoute Hazard Avoidance (Crime, Low-Light, Roadwork)',
      'Unlimited Night Walk Guardian SMS & Live Ping Broadcasts',
      'Studio High-Fidelity Voice Narration Guides',
      'Unlimited Urban AI Copilot with Multi-Stop Itineraries',
      'Verified Scout Pro Gold Badge on Citizen Reports'
    ],
    limits: {
      aiQueriesPerDay: Infinity,
      guardianAlertsPerSession: Infinity,
      offlinePacks: Infinity,
      advancedHazardAvoidance: true,
      studioAudioGuides: true
    }
  }
};

export function getSubscription() {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) {
      return {
        planId: 'free',
        status: 'active',
        billingCycle: 'none',
        renewsAt: null,
        startedAt: null
      };
    }
    const data = JSON.parse(raw);
    // Check if expired
    if (data.renewsAt && new Date(data.renewsAt).getTime() < Date.now()) {
      return {
        planId: 'free',
        status: 'expired',
        billingCycle: 'none',
        renewsAt: null,
        startedAt: null
      };
    }
    return data;
  } catch {
    return { planId: 'free', status: 'active', billingCycle: 'none' };
  }
}

export function isProSubscriber() {
  const sub = getSubscription();
  return sub.planId === 'pro' && sub.status === 'active';
}

export function getFeatureAccess(featureKey) {
  const isPro = isProSubscriber();
  const plan = isPro ? PLANS.PRO : PLANS.FREE;

  switch (featureKey) {
    case 'offlinePacks':
      return {
        allowed: isPro,
        remaining: isPro ? Infinity : 0,
        upgradeRequired: !isPro,
        message: 'Offline City Packs require a Scout Pro membership.'
      };
    case 'advancedHazardAvoidance':
      return {
        allowed: isPro,
        upgradeRequired: !isPro,
        message: 'Advanced hazard avoidance filtering is a Scout Pro feature.'
      };
    case 'studioAudio':
      return {
        allowed: isPro,
        upgradeRequired: !isPro,
        message: 'Studio HD audio guide narration requires Scout Pro.'
      };
    case 'guardianAlerts': {
      const usage = getUsage('guardianAlerts');
      const limit = plan.limits.guardianAlertsPerSession;
      const remaining = Math.max(0, limit - usage);
      return {
        allowed: remaining > 0 || isPro,
        remaining: isPro ? Infinity : remaining,
        limit,
        upgradeRequired: remaining <= 0 && !isPro,
        message: remaining <= 0 ? 'You reached your free session alert limit. Upgrade for unlimited Guardian pings.' : 'Available'
      };
    }
    case 'aiQueries': {
      const usage = getUsage('aiQueries');
      const limit = plan.limits.aiQueriesPerDay;
      const remaining = Math.max(0, limit - usage);
      return {
        allowed: remaining > 0 || isPro,
        remaining: isPro ? Infinity : remaining,
        limit,
        upgradeRequired: remaining <= 0 && !isPro,
        message: remaining <= 0 ? 'Daily free AI quota reached. Upgrade for unlimited queries.' : 'Available'
      };
    }
    default:
      return { allowed: true, upgradeRequired: false };
  }
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function getUsage(featureKey) {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return 0;
    const store = JSON.parse(raw);
    const today = getTodayString();
    if (store.date !== today) return 0;
    return store.counts?.[featureKey] || 0;
  } catch {
    return 0;
  }
}

export function incrementUsage(featureKey) {
  try {
    const today = getTodayString();
    let store = { date: today, counts: {} };
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        store = parsed;
      }
    }
    store.counts[featureKey] = (store.counts[featureKey] || 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(store));
    return store.counts[featureKey];
  } catch {
    return 1;
  }
}

export function upgradeToPro({ billingCycle = 'annual', paymentMethod = 'credit_card', email = '' }) {
  const oneYearFromNow = new Date();
  if (billingCycle === 'annual') {
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  } else {
    oneYearFromNow.setMonth(oneYearFromNow.getMonth() + 1);
  }

  const sub = {
    planId: 'pro',
    status: 'active',
    billingCycle,
    paymentMethod,
    customerEmail: email,
    startedAt: new Date().toISOString(),
    renewsAt: oneYearFromNow.toISOString(),
    transactionId: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`
  };

  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return sub;
}

export function cancelProSubscription() {
  const sub = {
    planId: 'free',
    status: 'cancelled',
    billingCycle: 'none',
    startedAt: null,
    renewsAt: null
  };
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return sub;
}

// Download & store Offline City Pack in LocalStorage/Cache
export function downloadCityOfflinePack(cityName, coords) {
  try {
    const raw = localStorage.getItem(OFFLINE_PACKS_KEY);
    const packs = raw ? JSON.parse(raw) : [];
    const packId = `pack-${cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const newPack = {
      id: packId,
      cityName,
      coords,
      downloadedAt: new Date().toISOString(),
      sizeMB: (Math.random() * 8 + 12).toFixed(1), // ~12-20 MB simulated tile/vector cache
      status: 'cached'
    };

    const existingIndex = packs.findIndex(p => p.id === packId);
    if (existingIndex >= 0) {
      packs[existingIndex] = newPack;
    } else {
      packs.push(newPack);
    }

    localStorage.setItem(OFFLINE_PACKS_KEY, JSON.stringify(packs));
    return newPack;
  } catch {
    return null;
  }
}

export function getDownloadedPacks() {
  try {
    const raw = localStorage.getItem(OFFLINE_PACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// GDPR User Data Export Utility (Downloads full JSON of user profile, saved places, reports)
export function exportUserDataJson(user) {
  const sub = getSubscription();
  const reports = localStorage.getItem('city_citizen_reports');
  const savedSpots = localStorage.getItem('city_saved_spots');
  const offlinePacks = getDownloadedPacks();

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    application: 'City Life Global Urban Platform',
    version: '2.0.0-production',
    userProfile: user || { role: 'Guest Scout' },
    subscription: sub,
    savedSpots: savedSpots ? JSON.parse(savedSpots) : [],
    submittedCitizenReports: reports ? JSON.parse(reports) : [],
    downloadedPacks: offlinePacks
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `citylife-user-data-${user?.id || 'guest'}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
