// Prarush Universal Platform: Client-Side API Key & Provider Connection Manager
// Enables Bring-Your-Own-Key (BYOK) for direct inference with OpenAI, Gemini, Anthropic, or OpenRouter
// Transparently routes prompts directly from the client to the chosen provider without proxy tracking.

const API_KEYS_STORAGE_KEY = 'prarush_cloud_api_keys';

export function getStoredApiKeys() {
  try {
    // Check sessionStorage first (safer memory-like session), then fallback to localStorage
    const sessionRaw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(API_KEYS_STORAGE_KEY) : null;
    if (sessionRaw) {
      return JSON.parse(sessionRaw);
    }
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(API_KEYS_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : { openai: '', gemini: '', anthropic: '', openrouter: '', sessionOnly: false };
  } catch {
    return { openai: '', gemini: '', anthropic: '', openrouter: '', sessionOnly: false };
  }
}

export function saveStoredApiKeys(keys) {
  try {
    const payload = {
      openai: (keys.openai || '').trim(),
      gemini: (keys.gemini || '').trim(),
      anthropic: (keys.anthropic || '').trim(),
      openrouter: (keys.openrouter || '').trim(),
      sessionOnly: Boolean(keys.sessionOnly)
    };

    if (payload.sessionOnly && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(payload));
      if (typeof localStorage !== 'undefined') localStorage.removeItem(API_KEYS_STORAGE_KEY);
    } else {
      if (typeof localStorage !== 'undefined') localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch (err) {
    console.warn('Failed to save API keys:', err);
  }
}

export function hasActiveApiKey() {
  const keys = getStoredApiKeys();
  return Boolean(keys.openai || keys.gemini || keys.anthropic || keys.openrouter);
}

// Call live OpenAI API if key is present
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
        { role: 'system', content: 'You are Prarush, an expert AI productivity assistant for software engineering, academic research, and creative workflows.' },
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

// Call live Google Gemini API using header-based authentication (never query string key)
export async function callRealGemini(prompt, apiKey, model = 'gemini-1.5-flash') {
  if (!apiKey) throw new Error('Gemini API key is missing.');

  // Normalize model identifier
  const targetModel = model.includes('pro') ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Pass API key via standard Google REST header, keeping URL clean of secrets
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

// Call live Anthropic Messages API (Claude 3.5 Sonnet)
export async function callRealAnthropic(prompt, apiKey, model = 'claude-3-5-sonnet-20241022') {
  if (!apiKey) throw new Error('Anthropic API key is missing.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for direct browser-to-Anthropic inference without proxy
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20241022',
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

// Call live OpenRouter API for open-source or commercial models
export async function callRealOpenRouter(prompt, apiKey, model = 'anthropic/claude-3.5-sonnet') {
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
      model: model || 'anthropic/claude-3.5-sonnet',
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
