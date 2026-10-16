// City Life App: Comprehensive Automated Verification Test Suite
import fs from 'fs';
import path from 'path';

// Polyfill localStorage for node environment
if (typeof localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { CITIES, EXPLORE_SPOTS } from './data/cityData.js';
import { HERITAGE_SITES, CULTURAL_ETIQUETTE_GUIDE } from './data/historyCultureData.js';
import { SAFETY_INCIDENTS, ROUTE_OPTIONS, EMERGENCY_CONTACTS } from './data/safetyData.js';
import { NEIGHBORHOOD_BENCHMARKS, COMPARISON_METRIC_CONFIG } from './data/placesComparisonData.js';
import { TRAFFIC_CORRIDORS, WEATHER_ALERTS, INITIAL_CITIZEN_REPORTS, SOCIAL_BUZZ_STREAM } from './data/pulseData.js';
import { processCityAIQuery, analyzeCitizenReport } from './utils/aiEngine.js';
import { 
  PLANS, 
  getSubscription, 
  isProSubscriber, 
  getFeatureAccess, 
  upgradeToPro, 
  cancelProSubscription, 
  downloadCityOfflinePack, 
  getDownloadedPacks 
} from './utils/freemiumService.js';
import { SUPPORTED_LOCALES, TRANSLATIONS, t } from './utils/i18n.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TEST SUITE: City Life App Core Requirements ---');

// 1. Exploration & Hospitality
console.log('\n[1] Testing Exploration & Hospitality:');
assert(CITIES.length >= 3, `Expected at least 3 global metropolitan hubs, found ${CITIES.length}`);
assert(EXPLORE_SPOTS.length >= 7, `Expected at least 7 curated spots, found ${EXPLORE_SPOTS.length}`);
const budgetSpots = EXPLORE_SPOTS.filter(s => s.isBudgetPick);
assert(budgetSpots.length >= 3, `Expected at least 3 budget picks, found ${budgetSpots.length}`);
const foodSpots = EXPLORE_SPOTS.filter(s => s.category === 'food');
assert(foodSpots.length >= 2, `Expected at least 2 food gems, found ${foodSpots.length}`);
EXPLORE_SPOTS.forEach(spot => {
  assert(spot.coords && spot.coords.length === 2, `Spot ${spot.name} has valid coordinates`);
  assert(spot.safetyScore >= 0 && spot.safetyScore <= 100, `Spot ${spot.name} safety score is within 0-100`);
  assert(spot.insiderTip && spot.insiderTip.length > 5, `Spot ${spot.name} contains insider local tips`);
});

// 2. History & Culture
console.log('\n[2] Testing History & Culture:');
assert(HERITAGE_SITES.length >= 3, `Expected at least 3 heritage sites, found ${HERITAGE_SITES.length}`);
HERITAGE_SITES.forEach(site => {
  assert(site.audioGuide && site.audioGuide.transcript.length > 20, `Heritage site ${site.name} has audio guide transcript`);
  assert(site.traditions && site.traditions.length > 0, `Heritage site ${site.name} has living cultural traditions`);
  assert(site.dosAndDonts && site.dosAndDonts.length >= 2, `Heritage site ${site.name} has etiquette dos and don'ts`);
});
assert(CULTURAL_ETIQUETTE_GUIDE.length >= 4, `Expected at least 4 etiquette topics, found ${CULTURAL_ETIQUETTE_GUIDE.length}`);

// 3. Safety & Security
console.log('\n[3] Testing Safety & Security:');
assert(SAFETY_INCIDENTS.length >= 5, `Expected at least 5 safety incidents/havens, found ${SAFETY_INCIDENTS.length}`);
assert(ROUTE_OPTIONS.fastestRoute && ROUTE_OPTIONS.safestRoute, 'Dual routes (Fastest vs Safest) configured');
assert(ROUTE_OPTIONS.safestRoute.safetyScore > ROUTE_OPTIONS.fastestRoute.safetyScore, 'SafeRoute AI safety score exceeds fastest path');
assert(ROUTE_OPTIONS.safestRoute.waypoints.length >= 3, 'SafeRoute has verified GPS waypoints');
assert(EMERGENCY_CONTACTS.length >= 4, 'At least 4 emergency hotlines present');

