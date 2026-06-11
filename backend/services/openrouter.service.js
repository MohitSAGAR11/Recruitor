import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const API_KEY = process.env.OPENROUTER_API_KEY;
// Hard timeout per OpenRouter request — prevents hung requests blocking retry slots
const AI_CALL_TIMEOUT_MS = parseInt(process.env.AI_CALL_TIMEOUT_MS || '50000', 10);

/**
 * Ordered list of free models to try.
 * If the primary is rate-limited (429) or not found (404), we cascade to the next.
 * All models confirmed free (price=0) on OpenRouter as of June 2026.
 */
const MODEL_CHAIN = (process.env.MODEL
  ? [process.env.MODEL]               // honour explicit override from .env
  : []
).concat([
  'openrouter/owl-alpha',             // OpenRouter's own model — best JSON adherence
  'nex-agi/nex-n2-pro:free',          // 17B active / 397B total, strong instruction following
  'poolside/laguna-xs.2:free',        // Good at structured JSON output
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', // NVIDIA free reasoning model
]);

// De-duplicate while preserving order
const MODELS = [...new Set(MODEL_CHAIN)];

/**
 * Strips markdown JSON fences and parses JSON safely.
 * Returns parsed object on success, null on failure.
 */
export function safeParseJSON(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    // Remove ```json ... ``` or ``` ... ``` fences
    let cleaned = text
      .replace(/^```(?:json)?\s*/im, '')
      .replace(/\s*```\s*$/im, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[safeParseJSON] Failed to parse AI response:', err.message);
    console.warn('[safeParseJSON] Raw text (first 500 chars):', text?.substring(0, 500));
    return null;
  }
}

/**
 * Makes a single chat completion request to OpenRouter using the given model.
 * Throws on any HTTP error.
 */
async function callModel(model, systemPrompt, userContent, maxTokens) {
  const requestBody = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    max_tokens: maxTokens,
  };

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'RecruitAI',
    'Content-Type': 'application/json',
  };

  const response = await axios.post(
    `${OPENROUTER_BASE_URL}/chat/completions`,
    requestBody,
    { headers, timeout: AI_CALL_TIMEOUT_MS }
  );
  const choices = response.data?.choices;
  if (!choices || choices.length === 0 || !choices[0]?.message?.content) {
    throw new Error('Model returned empty choices — no content in response');
  }
  return choices[0].message.content;
}

/**
 * Makes a chat completion request to OpenRouter.
 * Cascades through MODELS list on 404/429 errors.
 * Retries the winning model once on transient failures.
 *
 * @param {string} systemPrompt
 * @param {string} userContent
 * @param {object} [options]
 * @param {number} [options.maxTokens] - Override default max_tokens (default: 1200)
 * @returns {Promise<object|string>} Parsed JSON object or raw string
 */
export async function callAI(systemPrompt, userContent, options = {}) {
  if (!API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  const maxTokens = options.maxTokens ?? 1200;
  let lastErr;

  for (const model of MODELS) {
    try {
      console.log(`[callAI] Trying model: ${model}`);
      const raw = await callModel(model, systemPrompt, userContent, maxTokens);
      const parsed = safeParseJSON(raw);
      console.log(`[callAI] Success with model: ${model}`);
      return parsed !== null ? parsed : raw;
    } catch (err) {
      const status = err.response?.status;
      lastErr = err;

      if (status === 404 || status === 429) {
        // Model unavailable or rate-limited — try next in chain
        console.warn(`[callAI] Model ${model} returned ${status}, trying next model...`);
        if (status === 429) {
          // Brief pause before hitting the next model to avoid cascade rate-limiting
          await new Promise((r) => setTimeout(r, 500));
        }
        continue;
      }

      // Non-404/429 error — retry once with same model after short delay
      console.warn(`[callAI] Model ${model} failed (${err.message}), retrying in 300ms...`);
      await new Promise((r) => setTimeout(r, 300));
      try {
        const raw = await callModel(model, systemPrompt, userContent, maxTokens);
        const parsed = safeParseJSON(raw);
        console.log(`[callAI] Retry success with model: ${model}`);
        return parsed !== null ? parsed : raw;
      } catch (retryErr) {
        console.warn(`[callAI] Retry also failed for ${model}:`, retryErr.message);
        lastErr = retryErr;
        // Continue to next model in chain
        continue;
      }
    }
  }

  console.error('[callAI] All models in chain exhausted.');
  throw lastErr;
}

export default { callAI, safeParseJSON };
