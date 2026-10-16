// Internationalization (i18n) Engine for City Life Global Urban Platform
// Supports: English (en), Spanish (es), French (fr), Japanese (ja), German (de), Hindi (hi)

const LOCALE_KEY = 'citylife_active_locale';

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' }
];

export const TRANSLATIONS = {
  en: {
    // Navigation
    navExplore: 'Explore',
    navHistory: 'History',
    navMap: 'Map View',
    navSafety: 'SafeRoute',
    navCompare: 'Compare',
    navPulse: 'City Pulse',
    // Header
    searchWorld: 'Search World',
    detectGps: 'Auto-Detect GPS',
    aiCopilot: 'AI Copilot',
    guardian: 'Night Guardian',
    phrasebook: 'Phrasebook',
    upgradePro: 'Upgrade Pro',
    proBadge: 'PRO ⭐',
    sosAlert: 'Emergency SOS',
    // Explore View
    heroTitle: 'Global Urban Intelligence',
    heroSubtitle: 'Real-time telemetry, live weather, verified landmarks & safe navigation',
    viewSplit: 'Split',
    viewMap: 'Map Only',
    viewList: 'List Only',
    offlinePackDownload: 'Download City Pack',
    offlinePackCached: 'Offline Pack Ready',
    // SafeRoute
    safeRouteTitle: 'SafeRoute AI Navigator',
    fastestRoute: 'Fastest Path',
    safestRoute: 'Safest Path',
    avoidAlleys: 'Avoid Low-Light Alleys',
    bypassRoadwork: 'Bypass Roadworks',
    policeBuffer: 'Police Buffer Zones',
    // Common
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    free: 'Free',
    pro: 'Pro'
  },
  es: {
    navExplore: 'Explorar',
    navHistory: 'Historia',
    navMap: 'Mapa',
    navSafety: 'Ruta Segura',
    navCompare: 'Comparar',
    navPulse: 'Pulso Urbano',
    searchWorld: 'Buscar Ciudad',
    detectGps: 'Detectar GPS',
    aiCopilot: 'Copiloto IA',
    guardian: 'Guardián Nocturno',
    phrasebook: 'Frases de Emergencia',
    upgradePro: 'Mejorar a Pro',
    proBadge: 'PRO ⭐',
    sosAlert: 'SOS de Emergencia',
    heroTitle: 'Inteligencia Urbana Global',
    heroSubtitle: 'Telemetría en tiempo real, clima en vivo, monumentos y rutas seguras',
    viewSplit: 'Dividido',
    viewMap: 'Solo Mapa',
    viewList: 'Solo Lista',
    offlinePackDownload: 'Descargar Mapa Offline',
    offlinePackCached: 'Mapa Offline Listo',
    safeRouteTitle: 'Navegador Seguro IA',
    fastestRoute: 'Ruta Rápida',
    safestRoute: 'Ruta Segura',
    avoidAlleys: 'Evitar Callejones Oscuros',
    bypassRoadwork: 'Evitar Obras en Calles',
    policeBuffer: 'Zonas con Patrullaje',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    free: 'Gratis',
    pro: 'Pro'
  },
  fr: {
    navExplore: 'Explorer',
    navHistory: 'Histoire',
    navMap: 'Carte',
    navSafety: 'Itinéraire Sûr',
    navCompare: 'Comparer',
    navPulse: 'Pouls Urbain',
    searchWorld: 'Chercher Ville',
    detectGps: 'Détecter GPS',
    aiCopilot: 'Copilote IA',
    guardian: 'Gardien de Nuit',
    phrasebook: 'Guide Vocabulaire',
    upgradePro: 'Passer en Pro',
    proBadge: 'PRO ⭐',
    sosAlert: 'Alerte SOS',
    heroTitle: 'Intelligence Urbaine Mondiale',
    heroSubtitle: 'Télémétrie en direct, météo en temps réel, monuments et navigation sécurisée',
    viewSplit: 'Partagé',
    viewMap: 'Carte Seule',
    viewList: 'Liste Seule',
    offlinePackDownload: 'Télécharger Carte Hors-ligne',
    offlinePackCached: 'Carte Hors-ligne Prête',
    safeRouteTitle: 'Navigateur Itinéraire Sûr',
    fastestRoute: 'Plus Rapide',
    safestRoute: 'Plus Sûr',
    avoidAlleys: 'Éviter Rues Sombres',
    bypassRoadwork: 'Contourner Travaux',
    policeBuffer: 'Zones Sécurisées',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    close: 'Fermer',
    free: 'Gratuit',
    pro: 'Pro'
  },
  ja: {
    navExplore: '探索',
    navHistory: '歴史・文化',
    navMap: 'マップ',
    navSafety: '安全ルート',
    navCompare: 'エリア比較',
    navPulse: '都市ライブ',
    searchWorld: '世界を検索',
    detectGps: '現在地GPS',
    aiCopilot: 'AIアシスタント',
    guardian: '夜道ガーディアン',
    phrasebook: '緊急フレーズ集',
    upgradePro: 'Proにアップグレード',
    proBadge: 'PRO ⭐',
    sosAlert: '緊急SOS',
    heroTitle: 'グローバル都市インテリジェンス',
    heroSubtitle: 'リアルタイム天気・AQI、観光名所案内、夜間安全ナビゲーション',
    viewSplit: '分割表示',
    viewMap: 'マップのみ',
    viewList: 'リストのみ',
    offlinePackDownload: 'オフライン地図を保存',
    offlinePackCached: 'オフライン準備完了',
    safeRouteTitle: 'SafeRoute AI ナビ',
    fastestRoute: '最速ルート',
    safestRoute: '最安全ルート',
    avoidAlleys: '暗い路地を回避',
    bypassRoadwork: '道路工事を回避',
    policeBuffer: '交番・パトロール優先',
    cancel: 'キャンセル',
    confirm: '確認',
    close: '閉じる',
    free: '無料',
    pro: 'Pro'
  },
  de: {
    navExplore: 'Entdecken',
    navHistory: 'Geschichte',
    navMap: 'Karte',
    navSafety: 'Sichere Route',
    navCompare: 'Vergleich',
    navPulse: 'Stadtpuls',
    searchWorld: 'Weltweit suchen',
    detectGps: 'GPS ermitteln',
    aiCopilot: 'KI-Kopilot',
    guardian: 'Nacht-Wächter',
    phrasebook: 'Notfall-Phrasen',
    upgradePro: 'Auf Pro upgraden',
    proBadge: 'PRO ⭐',
    sosAlert: 'Notruf SOS',
    heroTitle: 'Globale Stadt-Intelligenz',
    heroSubtitle: 'Echtzeit-Telemetrie, Live-Wetter, Sehenswürdigkeiten & sichere Fußwege',
    viewSplit: 'Geteilt',
    viewMap: 'Nur Karte',
    viewList: 'Nur Liste',
    offlinePackDownload: 'Offline-Karte laden',
    offlinePackCached: 'Offline-Karte bereit',
    safeRouteTitle: 'Sicherer KI-Navigator',
    fastestRoute: 'Schnellste Route',
    safestRoute: 'Sicherste Route',
    avoidAlleys: 'Dunkle Gassen meiden',
    bypassRoadwork: 'Baustellen umgehen',
    policeBuffer: 'Polizeipufferzonen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    close: 'Schließen',
    free: 'Kostenlos',
    pro: 'Pro'
  },
  hi: {
    navExplore: 'खोजें',
    navHistory: 'इतिहास',
    navMap: 'मानचित्र',
    navSafety: 'सुरक्षित मार्ग',
    navCompare: 'तुलना',
    navPulse: 'सिटी पल्स',
    searchWorld: 'शहर खोजें',
    detectGps: 'मेरा GPS',
    aiCopilot: 'AI साथी',
    guardian: 'नाइट गार्डियन',
    phrasebook: 'आपातकालीन वाक्यांश',
    upgradePro: 'प्रो में अपग्रेड करें',
    proBadge: 'PRO ⭐',
    sosAlert: 'आपातकालीन सायरन',
    heroTitle: 'वैश्विक शहरी मार्गदर्शन',
    heroSubtitle: 'लाइव मौसम, वायु गुणवत्ता (AQI), ऐतिहासिक स्थल और सुरक्षित पैदल मार्ग',
    viewSplit: 'विभाजित',
    viewMap: 'केवल मानचित्र',
    viewList: 'केवल सूची',
    offlinePackDownload: 'ऑफ़लाइन मैप पैक डाउनलोड करें',
    offlinePackCached: 'ऑफ़लाइन पैक तैयार',
    safeRouteTitle: 'सुरक्षित रूट AI',
    fastestRoute: 'सबसे तेज़ रास्ता',
    safestRoute: 'सबसे सुरक्षित रास्ता',
    avoidAlleys: 'अंधेरी गलियों से बचें',
    bypassRoadwork: 'सड़क निर्माण से बचें',
    policeBuffer: 'पुलिस गश्ती क्षेत्र',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    close: 'बंद करें',
    free: 'मुफ़्त',
    pro: 'प्रो'
  }
};

export function getActiveLocale() {
  try {
    return localStorage.getItem(LOCALE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function setActiveLocale(code) {
  try {
    localStorage.setItem(LOCALE_KEY, code);
  } catch {
    // ignore
  }
}

export function t(key, localeOverride) {
  const locale = localeOverride || getActiveLocale();
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}
