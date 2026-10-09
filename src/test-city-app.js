// City Life App: Comprehensive Automated Verification Test Suite
import { CITIES, EXPLORE_SPOTS } from './data/cityData.js';
import { HERITAGE_SITES, CULTURAL_ETIQUETTE_GUIDE } from './data/historyCultureData.js';
import { SAFETY_INCIDENTS, ROUTE_OPTIONS, EMERGENCY_CONTACTS } from './data/safetyData.js';
import { NEIGHBORHOOD_BENCHMARKS, COMPARISON_METRIC_CONFIG } from './data/placesComparisonData.js';
import { TRAFFIC_CORRIDORS, WEATHER_ALERTS, INITIAL_CITIZEN_REPORTS, SOCIAL_BUZZ_STREAM } from './data/pulseData.js';
import { processCityAIQuery, analyzeCitizenReport } from './utils/aiEngine.js';

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

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
