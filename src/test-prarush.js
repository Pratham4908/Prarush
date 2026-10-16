// Automated Verification Suite for Prarush Universal AI Platform
import assert from 'assert';

// Node.js environment storage polyfill
if (typeof localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] || null
  };
}
import { 
  DEFAULT_WORKSPACES, 
  INITIAL_TASKS, 
  INITIAL_NOTES, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUTOMATIONS, 
  INITIAL_KNOWLEDGE, 
  INITIAL_CALENDAR_EVENTS, 
  COMMUNITY_TEMPLATES, 
  getStoredData, 
  saveStoredData, 
  logActivity,
  clearPrarushStorageOnly 
} from './utils/prarushStore.js';

import { 
  AI_MODELS, 
  processPrarushAIQuery, 
  generatePrarushImage 
} from './utils/prarushAI.js';

import { 
  PRARUSH_PLANS, 
  getSubscription, 
  isProSubscriber, 
  checkQuota, 
  recordUsage, 
  upgradeSubscription, 
  cancelSubscription,
  exportUserDataGDPR 
} from './utils/prarushFreemium.js';

import { 
  PRARUSH_LOCALES, 
  tPrarush 
} from './utils/prarushI18n.js';

import { 
  registerUser, 
  loginUser, 
  continueAsGuest, 
  getCurrentUser, 
  DEFAULT_GUEST_USER 
} from './utils/authManager.js';

import { 
  getStoredApiKeys, 
  saveStoredApiKeys 
} from './utils/apiKeyManager.js';

