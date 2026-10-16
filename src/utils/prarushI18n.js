// Prarush Universal Platform: Multi-Language Internationalization (i18n) Engine
// Supports: English (en), Español (es), Français (fr), 日本語 (ja), Deutsch (de), हिन्दी (hi)

const PRARUSH_LOCALE_KEY = 'prarush_active_locale';

export const PRARUSH_LOCALES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' }
];

export const PRARUSH_TRANSLATIONS = {
  en: {
    brandName: 'Prarush',
    tagline: 'Universal AI Digital Platform',
    commandBarPlaceholder: 'Type a command, ask AI, or search tools (Ctrl+K)...',
    // Navigation
    navDashboard: 'Dashboard',
    navWorkspaces: 'Workspaces',
    navAIAssistant: 'AI Assistant',
    navModelHub: 'AI Model Hub',
    navCreativeStudio: 'Content Studio',
    navKanban: 'Task Board',
    navNotes: 'Rich Notes',
    navDocuments: 'Files & OCR',
    navAutomations: 'AI Automations',
    navKnowledge: 'Knowledge Hub',
    navTemplates: 'Templates',
    navCalendar: 'Calendar',
    navAdmin: 'Admin Console',
    // Actions
    upgradeToPro: 'Upgrade Pro',
    activePlan: 'Current Plan',
    exportData: 'Export Data (GDPR)',
    createNew: 'Create New',
    saveChanges: 'Save Changes',
    search: 'Search',
    filter: 'Filter',
    status: 'Status',
    priority: 'Priority',
    deadline: 'Deadline',
    // Badges
    freeTier: 'FREE',
    proTier: 'PRO ⭐',
    teamTier: 'TEAM 🚀'
  },
  es: {
    brandName: 'Prarush',
    tagline: 'Plataforma Digital Universal con IA',
    commandBarPlaceholder: 'Escribe un comando o busca herramientas (Ctrl+K)...',
    navDashboard: 'Panel Principal',
    navWorkspaces: 'Espacios de Trabajo',
    navAIAssistant: 'Asistente IA',
    navModelHub: 'Centro de Modelos',
    navCreativeStudio: 'Estudio Creativo',
    navKanban: 'Tablero de Tareas',
    navNotes: 'Notas Enriquecidas',
    navDocuments: 'Archivos y OCR',
    navAutomations: 'Automatizaciones',
    navKnowledge: 'Base de Conocimiento',
    navTemplates: 'Plantillas',
    navCalendar: 'Calendario',
    navAdmin: 'Consola de Admin',
    upgradeToPro: 'Mejorar a Pro',
    activePlan: 'Plan Actual',
    exportData: 'Exportar Datos (GDPR)',
    createNew: 'Crear Nuevo',
    saveChanges: 'Guardar Cambios',
    search: 'Buscar',
    filter: 'Filtrar',
    status: 'Estado',
    priority: 'Prioridad',
    deadline: 'Fecha Límite',
    freeTier: 'GRATIS',
    proTier: 'PRO ⭐',
    teamTier: 'EQUIPO 🚀'
  },
  fr: {
    brandName: 'Prarush',
    tagline: 'Plateforme Numérique Universelle IA',
    commandBarPlaceholder: 'Tapez une commande ou cherchez un outil (Ctrl+K)...',
    navDashboard: 'Tableau de Bord',
    navWorkspaces: 'Espaces de Travail',
    navAIAssistant: 'Assistant IA',
    navModelHub: 'Hub de Modèles',
    navCreativeStudio: 'Studio Créatif',
    navKanban: 'Tableau des Tâches',
    navNotes: 'Notes Riches',
    navDocuments: 'Fichiers & OCR',
    navAutomations: 'Automatisations',
    navKnowledge: 'Base de Savoir',
    navTemplates: 'Modèles',
    navCalendar: 'Calendrier',
    navAdmin: 'Console Admin',
    upgradeToPro: 'Passer en Pro',
    activePlan: 'Plan Actif',
    exportData: 'Exporter Données (RGPD)',
    createNew: 'Créer Nouveau',
    saveChanges: 'Enregistrer',
    search: 'Rechercher',
    filter: 'Filtrer',
    status: 'Statut',
    priority: 'Priorité',
    deadline: 'Échéance',
    freeTier: 'GRATUIT',
    proTier: 'PRO ⭐',
    teamTier: 'ÉQUIPE 🚀'
  },
  ja: {
    brandName: 'Prarush',
    tagline: '万能型AI統合デジタルプラットフォーム',
    commandBarPlaceholder: 'コマンド入力またはツール検索 (Ctrl+K)...',
    navDashboard: 'ダッシュボード',
    navWorkspaces: 'ワークスペース',
    navAIAssistant: 'AIアシスタント',
    navModelHub: 'AIモデルハブ',
    navCreativeStudio: 'クリエイティブ工房',
    navKanban: 'タスクボード',
    navNotes: '高機能ノート',
    navDocuments: 'ファイル・OCR',
    navAutomations: 'AI自動化',
    navKnowledge: 'ナレッジベース',
    navTemplates: 'テンプレート集',
    navCalendar: 'カレンダー',
    navAdmin: '管理コンソール',
    upgradeToPro: 'Proにアップグレード',
    activePlan: '現在のご利用プラン',
    exportData: 'データ出力 (GDPR)',
    createNew: '新規作成',
    saveChanges: '変更を保存',
    search: '検索',
    filter: '絞り込み',
    status: '進行状況',
    priority: '優先度',
    deadline: '期限',
    freeTier: '無料プラン',
    proTier: 'PRO ⭐',
    teamTier: 'チーム 🚀'
  },
  de: {
    brandName: 'Prarush',
    tagline: 'Universelle KI-Digitalplattform',
    commandBarPlaceholder: 'Befehl eingeben oder Tools durchsuchen (Strg+K)...',
    navDashboard: 'Dashboard',
    navWorkspaces: 'Arbeitsbereiche',
    navAIAssistant: 'KI-Assistent',
    navModelHub: 'KI-Modell-Hub',
    navCreativeStudio: 'Kreativstudio',
    navKanban: 'Aufgaben-Board',
    navNotes: 'Rich-Notes',
    navDocuments: 'Dateien & OCR',
    navAutomations: 'KI-Automatisierungen',
    navKnowledge: 'Wissens-Hub',
    navTemplates: 'Vorlagen',
    navCalendar: 'Kalender',
    navAdmin: 'Admin-Konsole',
    upgradeToPro: 'Auf Pro upgraden',
    activePlan: 'Aktueller Plan',
    exportData: 'Daten exportieren (DSGVO)',
    createNew: 'Neu erstellen',
    saveChanges: 'Änderungen speichern',
    search: 'Suchen',
    filter: 'Filtern',
    status: 'Status',
    priority: 'Priorität',
    deadline: 'Frist',
    freeTier: 'KOSTENLOS',
    proTier: 'PRO ⭐',
    teamTier: 'TEAM 🚀'
  },
  hi: {
    brandName: 'प्रारुष (Prarush)',
    tagline: 'सार्वभौमिक AI डिजिटल प्लेटफॉर्म',
    commandBarPlaceholder: 'कमांड टाइप करें या टूल खोजें (Ctrl+K)...',
    navDashboard: 'डैशबोर्ड',
    navWorkspaces: 'कार्यक्षेत्र (Workspaces)',
    navAIAssistant: 'AI सहायक',
    navModelHub: 'AI मॉडल हब',
    navCreativeStudio: 'कंटेंट स्टूडियो',
    navKanban: 'टास्क बोर्ड',
    navNotes: 'स्मार्ट नोट्स',
    navDocuments: 'दस्तावेज़ और OCR',
    navAutomations: 'AI ऑटोमेशन',
    navKnowledge: 'ज्ञान केंद्र (Knowledge)',
    navTemplates: 'टेम्प्लेट',
    navCalendar: 'कैलेंडर',
    navAdmin: 'व्यवस्थापक कंसोल (Admin)',
    upgradeToPro: 'प्रो में अपग्रेड करें',
    activePlan: 'वर्तमान प्लान',
    exportData: 'डेटा निर्यात (GDPR JSON)',
    createNew: 'नया बनाएँ',
    saveChanges: 'सुरक्षित करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    status: 'स्थिति',
    priority: 'प्राथमिकता',
    deadline: 'समय सीमा',
    freeTier: 'मुफ़्त',
    proTier: 'PRO ⭐',
    teamTier: 'टीम 🚀'
  }
};

export function getActivePrarushLocale() {
  try {
    return localStorage.getItem(PRARUSH_LOCALE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function setActivePrarushLocale(code) {
  try {
    localStorage.setItem(PRARUSH_LOCALE_KEY, code);
  } catch {}
}

export function tPrarush(key, localeOverride) {
  const locale = localeOverride || getActivePrarushLocale();
  const dict = PRARUSH_TRANSLATIONS[locale] || PRARUSH_TRANSLATIONS.en;
  return dict[key] || PRARUSH_TRANSLATIONS.en[key] || key;
}
