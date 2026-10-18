// Automated Verification Suite for Prarush Universal AI Platform
import assert from 'assert';
import fs from 'fs';
import JSZip from 'jszip';

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

// In-Memory IndexedDB Mock for Node.js test environment
export const memoryDbStore = new Map();
if (typeof indexedDB === 'undefined') {
  globalThis.indexedDB = {
    open: () => {
      const request = {
        result: {
          objectStoreNames: { contains: () => true },
          transaction: () => ({
            objectStore: () => ({
              put: (record) => {
                const req = { onsuccess: null, onerror: null };
                memoryDbStore.set(record.id, record);
                setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: record.id } }), 0);
                return req;
              },
              get: (id) => {
                const req = { onsuccess: null, onerror: null, result: memoryDbStore.get(id) || null };
                setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: req.result } }), 0);
                return req;
              },
              delete: (id) => {
                const req = { onsuccess: null, onerror: null };
                memoryDbStore.delete(id);
                setTimeout(() => req.onsuccess && req.onsuccess({ target: {} }), 0);
                return req;
              },
              clear: () => {
                const req = { onsuccess: null, onerror: null };
                memoryDbStore.clear();
                setTimeout(() => req.onsuccess && req.onsuccess({ target: {} }), 0);
                return req;
              },
              openCursor: () => {
                const req = { onsuccess: null, onerror: null };
                const entries = Array.from(memoryDbStore.values());
                let index = 0;
                function iterate() {
                  if (index < entries.length) {
                    const val = entries[index];
                    const cursor = {
                      value: val,
                      continue: () => {
                        index++;
                        iterate();
                      },
                      delete: () => {
                        memoryDbStore.delete(val.id);
                      }
                    };
                    req.onsuccess && req.onsuccess({ target: { result: cursor } });
                  } else {
                    req.onsuccess && req.onsuccess({ target: { result: null } });
                  }
                }
                setTimeout(iterate, 0);
                return req;
              }
            }),
            onerror: null
          })
        },
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null
      };
      setTimeout(() => request.onsuccess && request.onsuccess({ target: { result: request.result } }), 0);
      return request;
    }
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
  generatePrarushImage,
  generatePrarushImageLive,
  summarizeDocumentText,
  breakdownTask,
  answerKnowledgeQuery
} from './utils/prarushAI.js';

import { 
  PRARUSH_PLANS, 
  getSubscription, 
  isProSubscriber, 
  checkQuota, 
  recordUsage, 
  upgradeSubscription, 
  cancelSubscription,
  buildUserDataGDPRPayload,
  exportUserDataGDPR,
  exportCompleteBackupZip,
  validateBackupZip,
  restoreCompleteBackupZip 
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
  DEFAULT_GUEST_USER,
  hashPassword,
  verifyPassword,
  PBKDF2_ITERATIONS 
} from './utils/authManager.js';

import { 
  getStoredApiKeys, 
  saveStoredApiKeys,
  purgeAllApiKeys,
  callRealDalle3,
  callRealWhisper
} from './utils/apiKeyManager.js';

import {
  saveFileToIndexedDB,
  getFileFromIndexedDB,
  deleteFileFromIndexedDB,
  getAllFilesForUserFromIndexedDB,
  clearAllFilesFromIndexedDB,
  clearUserFilesFromIndexedDB,
  claimQuarantinedLegacyFiles
} from './utils/indexedDbStore.js';

