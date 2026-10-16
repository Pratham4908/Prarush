// Prarush Universal Platform: Client-Side API Key & Provider Connection Manager
// Enables Bring-Your-Own-Key (BYOK) for direct inference with OpenAI, Gemini, Anthropic, or OpenRouter

const API_KEYS_STORAGE_KEY = 'prarush_cloud_api_keys';

export function getStoredApiKeys() {
  try {
    const raw = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { openai: '', gemini: '', anthropic: '', openrouter: '' };
  } catch {
    return { openai: '', gemini: '', anthropic: '', openrouter: '' };
  }
}

export function saveStoredApiKeys(keys) {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch (err) {
    console.warn('Failed to save API keys:', err);
  }
}

export function hasActiveApiKey() {
  const keys = getStoredApiKeys();
  return Boolean(keys.openai || keys.gemini || keys.anthropic || keys.openrouter);
}

// Call live OpenAI API if key is present
export async function callRealOpenAI(prompt, apiKey, model = 'gpt-4o-mini') {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
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
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

// Call live Google Gemini API if key is present
export async function callRealGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}
