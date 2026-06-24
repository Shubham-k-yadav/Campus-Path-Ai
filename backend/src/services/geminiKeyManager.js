const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/**
 * ─── Unified Multi-Provider AI Key Rotation Manager ─────────────────────────
 * Supports:
 *   1. Google Gemini Keys (GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4)
 *   2. Groq Keys         (GROQ_API_KEY, GROQ_API_KEY_2) - Fully FREE, high rate-limit
 *   3. OpenAI Keys       (OPENAI_API_KEY, OPENAI_API_KEY_2)
 *
 * Implements a transparent adapter so existing backend code written for the
 * `@google/generative-ai` SDK can call Groq and OpenAI without changing a line of code!
 */

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
];

// Adapter to match OpenAI & Groq APIs to standard Google SDK methods
class GeminiOpenAIAdapter {
  constructor(apiKey, provider = 'groq') {
    this.apiKey = apiKey;
    this.provider = provider;
  }

  getGenerativeModel({ model, generationConfig }) {
    const apiKey = this.apiKey;
    const provider = this.provider;

    return {
      generateContent: async (prompt) => {
        let url, headers, body;
        const temperature = generationConfig?.temperature ?? 0.1;

        if (provider === 'groq') {
          url = 'https://api.groq.com/openai/v1/chat/completions';
          headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          
          // Map to standard Groq models
          // Llama-3.3-70b-versatile is extremely powerful and fully supports JSON mode
          const actualModel = model.includes('pro') 
            ? 'llama-3.3-70b-versatile' 
            : 'llama-3.3-70b-versatile'; 
            
          body = {
            model: actualModel,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature
          };
        } else if (provider === 'openai') {
          url = 'https://api.openai.com/v1/chat/completions';
          headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          
          const actualModel = model.includes('pro') ? 'gpt-4o' : 'gpt-4o-mini';
          
          body = {
            model: actualModel,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature
          };
        }

        try {
          const response = await axios.post(url, body, { headers, timeout: 25000 });
          const textContent = response.data?.choices?.[0]?.message?.content;
          if (!textContent) {
            throw new Error(`Empty response from ${provider} API`);
          }

          return {
            response: {
              text: () => textContent
            }
          };
        } catch (err) {
          const errorMsg = err.response?.data?.error?.message || err.message;
          throw new Error(`[${provider.toUpperCase()} Error]: ${errorMsg}`);
        }
      }
    };
  }
}

// Collect all active keys from env
const collectApiKeys = () => {
  const keys = [];
  
  // 1. Google Gemini Keys
  const geminiVars = ['GEMINI_API_KEY', 'GEMINI_API_KEY_2', 'GEMINI_API_KEY_3', 'GEMINI_API_KEY_4'];
  for (const varName of geminiVars) {
    const key = process.env[varName];
    if (key && key.trim() && !key.includes('your_gemini')) {
      keys.push({ key: key.trim(), label: varName, provider: 'gemini', cooldownUntil: 0 });
    }
  }

  // 2. Groq Keys (Excellent Free Option)
  const groqVars = ['GROQ_API_KEY', 'GROQ_API_KEY_2'];
  for (const varName of groqVars) {
    const key = process.env[varName];
    if (key && key.trim() && !key.includes('your_groq')) {
      keys.push({ key: key.trim(), label: varName, provider: 'groq', cooldownUntil: 0 });
    }
  }

  // 3. OpenAI Keys
  const openaiVars = ['OPENAI_API_KEY', 'OPENAI_API_KEY_2'];
  for (const varName of openaiVars) {
    const key = process.env[varName];
    if (key && key.trim() && !key.includes('your_openai')) {
      keys.push({ key: key.trim(), label: varName, provider: 'openai', cooldownUntil: 0 });
    }
  }

  if (keys.length === 0) {
    throw new Error('No valid GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY found in environment variables.');
  }

  console.log(`🔑 [KeyManager] Loaded ${keys.length} API key(s): ${keys.map(k => `${k.label} (${k.provider})`).join(', ')}`);
  return keys;
};

