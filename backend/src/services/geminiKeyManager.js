const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * ─── Gemini API Key Rotation Manager ────────────────────────────────────────
 * Supports multiple API keys via env vars:
 *   GEMINI_API_KEY       → always used (primary)
 *   GEMINI_API_KEY_2     → second key
 *   GEMINI_API_KEY_3     → third key
 *   GEMINI_API_KEY_4     → fourth key
 *
 * Strategy: Round-robin rotation with automatic skip on 429/quota errors.
 * Each key tracks its own cooldown so exhausted keys are temporarily skipped.
 */

const MODELS_TO_TRY = [
  'gemini-2.5-flash',       // ✅ Confirmed working
  'gemini-2.0-flash-lite',  // Fast lite (quota may vary)
  'gemini-2.5-flash-lite',  // Newer lite fallback
  'gemini-2.5-pro',         // Last resort
];

// Collect all available API keys from environment
const collectApiKeys = () => {
  const keys = [];
  const envVars = ['GEMINI_API_KEY', 'GEMINI_API_KEY_2', 'GEMINI_API_KEY_3', 'GEMINI_API_KEY_4'];
  for (const varName of envVars) {
    const key = process.env[varName];
    if (key && key.trim() && !key.includes('your_gemini')) {
      keys.push({ key: key.trim(), label: varName, cooldownUntil: 0 });
    }
  }
  if (keys.length === 0) {
    throw new Error('No valid GEMINI_API_KEY found in environment variables.');
  }
  console.log(`🔑 [KeyManager] Loaded ${keys.length} Gemini API key(s): ${keys.map(k => k.label).join(', ')}`);
  return keys;
};

// Lazy-initialized keys array
let _keys = null;
let _currentKeyIndex = 0;

const getKeys = () => {
  if (!_keys) _keys = collectApiKeys();
  return _keys;
};

// Mark a key as rate-limited for cooldownMs milliseconds
const markKeyCoolingDown = (keyLabel, cooldownMs = 60000) => {
  const keys = getKeys();
  const entry = keys.find(k => k.label === keyLabel);
  if (entry) {
    entry.cooldownUntil = Date.now() + cooldownMs;
    console.warn(`⏳ [KeyManager] Key "${keyLabel}" cooling down for ${cooldownMs / 1000}s`);
  }
};

// Get next available key (skips cooling-down keys, round-robin)
const getNextAvailableKey = () => {
  const keys = getKeys();
  const now = Date.now();

  // Try all keys starting from current index
  for (let i = 0; i < keys.length; i++) {
    const idx = (_currentKeyIndex + i) % keys.length;
    if (keys[idx].cooldownUntil <= now) {
      _currentKeyIndex = (idx + 1) % keys.length; // advance for next call
      return keys[idx];
    }
  }

  // All keys are cooling down — find the one that recovers soonest
  const soonest = keys.reduce((a, b) => a.cooldownUntil < b.cooldownUntil ? a : b);
  const waitMs = soonest.cooldownUntil - now;
  console.warn(`⚠️ [KeyManager] All keys cooling down. Soonest: "${soonest.label}" in ${Math.ceil(waitMs / 1000)}s`);
  return { ...soonest, waitMs };
};

/**
 * Main utility: tries every key × model combination until one succeeds.
 *
 * @param {Function} requestFn  - async (genAI, modelName) => result
 * @param {Object}   options
 * @param {string[]} options.models      - model names to try (defaults to MODELS_TO_TRY)
 * @param {Object}   options.generationConfig - passed to getGenerativeModel
 * @param {number}   options.maxRetries  - retries per key-model pair (default 2)
 * @returns {Promise<any>}
 */
const withKeyRotation = async (requestFn, options = {}) => {
  const {
    models = MODELS_TO_TRY,
    maxRetries = 2,
  } = options;

  const keys = getKeys();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let lastError = null;

  for (const modelName of models) {
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const keyEntry = getNextAvailableKey();

      if (keyEntry.waitMs) {
        // All keys cooling — wait for soonest recovery before retrying
        await sleep(keyEntry.waitMs + 500);
      }

      try {
        console.log(`🤖 [KeyManager] Trying key="${keyEntry.label}" model="${modelName}"`);
        const genAI = new GoogleGenerativeAI(keyEntry.key);
        const result = await requestFn(genAI, modelName);
        console.log(`✅ [KeyManager] Success with key="${keyEntry.label}" model="${modelName}"`);
        return result;

      } catch (err) {
        lastError = err;
        const msg = err.message || '';
        const is429 = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED');
        const is503 = msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('overloaded');
        const is404 = msg.includes('404') || msg.includes('not found');

        if (is404) {
          // This model doesn't exist for this key — skip model entirely
          console.warn(`❌ [KeyManager] Model "${modelName}" not found, skipping model.`);
          break; // break inner key loop, try next model
        }

        if (is429) {
          // Extract retry delay if provided by API
          const delayMatch = msg.match(/retryDelay.*?(\d+)s/);
          const cooldown = delayMatch ? (parseInt(delayMatch[1]) + 5) * 1000 : 65000;
          markKeyCoolingDown(keyEntry.label, cooldown);
          console.warn(`⚠️ [KeyManager] key="${keyEntry.label}" rate-limited (429). Trying next key...`);
          continue; // try next key with same model
        }

        if (is503) {
          // Server overloaded — short cooldown then try next key
          markKeyCoolingDown(keyEntry.label, 15000);
          console.warn(`⚠️ [KeyManager] key="${keyEntry.label}" overloaded (503). Trying next key...`);
          continue;
        }

        // Unknown error on this key+model — log and try next key
        console.warn(`⚠️ [KeyManager] key="${keyEntry.label}" model="${modelName}" error: ${msg.slice(0, 120)}`);
        if (attempt < keys.length - 1) continue;
      }
    }
  }

  throw new Error(`All Gemini API keys and models exhausted. Last error: ${lastError?.message?.slice(0, 200) || 'Unknown'}`);
};

module.exports = { withKeyRotation, MODELS_TO_TRY, getKeys, markKeyCoolingDown };
