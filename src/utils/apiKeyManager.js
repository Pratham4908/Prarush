// Prarush Universal Platform: Client-Side API Key & Provider Connection Manager
// Enables Bring-Your-Own-Key (BYOK) for direct inference with OpenAI, Gemini, Anthropic, or OpenRouter
// Transparently routes prompts directly from the client to the chosen provider without proxy tracking.

const API_KEYS_STORAGE_KEY = 'prarush_cloud_api_keys';

export function getStoredApiKeys() {
  try {
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

// Call live Google Gemini API using active Gemini 2.5 series
export async function callRealGemini(prompt, apiKey, model = 'gemini-2.5-flash') {
  if (!apiKey) throw new Error('Gemini API key is missing.');

  // Target active Gemini 2.5 series (replacing deprecated 1.5)
  const targetModel = model.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
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

// Call live Anthropic Messages API using active Claude 3.7 Sonnet
export async function callRealAnthropic(prompt, apiKey, model = 'claude-3-7-sonnet-20250219') {
  if (!apiKey) throw new Error('Anthropic API key is missing.');

  const targetModel = model || 'claude-3-7-sonnet-20250219';

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
