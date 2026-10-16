// Prarush Universal AI Multi-Model Intelligence Engine
// Supports Prarush Local Engine, Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, and Llama 3
// Transparently distinguishes live external cloud inference from deterministic offline rule-based fallbacks.

export const AI_MODELS = [
  {
    id: 'prarush-local-engine',
    aliasId: 'prarush-neural-4',
    name: 'Prarush Local Engine (Offline Rules)',
    provider: 'Built-in Local Sandbox',
    icon: '⚡',
    badge: 'OFFLINE',
    badgeColor: '#06b6d4',
    contextWindow: 'Local Workspace Context',
    speed: 'Instant (<10 ms local)',
    costPer1k: 'Free ($0.00)',
    strengths: 'Offline task templates, deterministic code/markdown generation without external API keys or cloud dependencies'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    icon: '🧠',
    badge: 'LIVE BYOK',
    badgeColor: '#f59e0b',
    contextWindow: '200K Tokens',
    speed: 'Est. 500-1500 ms (Cloud)',
    costPer1k: '~$0.0030 (Provider Est.)',
    strengths: 'Nuanced prose, high-level system architecture, complex document and logic analysis'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omni',
    provider: 'OpenAI',
    icon: '🌐',
    badge: 'LIVE BYOK',
    badgeColor: '#10b981',
    contextWindow: '128K Tokens',
    speed: 'Est. 500-1200 ms (Cloud)',
    costPer1k: '~$0.0025 (Provider Est.)',
    strengths: 'Multimodal vision, cross-domain logic, mathematical problem solving'
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google DeepMind',
    icon: '✨',
    badge: 'LIVE BYOK',
    badgeColor: '#8b5cf6',
    contextWindow: '1M+ Tokens',
    speed: 'Est. 600-1500 ms (Cloud)',
    costPer1k: '~$0.0035 (Provider Est.)',
    strengths: 'Ultra-long document retrieval, video comprehension, academic literature grounding'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B Open',
    provider: 'Meta / OpenRouter',
    icon: '🦙',
    badge: 'OPEN BYOK',
    badgeColor: '#38bdf8',
    contextWindow: '8K Tokens',
    speed: 'Est. 400-1000 ms (Cloud)',
    costPer1k: '~$0.0008 (Provider Est.)',
    strengths: 'Open-weights foundation model, accessible via OpenRouter BYOK key'
  }
];

import { 
  getStoredApiKeys, 
  callRealOpenAI, 
  callRealGemini, 
  callRealAnthropic, 
  callRealOpenRouter 
} from './apiKeyManager.js';

