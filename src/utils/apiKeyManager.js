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

export function getStoredApiKeys(userId = null) {
  const scopedKey = getApiKeysStorageKey(userId);
  try {
    // 1. Check user-scoped sessionStorage
    const sessionRaw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(scopedKey) : null;
    if (sessionRaw) {
      return JSON.parse(sessionRaw);
    }
    // 2. Check user-scoped localStorage
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(scopedKey) : null;
    if (raw) {
      return JSON.parse(raw);
    }
    // 3. Fallback to legacy unscoped key only if guest/unspecified
    if (scopedKey === 'prarush_cloud_api_keys') {
      const legacyRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('prarush_cloud_api_keys') : null;
      if (legacyRaw) return JSON.parse(legacyRaw);
    }
    return { openai: '', gemini: '', anthropic: '', openrouter: '', sessionOnly: true };
  } catch {
    return { openai: '', gemini: '', anthropic: '', openrouter: '', sessionOnly: true };
  }
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

    if (payload.sessionOnly && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(scopedKey, JSON.stringify(payload));
      if (typeof localStorage !== 'undefined') localStorage.removeItem(scopedKey);
    } else {
      if (typeof localStorage !== 'undefined') localStorage.setItem(scopedKey, JSON.stringify(payload));
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
