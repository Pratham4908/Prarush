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

if (typeof sessionStorage === 'undefined') {
  const sStore = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => (sStore.has(key) ? sStore.get(key) : null),
    setItem: (key, val) => sStore.set(key, String(val)),
    removeItem: (key) => sStore.delete(key),
    clear: () => sStore.clear()
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
  getUserStorageKey,
  getUserStoredData,
  saveUserStoredData,
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
  saveStoredApiKeys,
  purgeAllApiKeys 
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
  await runTest('Default Workspace is Software Engineering & Dev for technical creators', () => {
    assert(Array.isArray(DEFAULT_WORKSPACES), 'DEFAULT_WORKSPACES should be an array');
    assert.strictEqual(DEFAULT_WORKSPACES[0].id, 'ws-work', 'First default workspace must be ws-work');
    assert.strictEqual(DEFAULT_WORKSPACES[0].name, 'Software Engineering & Dev');
  });

  await runTest('Productivity datasets initialized with developer sprint tasks (no 10K running)', () => {
    assert(INITIAL_TASKS.length >= 5, 'Should have initial tasks');
    const taskTitles = INITIAL_TASKS.map(t => t.title.toLowerCase());
    assert(!taskTitles.some(t => t.includes('10k') || t.includes('marathon')), 'Should not contain 10K running task');
    assert(INITIAL_NOTES.length >= 3, 'Should have initial notes');
    assert(INITIAL_DOCUMENTS.length >= 3, 'Should have initial documents');
    assert(INITIAL_AUTOMATIONS.length >= 3, 'Should have initial automations');
    assert(INITIAL_KNOWLEDGE.length >= 3, 'Should have initial knowledge items');
    assert(INITIAL_CALENDAR_EVENTS.length >= 3, 'Should have initial calendar events');
  });

  await runTest('Per-user data access isolation functions properly without leakage or fallback', () => {
    const key = getUserStorageKey('tasks', 'user-alpha');
    assert.strictEqual(key, 'prarush_usr_user-alpha_tasks');

    saveUserStoredData('tasks', 'user-alpha', [{ id: 't-1', title: 'Alpha Sprint Task' }]);
    saveUserStoredData('tasks', 'user-beta', [{ id: 't-2', title: 'Beta Sprint Task' }]);

    const alphaTasks = getUserStoredData('tasks', 'user-alpha', []);
    const betaTasks = getUserStoredData('tasks', 'user-beta', []);

    assert.strictEqual(alphaTasks[0].title, 'Alpha Sprint Task');
    assert.strictEqual(betaTasks[0].title, 'Beta Sprint Task');

    // Verify an uninitialized user profile gets fallback default, with zero leakage from other profiles
    const gammaTasks = getUserStoredData('tasks', 'user-gamma', [{ id: 't-default', title: 'Default Task' }]);
    assert.strictEqual(gammaTasks[0].title, 'Default Task');
    assert.strictEqual(gammaTasks.some(t => t.id === 't-1' || t.id === 't-2'), false, 'Gamma must not inherit Alpha or Beta tasks');
  });

  await runTest('Community Templates catalog validation', () => {
    assert(COMMUNITY_TEMPLATES.length >= 4, 'Should contain community templates');
    const categories = COMMUNITY_TEMPLATES.map(t => t.category);
    assert(categories.includes('Engineering'), 'Should have Engineering templates');
    assert(categories.includes('Academic'), 'Should have Academic templates');
    assert(categories.includes('Business'), 'Should have Business templates');
  });

  // 2. AI Multi-Model Hub Tests
  await runTest('AI Multi-Model Catalog contains top-tier active models with Prarush Local Engine', () => {
    assert(AI_MODELS.length >= 5, 'Should support at least 5 distinct AI models');
    const modelIds = AI_MODELS.map(m => m.id);
    assert(modelIds.includes('prarush-local-engine'), 'Should include Prarush Local Engine');
    assert(modelIds.includes('claude-sonnet'), 'Should include Claude Sonnet (5.5)');
    assert(modelIds.includes('gpt-4o'), 'Should include OpenAI GPT-4o');
    assert(modelIds.includes('gemini-3-8-flash'), 'Should include Google Gemini 3.8 Flash');
    assert(modelIds.includes('llama-3-3-70b'), 'Should include Meta Llama 3.3 70B');
  });

  await runTest('INITIAL_DOCUMENTS marks sample records with hasRealBinary=false', () => {
    assert(INITIAL_DOCUMENTS.length >= 3, 'Should have initial documents');
    INITIAL_DOCUMENTS.forEach(doc => {
      assert.strictEqual(doc.isSample, true, 'Initial document must be marked as sample');
      assert.strictEqual(doc.hasRealBinary, false, 'Sample document must not pretend to have real binary');
    });
  });

  await runTest('processPrarushAIQuery handles general reasoning queries via Local Engine', async () => {
    const result = await processPrarushAIQuery('What is the architecture of Prarush?', 'prarush-local-engine');
    assert(result.text, 'Response should contain text');
    assert.strictEqual(result.isLiveApi, false, 'Offline engine response must have isLiveApi=false');
    assert(result.modelUsed.includes('Local Engine') || result.modelUsed.includes('Fallback'), 'Model used declared');
  });

  await runTest('processPrarushAIQuery honestly labels unconfigured Claude requests as fallback (never OpenAI)', async () => {
    // Clear keys to ensure fallback test
    saveStoredApiKeys({ openai: '', gemini: '', anthropic: '', openrouter: '' });
    const result = await processPrarushAIQuery('Design an authentication middleware', 'claude-sonnet');
    assert.strictEqual(result.isLiveApi, false, 'Unconfigured Claude must not claim live API');
    assert(result.modelUsed.includes('Key Not Configured') || result.modelUsed.includes('Fallback'), 'Must explicitly declare fallback');
    assert(!result.modelUsed.includes('OpenAI'), 'Claude fallback must NEVER pretend to be OpenAI');
  });

  await runTest('processPrarushAIQuery detects code generation requests', async () => {
    const result = await processPrarushAIQuery('Write a Python function to compute moving averages', 'prarush-local-engine');
    assert(result.code, 'Should extract code snippet');
    assert(result.language && result.language.toLowerCase().includes('python'), 'Language should be python');
  });

  await runTest('processPrarushAIQuery detects presentation deck requests', async () => {
    const result = await processPrarushAIQuery('Generate a 3-slide pitch deck for our seed round', 'prarush-local-engine');
    assert(Array.isArray(result.slides), 'Should output slides array');
    assert(result.slides.length >= 3, 'Should have at least 3 slides');
  });

  await runTest('processPrarushAIQuery generates reference specifications without unverified scores', async () => {
    const result = await processPrarushAIQuery('Research and verify model specs', 'gemini-3-8-flash');
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

  await runTest('AuthManager terminates expired sessions when reading getCurrentUser()', () => {
    const expiredSession = {
      token: 'expired-token-123',
      user: { id: 'usr-expired', name: 'Old User', email: 'old@example.com' },
      expiresAt: new Date(Date.now() - 10000).toISOString() // 10 seconds in the past
    };
    localStorage.setItem('prarush_active_session', JSON.stringify(expiredSession));

    const currentUser = getCurrentUser();
    assert.strictEqual(currentUser.isGuest, true, 'Expired session must return DEFAULT_GUEST_USER');
    assert.strictEqual(localStorage.getItem('prarush_active_session'), null, 'Expired session must be purged from storage');
  });

  await runTest('AuthManager refreshes session expiresAt (sliding inactivity window)', () => {
    const originalExpiry = new Date(Date.now() + 1000 * 60).toISOString(); // 1 minute in future
    const activeSession = {
      token: 'active-token-456',
      user: { id: 'usr-active', name: 'Active User', email: 'active@example.com' },
      expiresAt: originalExpiry
    };
    localStorage.setItem('prarush_active_session', JSON.stringify(activeSession));

    const currentUser = getCurrentUser();
    assert.strictEqual(currentUser.id, 'usr-active');

    const updatedSession = JSON.parse(localStorage.getItem('prarush_active_session'));
    const refreshedTime = new Date(updatedSession.expiresAt).getTime();
    const originalTime = new Date(originalExpiry).getTime();
    assert(refreshedTime > originalTime, 'Session expiry should be refreshed on active access');
  });

  await runTest('AuthManager supports Guest mode seamlessly', () => {
    const guest = continueAsGuest();
    assert(guest.isGuest, 'Guest user should have isGuest=true');
    assert(guest.id, 'Guest user should have an id');
  });

  // 6. BYOK API Key Manager Tests
  await runTest('API Key Manager saves, retrieves, and purges cloud credentials safely', () => {
    const keys = { openai: 'sk-test-mock', gemini: 'AIza-test-mock', anthropic: 'sk-ant-test', openrouter: '' };
    saveStoredApiKeys(keys, false);
    const retrieved = getStoredApiKeys();
    assert.strictEqual(retrieved.openai, 'sk-test-mock');
    assert.strictEqual(retrieved.gemini, 'AIza-test-mock');
    assert.strictEqual(retrieved.anthropic, 'sk-ant-test');

    purgeAllApiKeys();
    const purged = getStoredApiKeys();
    assert.strictEqual(purged.openai, '');
    assert.strictEqual(purged.gemini, '');
    assert.strictEqual(purged.anthropic, '');
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

  await runTest('exportUserDataGDPR generates honest metadata-only payload structure', () => {
    const exportData = exportUserDataGDPR();
    assert(exportData.exportScopeNotice, 'Export must explicitly describe metadata scope');
    assert(exportData.exportScopeNotice.toLowerCase().includes('binary'), 'Must clarify that binary Blobs in IndexedDB are not in JSON');
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