// 4. Best vs Worst Places Comparator
console.log('\n[4] Testing Best vs Worst Places:');
assert(NEIGHBORHOOD_BENCHMARKS.length >= 5, `Expected at least 5 neighborhood benchmarks, found ${NEIGHBORHOOD_BENCHMARKS.length}`);
assert(COMPARISON_METRIC_CONFIG.length === 6, 'All 6 comparison radar dimensions configured');
NEIGHBORHOOD_BENCHMARKS.forEach(nb => {
  COMPARISON_METRIC_CONFIG.forEach(cfg => {
    const val = nb.metrics[cfg.key];
    assert(typeof val === 'number' && val >= 0 && val <= 100, `District ${nb.name} metric ${cfg.key} is within 0-100 (${val})`);
  });
  assert(nb.pros.length > 0 && nb.cons.length > 0, `District ${nb.name} has balanced pros and cons`);
});

// 5. Smart City Insights & Live Telemetry
console.log('\n[5] Testing Smart City Insights:');
assert(TRAFFIC_CORRIDORS.length >= 4, `Expected at least 4 traffic corridors, found ${TRAFFIC_CORRIDORS.length}`);
assert(WEATHER_ALERTS.length >= 2, `Expected at least 2 weather alerts, found ${WEATHER_ALERTS.length}`);
assert(INITIAL_CITIZEN_REPORTS.length >= 4, `Expected at least 4 citizen reports, found ${INITIAL_CITIZEN_REPORTS.length}`);
const voiceReports = INITIAL_CITIZEN_REPORTS.filter(r => r.hasVoiceNote);
assert(voiceReports.length >= 2, `Expected at least 2 voice memo reports, found ${voiceReports.length}`);
assert(SOCIAL_BUZZ_STREAM.length >= 4, `Expected at least 4 social buzz shouts, found ${SOCIAL_BUZZ_STREAM.length}`);

// 6. AI/ML NLP Intelligence Engine
console.log('\n[6] Testing UrbanSense AI NLP Engine:');
const safetyQueryRes = processCityAIQuery('Is it safe to walk at night?');
assert(safetyQueryRes.type === 'safety_analysis', 'AI correctly categorized safety query intent');
assert(safetyQueryRes.action && safetyQueryRes.action.tab === 'safety', 'Safety AI response includes direct tab shortcut');

const foodQueryRes = processCityAIQuery('Where can I find cheap budget ramen?');
assert(foodQueryRes.type === 'food_recommendation', 'AI correctly categorized food recommendation query intent');

const historyQueryRes = processCityAIQuery('Tell me the history and landmarks');
assert(historyQueryRes.type === 'culture_lore', 'AI correctly categorized history and culture lore query intent');

const compareQueryRes = processCityAIQuery('Compare best vs worst places in the city');
assert(compareQueryRes.type === 'comparison_benchmark', 'AI correctly categorized comparison benchmark query intent');

// NLP Sentiment & Severity Scorer
const reportScoreNegative = analyzeCitizenReport('Deep pothole and broken dark streetlamp', 'danger collision hazard');
assert(reportScoreNegative.sentiment === 'negative' && reportScoreNegative.severity === 'high', 'Report sentiment analyzer detected high hazard risk');

const reportScorePositive = analyzeCitizenReport('Delicious authentic ramen and amazing music', 'peaceful and cozy gem');
assert(reportScorePositive.sentiment === 'positive', 'Report sentiment analyzer detected positive community gem');

// 7. Testing Real-Time AI Context Injection
console.log('\n[7] Testing Real Data AI Context Injection:');
const weatherQueryWithContext = processCityAIQuery('What is the weather today?', 'Tokyo', {
  center: [35.676, 139.650],
  weather: {
    temp: 19,
    feelsLike: 18,
    condition: 'Sunny Breezy',
    iconEmoji: '🌤️',
    aqi: 28,
    aqiStatus: 'Good',
    rainChance: 5,
    windKmh: 14
  }
});
assert(weatherQueryWithContext.type === 'smart_pulse', 'AI recognized weather query');
assert(weatherQueryWithContext.text.includes('Tokyo'), 'AI injected real city context name');
assert(weatherQueryWithContext.text.includes('19°C'), 'AI injected real temperature telemetry');

const locationQueryRes = processCityAIQuery('Where am I right now?', 'Paris', {
  center: [48.8566, 2.3522]
});
assert(locationQueryRes.type === 'location_status', 'AI recognized location query intent');
assert(locationQueryRes.text.includes('Paris') && locationQueryRes.text.includes('48.8566'), 'AI quoted exact live coordinates and city');

// 8. Testing Freemium & Subscription Entitlements
console.log('\n[8] Testing Freemium & Entitlement Engine:');
assert(PLANS.FREE && PLANS.PRO, 'Freemium plans defined (FREE & PRO)');
assert(PLANS.FREE.priceMonthly === 0, 'Free plan is $0');
assert(PLANS.PRO.priceMonthly === 9.99 && PLANS.PRO.priceAnnual === 79.99, 'Scout Pro pricing configured with ~33% annual discount');