import {
  checkLegacyUnscopedDataExists,
  migrateLegacyUnscopedData
} from './utils/prarushStore.js';

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
  await runTest('AI Multi-Model Catalog contains top-tier active models with verified rates and provider URLs', () => {
    assert(AI_MODELS.length >= 6, 'Should support at least 6 distinct AI models including Sonnet 5, 5.5 & 4.5');
    const modelIds = AI_MODELS.map(m => m.id);
    assert(modelIds.includes('prarush-local-engine'), 'Should include Prarush Local Engine');
    assert(modelIds.includes('claude-sonnet-5-5'), 'Should include Claude Sonnet 5.5');
    assert(modelIds.includes('claude-sonnet-5'), 'Should include Claude Sonnet 5');
    assert(modelIds.includes('claude-sonnet-4-5'), 'Should include Claude Sonnet 4.5');
    assert(modelIds.includes('gpt-4o'), 'Should include OpenAI GPT-4o');
    assert(modelIds.includes('gemini-3-8-flash'), 'Should include Google Gemini 3.8 Flash');
    assert(modelIds.includes('llama-3-3-70b'), 'Should include Meta Llama 3.3 70B');

    // Sonnet 5: $2 in / $10 out per 1M ($0.0020 / $0.0100 per 1k)
    const claude5 = AI_MODELS.find(m => m.id === 'claude-sonnet-5');
    assert.strictEqual(claude5.name, 'Claude Sonnet 5');
    assert.strictEqual(claude5.costPer1k, '$2.00 in / $10.00 out (per 1M)');
    assert(claude5.pricingUrl.includes('platform.claude.com'), 'Claude 5 must link to Anthropic pricing');

    // Sonnet 5.5: $2 in / $10 out per 1M ($0.0020 / $0.0100 per 1k)
    const claude55 = AI_MODELS.find(m => m.id === 'claude-sonnet-5-5');
    assert.strictEqual(claude55.name, 'Claude Sonnet 5.5');
    assert.strictEqual(claude55.costPer1k, '$2.00 in / $10.00 out (per 1M)');
    assert(claude55.pricingUrl.includes('platform.claude.com'), 'Claude 5.5 must link to Anthropic pricing');

    // Sonnet 4.5: $3 in / $15 out per 1M ($0.0030 / $0.0150 per 1k)
    const claude45 = AI_MODELS.find(m => m.id === 'claude-sonnet-4-5');
    assert.strictEqual(claude45.name, 'Claude Sonnet 4.5');
    assert.strictEqual(claude45.costPer1k, '$3.00 in / $15.00 out (per 1M)');

    // Gemini 3.8 Flash: $0.75 in / $3.75 out per 1M through Dec 31, 2026, free tier disclosed
    const gemini = AI_MODELS.find(m => m.id === 'gemini-3-8-flash');
    assert.strictEqual(gemini.name, 'Gemini 3.8 Flash');
    assert.strictEqual(gemini.costPer1k, '$0.75 in / $3.75 out (per 1M)');
    assert(gemini.pricingTier.includes('Free tier') && gemini.pricingTier.includes('$0.75'), 'Gemini pricing must identify free vs paid rates');
    assert(gemini.pricingDate.includes('Dec 31, 2026'), 'Gemini pricing must disclose date range');
    assert(gemini.pricingUrl.includes('ai.google.dev'), 'Gemini must link to Google pricing');
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
    const result = await processPrarushAIQuery('Design an authentication middleware', 'claude-sonnet-4-5');
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

  // 5. Secure Auth & Session Engine Tests (OWASP PBKDF2)
  await runTest('AuthManager register and login with OWASP PBKDF2 (600,000 iterations) and auto-upgrade', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const registered = await registerUser({
      name: 'Test Engineer',
      email: testEmail,
      password: 'SecurePassword123!'
    });
    assert(registered.id, 'Registered user must have an id');
    assert.strictEqual(registered.email, testEmail);
    assert.strictEqual(registered.password, undefined, 'Plaintext password must NEVER be exposed');

    // Verify stored password hash format has PBKDF2 prefix and 600k iterations
    const users = JSON.parse(localStorage.getItem('prarush_registered_users'));
    const userRec = users.find(u => u.id === registered.id);
    assert(userRec.passwordHash.startsWith('pbkdf2$600000$'), 'Password hash must use PBKDF2 with 600k iterations');

    // Test verifyPassword helper
    const isValid = await verifyPassword('SecurePassword123!', userRec);
    const isBad = await verifyPassword('WrongPassword!', userRec);
    assert.strictEqual(isValid, true, 'verifyPassword should accept correct password');
    assert.strictEqual(isBad, false, 'verifyPassword should reject wrong password');

    // Simulate an older user with 100k iteration hash
    const olderSalt = 'oldsalt123';
    const olderHash = await hashPassword('LegacyPass123!', olderSalt, 100000);
    const olderUser = {
      id: `usr-old-${Date.now()}`,
      name: 'Old Account',
      email: `old_${Date.now()}@example.com`,
      salt: olderSalt,
      passwordHash: olderHash,
      role: 'Engineer',
      isGuest: false,
      createdAt: new Date().toISOString()
    };
    users.push(olderUser);
    localStorage.setItem('prarush_registered_users', JSON.stringify(users));

    // Login with older user
    const oldLoggedIn = await loginUser({ email: olderUser.email, password: 'LegacyPass123!' });
    assert.strictEqual(oldLoggedIn.id, olderUser.id);

    // Verify hash automatically upgraded to 600k iterations on login
    const updatedUsers = JSON.parse(localStorage.getItem('prarush_registered_users'));
    const upgradedRec = updatedUsers.find(u => u.id === olderUser.id);
    assert(upgradedRec.passwordHash.startsWith('pbkdf2$600000$'), 'Older 100k hash must upgrade to 600k on successful login');
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
  await runTest('API Key Manager saves, retrieves, and purges cloud credentials safely with user scoping', () => {
    const keys = { openai: 'sk-test-mock', gemini: 'AIza-test-mock', anthropic: 'sk-ant-test', openrouter: '' };
    saveStoredApiKeys(keys, 'usr-test-keys');
    const retrieved = getStoredApiKeys('usr-test-keys');
    assert.strictEqual(retrieved.openai, 'sk-test-mock');
    assert.strictEqual(retrieved.gemini, 'AIza-test-mock');
    assert.strictEqual(retrieved.anthropic, 'sk-ant-test');

    // Different user cannot read usr-test-keys' credentials
    const otherUserKeys = getStoredApiKeys('usr-other-keys');
    assert.strictEqual(otherUserKeys.openai, '', 'API keys must not leak across user profiles');

    purgeAllApiKeys('usr-test-keys');
    const purged = getStoredApiKeys('usr-test-keys');
    assert.strictEqual(purged.openai, '');
    assert.strictEqual(purged.gemini, '');
    assert.strictEqual(purged.anthropic, '');
  });

  // 7. Profile Separation & IndexedDB Isolation Tests
  await runTest('IndexedDB file isolation keys by owner and strictly denies unowned legacy records', async () => {
    await clearAllFilesFromIndexedDB();

    // 1. Save file for owner Alice
    const dummyBlobA = new Blob(['alice architecture spec'], { type: 'application/pdf' });
    dummyBlobA.name = 'alice_architecture.pdf';
    await saveFileToIndexedDB('doc-alice-01', dummyBlobA, 'usr-alice');

    // 2. Alice can read her own file
    const retrievedAlice = await getFileFromIndexedDB('doc-alice-01', 'usr-alice');
    assert(retrievedAlice, 'Alice must be able to read her own file');

    // 3. Bob cannot read Alice file
    const retrievedBob = await getFileFromIndexedDB('doc-alice-01', 'usr-bob');
    assert.strictEqual(retrievedBob, null, 'Bob must be denied access to Alice file');

    // 4. Bob cannot delete Alice file
    const bobDelete = await deleteFileFromIndexedDB('doc-alice-01', 'usr-bob');
    assert.strictEqual(bobDelete, false, 'Bob deletion of Alice file must be denied');

    // 5. Unowned legacy record is strictly denied
    memoryDbStore.set('legacy-unowned-file', {
      id: 'legacy-unowned-file',
      rawId: 'legacy-unowned-file',
      userId: null, // missing owner
      name: 'legacy.pdf',
      blob: new Blob(['legacy content'])
    });
    const readLegacy = await getFileFromIndexedDB('legacy-unowned-file', 'usr-alice');
    assert.strictEqual(readLegacy, null, 'Access to unowned legacy file must be strictly denied until migrated');
    const deleteLegacy = await deleteFileFromIndexedDB('legacy-unowned-file', 'usr-alice');
    assert.strictEqual(deleteLegacy, false, 'Deletion of unowned legacy file must be rejected');
  });

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

  await runTest('buildUserDataGDPRPayload strictly isolates profile data, subscription, and activity logs', () => {
    // Set a legacy unpartitioned workspace and activity key
    localStorage.setItem('prarush_workspaces', JSON.stringify([{ id: 'legacy-ws', title: 'Legacy Leaked Workspace' }]));
    localStorage.setItem('prarush_activity_log', JSON.stringify([{ id: 'act-legacy', action: 'Leaked Shared Activity' }]));
    
    // User with clean profile has no scoped workspaces or activities
    const isolatedPayload = buildUserDataGDPRPayload({ id: 'usr-isolated-test', name: 'Isolated User' });
    assert.strictEqual(isolatedPayload.workspaces.length, 0, 'Isolated profile export must NEVER inherit un-scoped legacy workspaces');
    assert.strictEqual(isolatedPayload.activityAuditLog.length, 0, 'Isolated profile export must NEVER inherit shared activity logs');

    localStorage.removeItem('prarush_workspaces');
    localStorage.removeItem('prarush_activity_log');
  });

  // 8. Comprehensive Backup & ZIP Engine Tests
  await runTest('exportCompleteBackupZip succeeds, bundles valid metadata.json & binary files, and initiates single download', async () => {
    await clearAllFilesFromIndexedDB();
    const testUser = { id: 'usr-backup-test', name: 'Backup Tester', email: 'tester@prarush.local' };

    // Save authentic file in IndexedDB for this user
    const dummyFile = new Blob(['sample pdf binary content'], { type: 'application/pdf' });
    dummyFile.name = 'archived_design.pdf';
    await saveFileToIndexedDB('doc-backup-1', dummyFile, testUser.id);

    // Track browser download attempts
    let downloadTriggers = 0;
    const downloadedFilenames = [];
    globalThis.document = {
      body: {
        appendChild: () => {},
        removeChild: () => {}
      },
      createElement: (tag) => {
        if (tag === 'a') {
          return {
            set href(val) {},
            set download(name) { downloadedFilenames.push(name); },
            click: () => { downloadTriggers++; }
          };
        }
        return {};
      }
    };
    globalThis.URL = {
      createObjectURL: () => 'blob:mock-zip-url',
      revokeObjectURL: () => {}
    };

    const zipResult = await exportCompleteBackupZip(testUser);
    assert.strictEqual(zipResult.success, true, 'Export must explicitly return success: true');
    assert.strictEqual(zipResult.fileCount, 1, 'File count must match user files');
    assert(zipResult.zip, 'Result must contain active JSZip instance');

    // Verify single download behavior
    assert.strictEqual(downloadTriggers, 1, 'Exactly one browser download must be triggered');
    assert(downloadedFilenames[0].endsWith('.zip'), 'Downloaded file must be a .zip archive');

    // Inspect archive contents
    const metaEntry = zipResult.zip.file('metadata.json');
    assert(metaEntry, 'Archive must contain metadata.json');
    const metaText = await metaEntry.async('text');
    const parsedMeta = JSON.parse(metaText);
    assert.strictEqual(parsedMeta.userProfile.id, testUser.id);

    const docEntry = zipResult.zip.file('documents/archived_design.pdf');
    assert(docEntry, 'Archive must contain documents/archived_design.pdf');
  });

  await runTest('exportCompleteBackupZip collision-proof handling preserves report.pdf, report_2.pdf, and duplicate report.pdf', async () => {
    await clearAllFilesFromIndexedDB();
    const testUser = { id: 'usr-collision-test', name: 'Collision Tester' };

    // Add 3 files: report.pdf, an existing report_2.pdf, and another duplicate report.pdf
    const f1 = new Blob(['content 1']); f1.name = 'report.pdf';
    const f2 = new Blob(['content 2']); f2.name = 'report_2.pdf';
    const f3 = new Blob(['content 3']); f3.name = 'report.pdf';
    await saveFileToIndexedDB('f1', f1, testUser.id);
    await saveFileToIndexedDB('f2', f2, testUser.id);
    await saveFileToIndexedDB('f3', f3, testUser.id);

    const zipResult = await exportCompleteBackupZip(testUser);
    assert.strictEqual(zipResult.success, true);
    assert.strictEqual(zipResult.fileCount, 3);

    // Verify all 3 files exist without collisions or overwrites
    assert(zipResult.zip.file('documents/report.pdf'), 'Must contain report.pdf');
    assert(zipResult.zip.file('documents/report_2.pdf'), 'Must contain original report_2.pdf');
    assert(zipResult.zip.file('documents/report_3.pdf'), 'Duplicate report.pdf must be renamed to report_3.pdf without colliding with report_2.pdf');
  });

  await runTest('exportCompleteBackupZip aborts and reports error if a document cannot be read from storage', async () => {
    await clearAllFilesFromIndexedDB();
    const testUser = { id: 'usr-fail-test', name: 'Fail Tester' };

    // Simulate an unreadable file with null blob
    memoryDbStore.set(`doc-${testUser.id}-broken`, {
      id: `doc-${testUser.id}-broken`,
      userId: testUser.id,
      name: 'corrupted.pdf',
      blob: null // broken file
    });

    const zipResult = await exportCompleteBackupZip(testUser);
    assert.strictEqual(zipResult.success, false, 'Backup must fail when an IndexedDB record blob is missing');
    assert(zipResult.error.includes('could not be read'), 'Error message must explain the read failure');
  });

  // 9. Backup Restore Engine Tests
  await runTest('Backup restore engine validates archive and restores user workspaces and IndexedDB files', async () => {
    await clearAllFilesFromIndexedDB();
    const sourceUser = { id: 'usr-src', name: 'Source Engineer', email: 'src@prarush.local' };
    const targetUser = { id: 'usr-target', name: 'Target Engineer', email: 'target@prarush.local' };

    // Create a mock ZIP archive
    const zip = new JSZip();
    const metadata = {
      platform: 'Prarush Local-First Workspace for Developers & Creators',
      version: '2.0.0',
      exportTimestamp: new Date().toISOString(),
      userProfile: sourceUser,
      workspaces: [{ id: 'ws-imported', name: 'Imported Cloud Architecture', color: '#10b981' }],
      tasks: [{ id: 't-imported', title: 'Imported Microservice Deployment' }],
      documents: [{ id: 'doc-imported', name: 'architecture_diagram.png' }]
    };
    zip.file('metadata.json', JSON.stringify(metadata));
    zip.folder('documents').file('architecture_diagram.png', 'mock_png_bytes');

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // 1. Validation test
    const validation = await validateBackupZip(zipBlob);
    assert.strictEqual(validation.valid, true, 'Archive must be validated as authentic Prarush archive');
    assert.strictEqual(validation.workspaceCount, 1);
    assert.strictEqual(validation.taskCount, 1);
    assert.strictEqual(validation.binaryFiles.length, 1);

    // 2. Reject archive missing metadata.json
    const fakeZip = new JSZip();
    fakeZip.file('other.txt', 'hello');
    const invalidValidation = await validateBackupZip(await fakeZip.generateAsync({ type: 'blob' }));
    assert.strictEqual(invalidValidation.valid, false, 'Should reject archive missing metadata.json');

    // 3. Restore execution test
    const restoreResult = await restoreCompleteBackupZip(zipBlob, targetUser, { conflictStrategy: 'merge' });
    assert.strictEqual(restoreResult.success, true, 'Restore must succeed');
    assert.strictEqual(restoreResult.restoredWorkspaces, 1);
    assert.strictEqual(restoreResult.restoredTasks, 1);
    assert.strictEqual(restoreResult.restoredFiles, 1);

    // Verify restored workspace is stored in target profile
    const targetWorkspaces = JSON.parse(localStorage.getItem(`prarush_usr_${targetUser.id}_workspaces`));
    assert(targetWorkspaces.some(w => w.id === 'ws-imported'), 'Target profile must contain restored workspace');

    // Verify restored file exists in IndexedDB scoped to target user
    const restoredFile = await getFileFromIndexedDB('doc-imported', targetUser.id);
    assert(restoredFile, 'Restored file must be accessible in IndexedDB under target user ID');
  });

  await runTest('Capacitor configuration specifies com.prarush.app and native folders exist', () => {
    const capRaw = fs.readFileSync('./capacitor.config.json', 'utf8');
    const capConfig = JSON.parse(capRaw);
    assert.strictEqual(capConfig.appId, 'com.prarush.app');
    assert.strictEqual(capConfig.appName, 'Prarush');
    assert(fs.existsSync('./android'), 'Android native project folder must exist');
    assert(fs.existsSync('./ios'), 'iOS native project folder must exist');
  });

  // 10. Audit Report Oct 18, 2026 Test Suite Expansion
  await runTest('checkQuota enforces workspace limits and user-scoped daily AI query quotas', () => {
    // 1. Workspace quota check
    const underLimit = checkQuota('workspaces', 4, 'usr-free-1');
    assert.strictEqual(underLimit.allowed, true);
    assert.strictEqual(underLimit.remaining, 1);

    const atLimit = checkQuota('workspaces', 5, 'usr-free-1');
    assert.strictEqual(atLimit.allowed, false);
    assert.strictEqual(atLimit.upgradeRequired, true);

    // 2. User-isolated daily AI query quota
    for (let i = 0; i < 20; i++) {
      recordUsage('aiQueries', 'usr-quota-a');
    }
    const quotaA = checkQuota('aiQueries', null, 'usr-quota-a');
    assert.strictEqual(quotaA.allowed, false, 'User A should reach daily limit');

    // User B on same browser still has full quota
    const quotaB = checkQuota('aiQueries', null, 'usr-quota-b');
    assert.strictEqual(quotaB.allowed, true, 'User B daily quota must be isolated from User A');
    assert.strictEqual(quotaB.remaining, 20);
  });

  await runTest('Backup restore enforces safety limits (file size, entry count, schema)', async () => {
    // 1. Oversized file (> 50MB) check
    const oversizedFakeFile = { size: 55 * 1024 * 1024, name: 'large.zip' };
    const overResult = await validateBackupZip(oversizedFakeFile);
    assert.strictEqual(overResult.valid, false);
    assert(overResult.error.includes('exceeds maximum allowed size'));

    // 2. Missing or corrupt metadata
    const zipNoMeta = new JSZip();
    zipNoMeta.file('random.txt', 'hello');
    const blobNoMeta = await zipNoMeta.generateAsync({ type: 'nodebuffer' });
    const noMetaRes = await validateBackupZip(blobNoMeta);
    assert.strictEqual(noMetaRes.valid, false);
    assert(noMetaRes.error.includes('metadata.json'));

    // 3. Archive entry threshold (> 500 entries)
    const zipBombEntries = new JSZip();
    zipBombEntries.file('metadata.json', JSON.stringify({
      platform: 'Prarush Platform v2.0',
      version: '2.0.0',
      exportTimestamp: new Date().toISOString()
    }));
    for (let i = 0; i < 505; i++) {
      zipBombEntries.file(`documents/file_${i}.txt`, 'a');
    }
    const bombBlob = await zipBombEntries.generateAsync({ type: 'nodebuffer' });
    const bombRes = await validateBackupZip(bombBlob);
    assert.strictEqual(bombRes.valid, false);
    assert(bombRes.error.includes('too many entries') || bombRes.error.includes('Maximum permitted'));
  });

  await runTest('Backup restore preserves authentic MIME types, handles duplicates via manifest, and overwrite mode purges old IDB files', async () => {
    const userTest = { id: `usr-restore-test-${Date.now()}`, name: 'Restore User', email: 'rest@test.local' };

    // Plant an old file in IDB for this user
    const oldBlob = new Blob(['old content'], { type: 'text/plain' });
    await saveFileToIndexedDB('doc-old-01', oldBlob, userTest.id);

    // Create a backup archive with duplicate original filenames mapped deterministically via manifest
    const zip = new JSZip();
    const manifest = [
      { id: 'doc-m1', archiveName: 'spec.pdf', archivePath: 'documents/spec.pdf', originalName: 'spec.pdf', type: 'application/pdf', size: 10 },
      { id: 'doc-m2', archiveName: 'spec_2.pdf', archivePath: 'documents/spec_2.pdf', originalName: 'spec.pdf', type: 'application/pdf', size: 10 }
    ];
    const metadata = {
      platform: 'Prarush Platform v2.0',
      version: '2.0.0',
      exportTimestamp: new Date().toISOString(),
      workspaces: [{ id: 'ws-rest', name: 'Restored WS', category: 'developer' }],
      tasks: [],
      notes: [],
      documents: [
        { id: 'doc-m1', name: 'spec.pdf', type: 'pdf' },
        { id: 'doc-m2', name: 'spec.pdf', type: 'pdf' }
      ],
      documentManifest: manifest
    };
    zip.file('metadata.json', JSON.stringify(metadata));
    zip.file('documents/spec.pdf', 'file 1 content');
    zip.file('documents/spec_2.pdf', 'file 2 content');
    const zipData = await zip.generateAsync({ type: 'nodebuffer' });

    // Restore in overwrite mode
    const res = await restoreCompleteBackupZip(zipData, userTest, { conflictStrategy: 'overwrite' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.restoredFiles, 2);

    // Verify old file was purged in overwrite mode
    const oldCheck = await getFileFromIndexedDB('doc-old-01', userTest.id);
    assert.strictEqual(oldCheck, null, 'Old file must be purged in overwrite mode');

    // Verify both files restored with correct IDs and authentic types
    const f1 = await getFileFromIndexedDB('doc-m1', userTest.id);
    const f2 = await getFileFromIndexedDB('doc-m2', userTest.id);
    assert(f1, 'First file must exist in IDB');
    assert(f2, 'Second file must exist in IDB without collision');
    assert.strictEqual(f1.type, 'application/pdf');
    assert.strictEqual(f2.type, 'application/pdf');
  });

  await runTest('claimQuarantinedLegacyFiles and migrateLegacyUnscopedData recover orphaned data safely', async () => {
    const claimUser = { id: `usr-claim-${Date.now()}`, name: 'Claim User' };

    // Plant an unowned legacy file in IDB
    const unownedBlob = new Blob(['unowned raw bytes'], { type: 'application/pdf' });
    unownedBlob.name = 'legacy_report.pdf';
    // Save directly to memoryDbStore without userId to simulate legacy quarantine
    memoryDbStore.set('legacy-doc-123', {
      id: 'legacy-doc-123',
      rawId: 'legacy-doc-123',
      name: 'legacy_report.pdf',
      type: 'application/pdf',
      size: 18,
      blob: unownedBlob
    });

    // Plant unscoped LocalStorage data
    localStorage.setItem('prarush_theme_mode', JSON.stringify(false));
    localStorage.setItem('prarush_locale', JSON.stringify('es'));

    // 1. Claim quarantined file
    const claimRes = await claimQuarantinedLegacyFiles(claimUser.id);
    assert.strictEqual(claimRes.success, true);
    assert(claimRes.claimedCount >= 1, 'Must claim at least 1 quarantined file');

    const claimedFile = await getFileFromIndexedDB('legacy-doc-123', claimUser.id);
    assert(claimedFile, 'Claimed file must be accessible to user');

    // 2. Migrate unscoped LocalStorage data
    const migRes = migrateLegacyUnscopedData(claimUser.id);
    assert.strictEqual(migRes.success, true);
    assert(migRes.migratedCount >= 2);

    // Verify migrated keys in user profile
    const userTheme = localStorage.getItem(`prarush_usr_${claimUser.id}_theme_mode`);
    const userLocale = localStorage.getItem(`prarush_usr_${claimUser.id}_locale`);
    assert.strictEqual(userTheme, 'false');
    assert.strictEqual(userLocale, '"es"');

    // CRITICAL AUDIT FIX: Verify legacy keys were purged so another profile cannot re-claim them
    assert.strictEqual(localStorage.getItem('prarush_theme_mode'), null, 'Legacy unscoped theme key must be removed');
    assert.strictEqual(localStorage.getItem('prarush_locale'), null, 'Legacy unscoped locale key must be removed');

    const secondMig = migrateLegacyUnscopedData('usr-second-person');
    assert.strictEqual(secondMig.migratedCount, 0, 'Second profile must not receive already-claimed legacy data');
  });

  await runTest('API keys are encrypted at rest with salted cipher envelope (no plaintext leakage in storage)', () => {
    const secretKeys = {
      openai: 'sk-proj-supersecretkey1234567890',
      gemini: 'AIzaSySecretGeminiKey123',
      anthropic: 'sk-ant-api03-secret',
      openrouter: 'sk-or-v1-secret'
    };
    const testUid = 'usr-vault-test';
    saveStoredApiKeys(secretKeys, testUid);

    // Read the raw stored string from sessionStorage
    const storageKey = `prarush_usr_${testUid}_cloud_api_keys`;
    const rawStored = sessionStorage.getItem(storageKey);
    assert(rawStored, 'Encrypted keys should be in sessionStorage');

    // Raw string must be an encrypted envelope and NEVER contain plaintext secret keys
    assert(!rawStored.includes('sk-proj-supersecretkey1234567890'), 'Plaintext OpenAI key must NEVER appear in storage');
    assert(!rawStored.includes('AIzaSySecretGeminiKey123'), 'Plaintext Gemini key must NEVER appear in storage');
    
    const parsedEnvelope = JSON.parse(rawStored);
    assert.strictEqual(parsedEnvelope.__encrypted, true, 'Storage payload must be encrypted envelope');
    assert.strictEqual(parsedEnvelope.v, 2, 'Storage envelope version should be 2');
    assert(parsedEnvelope.iv, 'Storage envelope must include IV');
    assert(parsedEnvelope.ciphertext, 'Storage envelope must include ciphertext');

    // getStoredApiKeys transparently decrypts it
    const decrypted = getStoredApiKeys(testUid);
    assert.strictEqual(decrypted.openai, secretKeys.openai);
    assert.strictEqual(decrypted.gemini, secretKeys.gemini);
    assert.strictEqual(decrypted.anthropic, secretKeys.anthropic);
    assert.strictEqual(decrypted.openrouter, secretKeys.openrouter);
  });

  await runTest('GDPR export strictly reads profile-scoped theme and locale', () => {
    const testUser = { id: `usr-gdpr-${Date.now()}`, name: 'GDPR Tester' };
    localStorage.setItem(`prarush_usr_${testUser.id}_theme_mode`, JSON.stringify(false));
    localStorage.setItem(`prarush_usr_${testUser.id}_locale`, JSON.stringify('fr'));
    // Set conflicting global keys
    localStorage.setItem('prarush_theme_mode', JSON.stringify(true));
    localStorage.setItem('prarush_locale', JSON.stringify('de'));

    const payload = buildUserDataGDPRPayload(testUser);
    assert.strictEqual(payload.systemPreferences.theme, false, 'GDPR export must use user-scoped theme');
    assert.strictEqual(payload.systemPreferences.locale, 'fr', 'GDPR export must use user-scoped locale');
  });

  await runTest('Service Worker sw.js uses versioned cache and network-first navigation strategy', () => {
    const swContent = fs.readFileSync('./public/sw.js', 'utf8');
    assert(swContent.includes("const MAP_TILES_CACHE = 'prarush-map-tiles'"), 'sw.js must define MAP_TILES_CACHE');
    assert(swContent.includes('PRESERVED_CACHES'), 'sw.js must use PRESERVED_CACHES to prevent cache deletion');
    assert(swContent.includes('const SW_VERSION ='), 'sw.js must define a versioned cache');
    assert(swContent.includes('isHtmlNavigation'), 'sw.js must identify HTML navigation requests');
    assert(swContent.includes('SKIP_WAITING'), 'sw.js must support SKIP_WAITING message');
  });

  await runTest('Vercel configuration includes comprehensive Content Security Policy (CSP)', () => {
    const vercelContent = fs.readFileSync('./vercel.json', 'utf8');
    const config = JSON.parse(vercelContent);
    const headers = config.headers[0].headers;
    const csp = headers.find(h => h.key === 'Content-Security-Policy');
    assert(csp, 'vercel.json must define Content-Security-Policy header');
    assert(csp.value.includes("default-src 'self'"), 'CSP must set default-src');
    assert(csp.value.includes('https://api.anthropic.com'), 'CSP must permit Anthropic BYOK endpoint');
    assert(csp.value.includes('https://api.openai.com'), 'CSP must permit OpenAI BYOK endpoint');
    assert(csp.value.includes('https://generativelanguage.googleapis.com'), 'CSP must permit Gemini BYOK endpoint');
  });

  await runTest('Universal AI feature helpers function properly with fallback and context', async () => {
    // Test document summarizer fallback
    const docSummary = await summarizeDocumentText('System architecture overview: Prarush uses local-first IndexedDB and encrypted BYOK keys.', 'Architecture.md');
    assert(docSummary, 'Document summary should return a response object');
    assert(docSummary.title || docSummary.text || docSummary.keyFindings, 'Should contain summarization fields');

    // Test task decomposition
    const taskBreakdown = await breakdownTask('Implement WebSocket synchronization');
    assert(taskBreakdown, 'Task breakdown should return response');
    assert(taskBreakdown.modelUsed, 'Should record modelUsed');

    // Test knowledge RAG query
    const ragAnswer = await answerKnowledgeQuery('How is data stored?', [{ source: 'DB Docs', snippet: 'Data is stored in IndexedDB and localStorage scoped by user id' }]);
    assert(ragAnswer, 'RAG answer should return response');

    // Test live image generator without keys
    const imgResult = await generatePrarushImageLive('A sleek futuristic developer IDE', 'minimalist');
    assert(imgResult.imageUrl, 'Image result should have imageUrl');
    assert.strictEqual(imgResult.isDemoPreview, true, 'Without keys, should return curated demo image');
  });

  await runTest('API Key Manager incorporates live call helpers and handles BYOK vault', () => {
    assert.strictEqual(typeof callRealDalle3, 'function', 'callRealDalle3 must be exported');
    assert.strictEqual(typeof callRealWhisper, 'function', 'callRealWhisper must be exported');
    
    // Check key retrieval with user
    const keys = getStoredApiKeys('test-env-user');
    assert(typeof keys === 'object', 'getStoredApiKeys should return an object');
    assert('openai' in keys && 'gemini' in keys && 'anthropic' in keys && 'openrouter' in keys, 'Should contain all 4 provider keys');
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
