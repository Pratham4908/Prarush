// Prarush Universal Platform: Client-Side API Key & Provider Connection Manager
// Enables Bring-Your-Own-Key (BYOK) for direct inference with OpenAI, Gemini, Anthropic, or OpenRouter
// Transparently routes prompts directly from the client to the chosen provider without proxy tracking.

export function getApiKeysStorageKey(userId = null) {
  let uid = userId ? String(userId).trim() : null;
  if (!uid && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('prarush_active_session');
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess?.user?.id) uid = sess.user.id;
      }
    } catch {}
  }
  return uid ? `prarush_usr_${uid}_cloud_api_keys` : 'prarush_cloud_api_keys';
}

// Client-Side Encryption at Rest for BYOK API Keys
// Encrypts credentials with salted multi-round keystream derived per-profile to protect keys at rest
function getVaultDeviceSalt() {
  if (typeof localStorage === 'undefined') return 'prarush_static_vault_salt_2026';
  try {
    let salt = localStorage.getItem('prarush_vault_device_salt');
    if (!salt) {
      const bytes = globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint8Array(16)) : [1, 2, 3, 4, 5, 6, 7, 8];
      salt = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('prarush_vault_device_salt', salt);
    }
    return salt;
  } catch {
    return 'prarush_fallback_vault_salt';
  }
}

export function encryptApiKeyVault(plaintext, userId = null) {
  try {
    const utf8Text = encodeURIComponent(plaintext);
    const randomBytes = globalThis.crypto?.getRandomValues
      ? globalThis.crypto.getRandomValues(new Uint8Array(16))
      : [12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12];
    const iv = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const deviceSalt = getVaultDeviceSalt();
    const seed = `${userId || 'guest'}_prarush_vault_${deviceSalt}_${iv}`;
    
    let key = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
      key = Math.imul(key ^ seed.charCodeAt(i), 0x01000193);
    }
    
    let ciphertext = '';
    for (let i = 0; i < utf8Text.length; i++) {
      key = Math.imul(key ^ (i + 19), 0x01000193);
      const byte = (key >>> 24) & 0xff;
      const enc = utf8Text.charCodeAt(i) ^ byte;
      ciphertext += enc.toString(16).padStart(4, '0');
    }
    
    return JSON.stringify({ __encrypted: true, v: 2, iv, ciphertext });
  } catch (err) {
    console.warn('API key encryption warning:', err);
    return plaintext;
  }
}

export function decryptApiKeyVault(raw, userId = null) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    // If not encrypted, return legacy plaintext object
    if (!parsed || !parsed.__encrypted) return parsed;
    
    const { iv, ciphertext } = parsed;
    if (!iv || !ciphertext) return null;
    
    const deviceSalt = getVaultDeviceSalt();
    const seed = `${userId || 'guest'}_prarush_vault_${deviceSalt}_${iv}`;
    
    let key = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
      key = Math.imul(key ^ seed.charCodeAt(i), 0x01000193);
    }
    
    let plain = '';
    for (let i = 0; i < ciphertext.length; i += 4) {
      const enc = parseInt(ciphertext.slice(i, i + 4), 16);
      key = Math.imul(key ^ ((i / 4) + 19), 0x01000193);
      const byte = (key >>> 24) & 0xff;
      plain += String.fromCharCode(enc ^ byte);
    }
    
    return JSON.parse(decodeURIComponent(plain));
  } catch (err) {
    console.warn('API key decryption warning:', err);
    return null;
  }
}

function getEnvKey(envVarName) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[envVarName]) {
      return String(import.meta.env[envVarName]).trim();
    }
  } catch {}
  return '';
}

export function getStoredApiKeys(userId = null) {
  const scopedKey = getApiKeysStorageKey(userId);
  let resolved = { openai: '', gemini: '', anthropic: '', openrouter: '', sessionOnly: true };
  try {
    // 1. Check user-scoped sessionStorage
    const sessionRaw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(scopedKey) : null;
    if (sessionRaw) {
      const decrypted = decryptApiKeyVault(sessionRaw, userId);
      if (decrypted) resolved = decrypted;
    } else {
      // 2. Check user-scoped localStorage
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(scopedKey) : null;
      if (raw) {
        const decrypted = decryptApiKeyVault(raw, userId);
        if (decrypted) resolved = decrypted;
      } else if (scopedKey === 'prarush_cloud_api_keys') {
        // 3. Fallback to legacy unscoped key only if guest/unspecified
        const legacyRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('prarush_cloud_api_keys') : null;
        if (legacyRaw) {
          const decrypted = decryptApiKeyVault(legacyRaw, userId);
          if (decrypted) resolved = decrypted;
        }
      }
    }
  } catch {}

  // Merge with environment variables (.env / Vercel secrets) if not explicitly configured in browser
  return {
    openai: resolved.openai || getEnvKey('VITE_OPENAI_API_KEY'),
    gemini: resolved.gemini || getEnvKey('VITE_GEMINI_API_KEY'),
    anthropic: resolved.anthropic || getEnvKey('VITE_ANTHROPIC_API_KEY'),
    openrouter: resolved.openrouter || getEnvKey('VITE_OPENROUTER_API_KEY'),
    sessionOnly: resolved.sessionOnly !== undefined ? resolved.sessionOnly : true,
    hasEnvKeys: Boolean(
      getEnvKey('VITE_OPENAI_API_KEY') || 
      getEnvKey('VITE_GEMINI_API_KEY') || 
      getEnvKey('VITE_ANTHROPIC_API_KEY') || 
      getEnvKey('VITE_OPENROUTER_API_KEY')
    )
  };
}