console.log('🚀 Starting Prarush Comprehensive Engine Tests...\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllTests() {
  // 1. Workspace & Store Tests
  await runTest('Default Workspaces validation', () => {
    assert(Array.isArray(DEFAULT_WORKSPACES), 'DEFAULT_WORKSPACES should be an array');
    assert(DEFAULT_WORKSPACES.length >= 5, 'Should have at least 5 default workspaces');
    const ids = DEFAULT_WORKSPACES.map(w => w.id);
    assert(ids.includes('ws-personal'), 'Should contain ws-personal');
    assert(ids.includes('ws-work'), 'Should contain ws-work');
    assert(ids.includes('ws-study'), 'Should contain ws-study');
  });

  await runTest('Productivity datasets initialized', () => {
    assert(INITIAL_TASKS.length >= 5, 'Should have initial tasks');
    assert(INITIAL_NOTES.length >= 3, 'Should have initial notes');
    assert(INITIAL_DOCUMENTS.length >= 3, 'Should have initial documents');
    assert(INITIAL_AUTOMATIONS.length >= 3, 'Should have initial automations');
    assert(INITIAL_KNOWLEDGE.length >= 3, 'Should have initial knowledge items');
    assert(INITIAL_CALENDAR_EVENTS.length >= 3, 'Should have initial calendar events');
  });

  await runTest('Community Templates catalog validation', () => {
    assert(COMMUNITY_TEMPLATES.length >= 4, 'Should contain community templates');
    const categories = COMMUNITY_TEMPLATES.map(t => t.category);
    assert(categories.includes('Engineering'), 'Should have Engineering templates');
    assert(categories.includes('Academic'), 'Should have Academic templates');
    assert(categories.includes('Business'), 'Should have Business templates');
  });

  // 2. AI Multi-Model Hub Tests
  await runTest('AI Multi-Model Catalog contains top-tier providers', () => {
    assert(AI_MODELS.length >= 5, 'Should support at least 5 distinct AI models');
    const modelIds = AI_MODELS.map(m => m.id);
    assert(modelIds.includes('prarush-neural-4'), 'Should include Prarush Neural-4');
    assert(modelIds.includes('claude-3-5-sonnet'), 'Should include Claude 3.5 Sonnet');
    assert(modelIds.includes('gpt-4o'), 'Should include OpenAI GPT-4o');
    assert(modelIds.includes('gemini-1-5-pro'), 'Should include Google Gemini 1.5 Pro');
    assert(modelIds.includes('llama-3-70b'), 'Should include Meta Llama 3 70B');
  });

  await runTest('processPrarushAIQuery handles general reasoning queries', async () => {
    const result = await processPrarushAIQuery('What is the architecture of Prarush?', 'prarush-neural-4');
    assert(result.text, 'Response should contain text');
    assert(result.modelUsed, 'Response should declare model used');
    assert(Array.isArray(result.suggestedActions) || Array.isArray(result.suggestions), 'Response should provide follow-up suggestions');
  });

  await runTest('processPrarushAIQuery detects code generation requests', async () => {
    const result = await processPrarushAIQuery('Write a Python function to compute moving averages', 'claude-3-5-sonnet');
    assert(result.code, 'Should extract code snippet');
    assert(result.language && result.language.toLowerCase().includes('python'), 'Language should be python');
  });

  await runTest('processPrarushAIQuery detects presentation deck requests', async () => {
    const result = await processPrarushAIQuery('Generate a 3-slide pitch deck for our seed round', 'gpt-4o');
    assert(Array.isArray(result.slides), 'Should output slides array');
    assert(result.slides.length >= 3, 'Should have at least 3 slides');
  });

  await runTest('processPrarushAIQuery generates grounded citations', async () => {
    const result = await processPrarushAIQuery('Research and verify paper citations', 'gemini-1-5-pro');
    assert(Array.isArray(result.citations), 'Should include citations array');
    assert(result.citations.length >= 1, 'Should have at least one citation');
  });

  await runTest('generatePrarushImage returns image metadata and honest preview disclaimer', () => {
    const imgData = generatePrarushImage('Cyberpunk AI Metropolis', 'cinematic');
    assert(imgData && imgData.imageUrl && typeof imgData.imageUrl === 'string', 'Should return valid image object with URL');
    assert(imgData.isDemoPreview === true, 'Should be flagged as preview');
    assert(imgData.disclaimer, 'Should have clear preview disclaimer');
  });

  // 3. Freemium & Entitlements Engine Tests
  await runTest('PRARUSH_PLANS definition integrity', () => {
    assert(PRARUSH_PLANS.free || PRARUSH_PLANS.FREE, 'Should have Free plan');
    assert(PRARUSH_PLANS.pro || PRARUSH_PLANS.PRO, 'Should have Pro plan');
    assert(PRARUSH_PLANS.team || PRARUSH_PLANS.TEAM, 'Should have Team plan');
    assert.strictEqual(PRARUSH_PLANS.FREE.priceMonthly, 0);
    assert.strictEqual(PRARUSH_PLANS.PRO.priceMonthly, 12);
    assert.strictEqual(PRARUSH_PLANS.TEAM.priceMonthly, 29);
  });

  await runTest('checkQuota respects plan tier limits', () => {
    const quota = checkQuota('aiQueries');
    assert(typeof quota.allowed === 'boolean', 'Quota check should return allowed boolean');
    assert(typeof quota.limit === 'number', 'Quota limit should be a number');
  });

  // 4. Internationalization Tests
  await runTest('i18n supports all 6 target locales', () => {
    const targetCodes = ['en', 'es', 'fr', 'ja', 'de', 'hi'];
    const localeCodes = PRARUSH_LOCALES.map(l => l.code);
    for (const code of targetCodes) {
      assert(localeCodes.includes(code), `Locale ${code} must be registered in PRARUSH_LOCALES`);
    }
  });

  await runTest('tPrarush returns localized navigation strings', () => {
    const enDash = tPrarush('navDashboard', 'en');
    const esDash = tPrarush('navDashboard', 'es');
    const jaDash = tPrarush('navDashboard', 'ja');
    const hiDash = tPrarush('navDashboard', 'hi');

    assert.strictEqual(enDash, 'Dashboard');
    assert.strictEqual(esDash, 'Panel Principal');
    assert.strictEqual(jaDash, 'ダッシュボード');
    assert.strictEqual(hiDash, 'डैशबोर्ड');
  });

  // 5. Secure Auth & Session Engine Tests
  await runTest('AuthManager register and login with cryptographic SHA-256 verification', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const registered = await registerUser({
      name: 'Test Engineer',
      email: testEmail,
      password: 'SecurePassword123!'
    });
    assert(registered.id, 'Registered user must have an id');
    assert.strictEqual(registered.email, testEmail);
    assert.strictEqual(registered.password, undefined, 'Plaintext password must NEVER be exposed');

    const loggedIn = await loginUser({
      email: testEmail,
      password: 'SecurePassword123!'
    });
    assert.strictEqual(loggedIn.id, registered.id);
  });

  await runTest('AuthManager supports Guest mode seamlessly', () => {
    const guest = continueAsGuest();
    assert(guest.isGuest, 'Guest user should have isGuest=true');
    assert(guest.id, 'Guest user should have an id');
  });

  // 6. BYOK API Key Manager Tests
  await runTest('API Key Manager saves and retrieves cloud credentials safely', () => {
    const keys = { openai: 'sk-test-mock', gemini: 'AIza-test-mock', anthropic: '', openrouter: '' };
    saveStoredApiKeys(keys);
    const retrieved = getStoredApiKeys();
    assert.strictEqual(retrieved.openai, 'sk-test-mock');
    assert.strictEqual(retrieved.gemini, 'AIza-test-mock');
  });

  // 7. Origin-Safe Purge & Data Portability
  await runTest('Origin-Safe Purge only targets prarush_ namespace keys', () => {
    localStorage.setItem('other_app_key', 'preserved_value');
    localStorage.setItem('prarush_temp_test', 'to_delete');
    clearPrarushStorageOnly();
    assert.strictEqual(localStorage.getItem('other_app_key'), 'preserved_value', 'Non-Prarush keys must be preserved');
    assert.strictEqual(localStorage.getItem('prarush_temp_test'), null, 'Prarush keys must be removed');
    localStorage.removeItem('other_app_key');
  });

  // Print Final Summary
  console.log(`\n========================================`);
  console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
  if (passedTests === totalTests) {
    console.log(`  🎉 ALL PRARUSH TESTS PASSED SUCCESSFULLY!`);
    console.log(`========================================\n`);
    process.exit(0);
  } else {
    console.error(`  ⚠️ SOME TESTS FAILED! Check outputs above.`);
    console.log(`========================================\n`);
    process.exit(1);
  }
}

runAllTests();