// Process queries across the Prarush Universal Platform with honest routing and clear labeling
export async function processPrarushAIQuery(prompt, modelId = 'prarush-local-engine', context = {}) {
  const q = prompt.trim().toLowerCase();
  
  // Resolve model, honoring both current and legacy alias IDs
  const selectedModel = AI_MODELS.find(m => m.id === modelId || m.aliasId === modelId) || AI_MODELS[0];
  const keys = getStoredApiKeys();

  // 1. Direct Live Routing: Anthropic (Claude 3.5 Sonnet)
  if (selectedModel.id === 'claude-3-5-sonnet') {
    if (keys.anthropic) {
      try {
        const liveAnswer = await callRealAnthropic(prompt, keys.anthropic, 'claude-3-5-sonnet-20241022');
        return {
          type: 'live_llm_response',
          modelUsed: `${selectedModel.name} (Live Anthropic API)`,
          title: `🧠 Live Cloud Response from ${selectedModel.name}`,
          text: liveAnswer,
          isLiveApi: true,
          provider: 'Anthropic',
          suggestedActions: [
            { label: 'Create Kanban Task', actionType: 'create_task' },
            { label: 'Save as Note', actionType: 'create_note' },
            { label: 'Export Code', actionType: 'create_code' }
          ]
        };
      } catch (err) {
        console.warn('Live Anthropic call failed, falling back to local engine:', err.message);
      }
    } else if (keys.openrouter) {
      try {
        const liveAnswer = await callRealOpenRouter(prompt, keys.openrouter, 'anthropic/claude-3.5-sonnet');
        return {
          type: 'live_llm_response',
          modelUsed: `${selectedModel.name} (Live via OpenRouter)`,
          title: `🧠 Live Cloud Response from ${selectedModel.name}`,
          text: liveAnswer,
          isLiveApi: true,
          provider: 'OpenRouter',
          suggestedActions: [
            { label: 'Create Kanban Task', actionType: 'create_task' },
            { label: 'Save as Note', actionType: 'create_note' },
            { label: 'Export Code', actionType: 'create_code' }
          ]
        };
      } catch (err) {
        console.warn('Live OpenRouter call failed:', err.message);
      }
    }
    // Anthropic key is NOT configured. Never disguise another provider as Claude.
    // Proceed to return explicit fallback.
  }

  // 2. Direct Live Routing: OpenAI (GPT-4o)
  if (selectedModel.id === 'gpt-4o' && keys.openai) {
    try {
      const liveAnswer = await callRealOpenAI(prompt, keys.openai, 'gpt-4o');
      return {
        type: 'live_llm_response',
        modelUsed: `${selectedModel.name} (Live OpenAI API)`,
        title: `🌐 Live Cloud Response from ${selectedModel.name}`,
        text: liveAnswer,
        isLiveApi: true,
        provider: 'OpenAI',
        suggestedActions: [
          { label: 'Create Kanban Task', actionType: 'create_task' },
          { label: 'Save as Note', actionType: 'create_note' },
          { label: 'Export Code', actionType: 'create_code' }
        ]
      };
    } catch (apiErr) {
      console.warn('Live OpenAI call failed, falling back to local engine:', apiErr.message);
    }
  }

  // 3. Direct Live Routing: Google Gemini 1.5 Pro
  if (selectedModel.id === 'gemini-1-5-pro' && keys.gemini) {
    try {
      const liveAnswer = await callRealGemini(prompt, keys.gemini, 'gemini-1.5-pro');
      return {
        type: 'live_llm_response',
        modelUsed: `${selectedModel.name} (Live Google Gemini API)`,
        title: `✨ Live Cloud Response from ${selectedModel.name}`,
        text: liveAnswer,
        isLiveApi: true,
        provider: 'Google DeepMind',
        suggestedActions: [
          { label: 'Create Kanban Task', actionType: 'create_task' },
          { label: 'Save as Note', actionType: 'create_note' },
          { label: 'Export Code', actionType: 'create_code' }
        ]
      };
    } catch (apiErr) {
      console.warn('Live Gemini call failed, falling back to local engine:', apiErr.message);
    }
  }

  // 4. Direct Live Routing: Llama 3 via OpenRouter
  if (selectedModel.id === 'llama-3-70b' && keys.openrouter) {
    try {
      const liveAnswer = await callRealOpenRouter(prompt, keys.openrouter, 'meta-llama/llama-3-70b-instruct');
      return {
        type: 'live_llm_response',
        modelUsed: `${selectedModel.name} (Live OpenRouter API)`,
        title: `🦙 Live Cloud Response from ${selectedModel.name}`,
        text: liveAnswer,
        isLiveApi: true,
        provider: 'OpenRouter / Meta',
        suggestedActions: [
          { label: 'Create Kanban Task', actionType: 'create_task' },
          { label: 'Save as Note', actionType: 'create_note' }
        ]
      };
    } catch (err) {
      console.warn('Live Llama 3 call failed:', err.message);
    }
  }

  // Determine fallback label honestly
  const isFallback = selectedModel.id !== 'prarush-local-engine' && selectedModel.id !== 'prarush-neural-4';
  const fallbackNotice = isFallback 
    ? `Notice: ${selectedModel.name} API key is not configured in Model Hub. Generated using Prarush Local Offline Rules.`
    : 'Generated locally via Prarush deterministic offline engine.';

  const displayModelName = isFallback
    ? `Local Fallback (${selectedModel.name} Key Not Configured)`
    : 'Prarush Local Engine (Offline Rules)';

  // 1. Code Generation Intent
  if (q.includes('code') || q.includes('function') || q.includes('component') || q.includes('python') || q.includes('react') || q.includes('javascript') || q.includes('api') || q.includes('sql')) {
    return {
      type: 'code_generation',
      modelUsed: displayModelName,
      title: '💻 Code Generation (Local Rule Template)',
      isLiveApi: false,
      disclaimer: fallbackNotice,
      language: q.includes('python') ? 'python' : q.includes('sql') ? 'sql' : 'typescript',
      code: q.includes('python')
        ? `def calculate_moving_average(data: list[float], window_size: int = 5) -> list[float]:\n    """Computes simple moving average over a sliding numerical window."""\n    if not data or window_size <= 0:\n        return []\n    averages = []\n    for i in range(len(data) - window_size + 1):\n        window = data[i:i + window_size]\n        averages.append(round(sum(window) / window_size, 4))\n    return averages`
        : q.includes('sql')
        ? `SELECT \n  user_id,\n  COUNT(task_id) AS completed_tasks,\n  ROUND(AVG(completion_time_hours), 2) AS avg_hours\nFROM prarush_productivity_metrics\nWHERE completed_at >= NOW() - INTERVAL '30 days'\nGROUP BY user_id\nHAVING COUNT(task_id) > 10\nORDER BY completed_tasks DESC;`
        : `import React, { useState } from 'react';\n\ninterface TaskProps {\n  title: string;\n  priority: 'low' | 'medium' | 'high';\n  onComplete: () => void;\n}\n\nexport const SmartTaskCard: React.FC<TaskProps> = ({ title, priority, onComplete }) => {\n  const [isDone, setIsDone] = useState(false);\n  return (\n    <div className="p-4 rounded-xl border border-glass bg-card hover:border-cyan-500 transition-all">\n      <h3 className="font-bold text-white">{title}</h3>\n      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400">{priority}</span>\n      <button onClick={() => { setIsDone(true); onComplete(); }} className="mt-2 text-xs text-emerald-400">Mark Completed ✓</button>\n    </div>\n  );\n};`,
      explanation: `Generated offline code structure via local template engine. To generate context-aware code with live models, connect your provider key in the Model Hub.`,
      citations: ['Local Template Catalog', 'PEP 8 Specification']
    };
  }

  // 2. Presentation / Slide Deck Generation
  if (q.includes('presentation') || q.includes('slide') || q.includes('pitch deck') || q.includes('keynote')) {
    return {
      type: 'presentation_generation',
      modelUsed: displayModelName,
      title: '📊 Presentation Deck Blueprint (Local Template)',
      isLiveApi: false,
      disclaimer: fallbackNotice,
      deckTitle: 'Prarush: Local-First Digital Operating Canvas',
      slides: [
        {
          slideNumber: 1,
          title: 'The Problem: Workspace Fragmentation',
          bullets: [
            'Developers switch between separate note apps, task trackers, and disconnected AI tabs',
            'Context fracture destroys flow and fragments project progress',
            'Siloed AI tools lack awareness of your local tasks and notes'
          ]
        },
        {
          slideNumber: 2,
          title: 'The Solution: Prarush Unified Canvas',
          bullets: [
            'Local-first architecture keeps tasks, notes, documents, and code on your device',
            'Multi-Model AI Hub with BYOK enables direct provider inference with zero vendor lock-in',
            'Offline-ready PWA ensures instant loading and zero server latency'
          ]
        },
        {
          slideNumber: 3,
          title: 'Developer Roadmap & Extensibility',
          bullets: [
            'Open extensible storage keys allow seamless JSON export and automated backup',
            'Bring-Your-Own-Key model eliminates surprise cloud markup and token caps',
            'Ready for native mobile packaging via standard web technologies'
          ]
        }
      ],
      explanation: 'Generated 3 executive slides ready for export to markdown or HTML5 presentation.'
    };
  }

  // 3. Document / Content Summarization
  if (q.includes('summarize') || q.includes('proofread') || q.includes('rewrite') || q.includes('tldr') || q.includes('review')) {
    return {
      type: 'summarization',
      modelUsed: displayModelName,
      title: '📝 Document Summary (Local Rules)',
      isLiveApi: false,
      disclaimer: fallbackNotice,
      keyFindings: [
        'Local-first architecture guarantees client data ownership without mandatory cloud sync.',
        'BYOK (Bring-Your-Own-Key) allows direct communication with AI providers without third-party proxy logging.',
        'Offline capability ensures uninterrupted workflow during travel or network outages.'
      ],
      suggestedImprovements: [
        'Connect an API key in Model Hub for deep semantic synthesis.',
        'Export workspace snapshot as JSON for offline backup.'
      ],
      readabilityScore: 'Estimated High Clarity',
      wordCountReduced: 'Local structural summary'
    };
  }

  // 4. Research & Fact-Checking
  if (q.includes('research') || q.includes('verify') || q.includes('fact') || q.includes('citation') || q.includes('compare models')) {
    return {
      type: 'research',
      modelUsed: displayModelName,
      title: '🔍 Reference Specifications & Model Details',
      isLiveApi: false,
      disclaimer: fallbackNotice,
      verifiedFacts: [
        'Context Windows (Provider Specs): Claude 3.5 Sonnet supports 200k tokens; Gemini 1.5 Pro scales up to 1M+ tokens.',
        'Privacy Protocol: Prarush stores tasks and notes locally in the browser; BYOK keys connect directly via HTTPS.',
        'Data Portability: Full workspace data can be exported in standard JSON format.'
      ],
      citations: [
        'Anthropic Model Documentation (claude-3-5-sonnet)',
        'Google Cloud Generative AI Documentation (gemini-1.5-pro)',
        'OpenAI API Reference (gpt-4o)'
      ]
    };
  }

  // 5. Default Conversational Assistant Completion
  return {
    type: 'general_assistant',
    modelUsed: displayModelName,
    title: `⚡ Local Assistant Response`,
    isLiveApi: false,
    disclaimer: fallbackNotice,
    text: `Request: "${prompt}".\n\nPrarush gives you a unified local-first workspace for software engineering and technical projects.\n\n* Note: To receive live answers from Claude, GPT-4o, or Gemini, connect your API key in the Model Hub. In local mode, you can turn this item into a **Kanban Task**, create a **Markdown Note**, or structure a **Code Snippet**.\n\nWhat would you like to execute?`,
    suggestedActions: [
      { label: 'Create Kanban Task', actionType: 'create_task' },
      { label: 'Save as Note', actionType: 'create_note' },
      { label: 'Open Model Hub (BYOK)', actionType: 'open_model_hub' }
    ]
  };
}

// AI Image Generation Simulation with creative styles
export function generatePrarushImage(promptText, style = 'cinematic') {
  const stylesMap = {
    cinematic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    cyberpunk: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    minimalist: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    photorealistic: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    abstract: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80'
  };

  return {
    id: `img-${Date.now()}`,
    prompt: promptText,
    style,
    imageUrl: stylesMap[style] || stylesMap.cinematic,
    generatedAt: new Date().toISOString(),
    resolution: '1024x1024 Preview',
    model: 'Prarush Visual Canvas (Sample Preview)',
    isDemoPreview: true,
    disclaimer: 'Curated visual style demo. Connect Replicate, Stability AI, or DALL-E API for live generative rendering.'
  };
}