export function saveStoredApiKeys(keys, userId = null) {
  const scopedKey = getApiKeysStorageKey(userId);
  try {
    const sessionOnly = keys.sessionOnly !== undefined ? Boolean(keys.sessionOnly) : true;
    const payload = {
      openai: (keys.openai || '').trim(),
      gemini: (keys.gemini || '').trim(),
      anthropic: (keys.anthropic || '').trim(),
      openrouter: (keys.openrouter || '').trim(),
      sessionOnly
    };

    // Encrypt payload before persisting to storage at rest
    const encryptedPayload = encryptApiKeyVault(JSON.stringify(payload), userId);

    if (payload.sessionOnly && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(scopedKey, encryptedPayload);
      if (typeof localStorage !== 'undefined') localStorage.removeItem(scopedKey);
    } else {
      if (typeof localStorage !== 'undefined') localStorage.setItem(scopedKey, encryptedPayload);
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(scopedKey);
    }
  } catch (err) {
    console.warn('Failed to save API keys:', err);
  }
}

// Completely remove and purge stored API keys for the user profile
export function purgeAllApiKeys(userId = null) {
  const scopedKey = getApiKeysStorageKey(userId);
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(scopedKey);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(scopedKey);
    if (scopedKey !== 'prarush_cloud_api_keys') {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('prarush_cloud_api_keys');
      if (typeof localStorage !== 'undefined') localStorage.removeItem('prarush_cloud_api_keys');
    }
    return true;
  } catch (err) {
    console.warn('Failed to purge API keys:', err);
    return false;
  }
}

export function hasActiveApiKey(userId = null) {
  const keys = getStoredApiKeys(userId);
  return Boolean(keys.openai || keys.gemini || keys.anthropic || keys.openrouter);
}

// Call live OpenAI API
export async function callRealOpenAI(prompt, apiKey, model = 'gpt-4o') {
  if (!apiKey) throw new Error('OpenAI API key is missing.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Prarush, an expert AI productivity assistant for software engineering and technical workflows.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `OpenAI API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated from OpenAI.';
}

// Call live Google Gemini API using active Gemini 3.8 Flash / Pro series
export async function callRealGemini(prompt, apiKey, model = 'gemini-3.8-flash') {
  if (!apiKey) throw new Error('Gemini API key is missing.');

  // Target active Gemini 3.8 Flash / 3.1 Pro (replacing restricted 2.5 and retired 2.0/1.5)
  const targetModel = model || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from Gemini.';
}

// Call live Anthropic Messages API using active Claude Sonnet
export async function callRealAnthropic(prompt, apiKey, model = 'claude-sonnet-4-5') {
  if (!apiKey) throw new Error('Anthropic API key is missing.');

  // Use active dateless/stable model ID (replacing retired claude-3-7-sonnet-20250219 and claude-3-5)
  const targetModel = model || 'claude-sonnet-4-5';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: targetModel,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Anthropic API returned status ${response.status}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(b => b.type === 'text');
  return textBlock?.text || 'No response generated from Claude.';
}

// Call live OpenRouter API for open-weights models (Llama 3.3 70B)
export async function callRealOpenRouter(prompt, apiKey, model = 'meta-llama/llama-3.3-70b-instruct') {
  if (!apiKey) throw new Error('OpenRouter API key is missing.');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://prarush.local';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': origin,
      'X-Title': 'Prarush Platform'
    },
    body: JSON.stringify({
      model: model || 'meta-llama/llama-3.3-70b-instruct',
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `OpenRouter API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated from OpenRouter.';
}

// Call live OpenAI DALL-E 3 Image Generation API
export async function callRealDalle3(prompt, apiKey, style = 'vivid') {
  if (!apiKey) throw new Error('OpenAI API key is missing.');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      style: style === 'natural' ? 'natural' : 'vivid',
      quality: 'standard'
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `DALL-E 3 returned status ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0]?.url || null;
}

// Call live OpenAI Whisper Speech-to-Text Transcription API
export async function callRealWhisper(audioBlob, apiKey) {
  if (!apiKey) throw new Error('OpenAI API key is missing.');

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Whisper API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.text || '';
}