// Test baseline free tier
cancelProSubscription(); // ensure reset
assert(!isProSubscriber(), 'Baseline user is on Free tier');
const offlineAccessFree = getFeatureAccess('offlinePacks');
assert(offlineAccessFree.upgradeRequired === true, 'Offline packs feature gating enforced for Free users');

// Test upgrade to Scout Pro
const upgradeRes = upgradeToPro({ billingCycle: 'annual', paymentMethod: 'Test Card (4242)', email: 'test@scout.org' });
assert(upgradeRes.status === 'active' && upgradeRes.planId === 'pro', 'Successfully upgraded to Scout Pro');
assert(isProSubscriber() === true, 'isProSubscriber() confirms active premium entitlement');

const offlineAccessPro = getFeatureAccess('offlinePacks');
assert(offlineAccessPro.allowed === true, 'Offline packs unlocked for Scout Pro subscriber');

// Test offline pack caching
const pack = downloadCityOfflinePack('Tokyo', [35.676, 139.650]);
assert(pack && pack.status === 'cached' && parseFloat(pack.sizeMB) > 0, `Offline city pack cached for Tokyo (${pack.sizeMB} MB)`);
const allPacks = getDownloadedPacks();
assert(allPacks.length >= 1, `IndexedDB/Local pack cache contains ${allPacks.length} packs`);

// Test cancellation & downgrade
const cancelRes = cancelProSubscription();
assert(cancelRes.status === 'cancelled' && !isProSubscriber(), 'Successfully processed subscription cancellation & downgrade');

// 9. Testing Internationalization (i18n) Engine
console.log('\n[9] Testing Internationalization (i18n) Multi-Language Support:');
assert(SUPPORTED_LOCALES.length === 6, `6 global locales configured (found ${SUPPORTED_LOCALES.length})`);
SUPPORTED_LOCALES.forEach(loc => {
  const dict = TRANSLATIONS[loc.code];
  assert(dict && dict.navExplore && dict.navSafety && dict.searchWorld, `Locale ${loc.code} (${loc.label}) has valid complete translation dictionary`);
});
assert(t('navExplore', 'es') === 'Explorar', 'Spanish translation test passed (Explorar)');
assert(t('navSafety', 'ja') === '安全ルート', 'Japanese translation test passed (安全ルート)');
assert(t('navSafety', 'fr') === 'Itinéraire Sûr', 'French translation test passed (Itinéraire Sûr)');
assert(t('navExplore', 'de') === 'Entdecken', 'German translation test passed (Entdecken)');
assert(t('navExplore', 'hi') === 'खोजें', 'Hindi translation test passed (खोजें)');

// 10. Testing PWA & Cross-Platform Configuration
console.log('\n[10] Testing PWA & Cross-Platform App Packaging:');
const manifestPath = path.resolve('public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'PWA manifest.json exists');
const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifestContent.display === 'standalone', 'PWA display mode is standalone');
assert(manifestContent.icons && manifestContent.icons.length > 0, 'PWA icons configured for mobile home screen installation');
assert(manifestContent.shortcuts && manifestContent.shortcuts.length >= 3, 'PWA app shortcuts configured');

const capConfigPath = path.resolve('capacitor.config.json');
assert(fs.existsSync(capConfigPath), 'Capacitor cross-platform config exists');
const capConfig = JSON.parse(fs.readFileSync(capConfigPath, 'utf8'));
assert(capConfig.appId === 'com.citylife.urbanai', 'Capacitor Android/iOS appId configured properly');
assert(capConfig.webDir === 'dist', 'Capacitor webDir targets production dist bundle');

// 11. Testing Security, Legal & GDPR Compliance
console.log('\n[11] Testing Security & Legal Compliance:');
const privacyPath = path.resolve('public', 'privacy.html');
assert(fs.existsSync(privacyPath), 'Public GDPR & CCPA Privacy Policy page exists');
const privacyHtml = fs.readFileSync(privacyPath, 'utf8');
assert(privacyHtml.includes('GDPR') && privacyHtml.includes('Right to Erasure'), 'Privacy policy contains explicit GDPR data portability & erasure terms');

const termsPath = path.resolve('public', 'terms.html');
assert(fs.existsSync(termsPath), 'Public Terms of Service page exists');
const termsHtml = fs.readFileSync(termsPath, 'utf8');
assert(termsHtml.includes('EMERGENCY WARNING') && termsHtml.includes('14-Day Refund Guarantee'), 'Terms include clear emergency service notices and subscription refund rights');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