let _keys = null;
let _currentKeyIndex = 0;

const getKeys = () => {
  if (!_keys) _keys = collectApiKeys();
  return _keys;
};

// Set cooldown for a key
const markKeyCoolingDown = (keyLabel, cooldownMs = 60000) => {
  try {
    const keys = getKeys();
    const entry = keys.find(k => k.label === keyLabel);
    if (entry) {
      entry.cooldownUntil = Date.now() + cooldownMs;
      console.warn(`⏳ [KeyManager] Key "${keyLabel}" (${entry.provider}) cooling down for ${cooldownMs / 1000}s`);
    }
  } catch (e) {
    console.error('Error cooling down key:', e.message);
  }
};

// Select next active key
const getNextAvailableKey = () => {
  const keys = getKeys();
  const now = Date.now();

  for (let i = 0; i < keys.length; i++) {
    const idx = (_currentKeyIndex + i) % keys.length;
    if (keys[idx].cooldownUntil <= now) {
      _currentKeyIndex = (idx + 1) % keys.length;
      return keys[idx];
    }
  }

  // Fallback: wait for the key recovering first
  const soonest = keys.reduce((a, b) => a.cooldownUntil < b.cooldownUntil ? a : b);
  const waitMs = soonest.cooldownUntil - now;
  console.warn(`⚠️ [KeyManager] All keys cooling down. Soonest: "${soonest.label}" in ${Math.ceil(waitMs / 1000)}s`);
  return { ...soonest, waitMs };
};

/**
 * Universal Key Rotation Executor
 */
const withKeyRotation = async (requestFn, options = {}) => {
  const {
    models = MODELS_TO_TRY,
  } = options;

  let lastError = null;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Loop through all keys
  const keys = getKeys();
  for (const modelName of models) {
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const keyEntry = getNextAvailableKey();

      if (keyEntry.waitMs) {
        await sleep(keyEntry.waitMs + 500);
      }

      try {
        console.log(`🤖 [KeyManager] Trying key="${keyEntry.label}" (${keyEntry.provider.toUpperCase()}) model="${modelName}"`);
        
        let genAI;
        if (keyEntry.provider === 'gemini') {
          genAI = new GoogleGenerativeAI(keyEntry.key);
        } else {
          genAI = new GeminiOpenAIAdapter(keyEntry.key, keyEntry.provider);
        }

        const result = await requestFn(genAI, modelName);
        console.log(`✅ [KeyManager] Success with key="${keyEntry.label}" (${keyEntry.provider.toUpperCase()})`);
        return result;

      } catch (err) {
        lastError = err;
        const msg = err.message || '';
        console.error(`❌ [KeyManager] Error with key="${keyEntry.label}" (${keyEntry.provider.toUpperCase()}): ${msg}`);

        // Error detection
        const isRateLimit = msg.includes('429') || msg.includes('limit') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
        const isOverload = msg.includes('503') || msg.includes('overloaded') || msg.includes('Unavailable');
        const isAuthError = msg.includes('401') || msg.includes('key') || msg.includes('unauthorized') || msg.includes('Unauthorized');

        if (isAuthError) {
          // Invalid API Key - Put on a 1-day cooldown so we do not retry it
          markKeyCoolingDown(keyEntry.label, 24 * 3600 * 1000);
          continue;
        }

        if (isRateLimit) {
          // Rate-limited - cooldown 1 minute
          markKeyCoolingDown(keyEntry.label, 60000);
          continue;
        }

        if (isOverload) {
          // Temporary server overload - cooldown 15s
          markKeyCoolingDown(keyEntry.label, 15000);
          continue;
        }

        // Generic error on this key - cooldown 10s
        markKeyCoolingDown(keyEntry.label, 10000);
        if (attempt < keys.length - 1) continue;
      }
    }
  }

  throw new Error(`All configured AI API keys and models exhausted. Last error: ${lastError?.message || 'Unknown'}`);
};

module.exports = { withKeyRotation, MODELS_TO_TRY, getKeys, markKeyCoolingDown };
