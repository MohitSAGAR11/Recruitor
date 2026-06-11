import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = process.env.MODEL || 'anthropic/claude-3.5-sonnet';
const API_KEY = process.env.OPENROUTER_API_KEY;

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
 * Makes a chat completion request to OpenRouter.
 * Retries once on failure with a 1s delay.
 * @param {string} systemPrompt
 * @param {string} userContent
 * @returns {Promise<object|string>} Parsed JSON object or raw string
 */
export async function callAI(systemPrompt, userContent) {
  if (!API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  const requestBody = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  };

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'RecruitAI',
    'Content-Type': 'application/json',
  };

  const attempt = async () => {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      requestBody,
      { headers }
    );
    return response.data.choices[0].message.content;
  };

  try {
    const raw = await attempt();
    const parsed = safeParseJSON(raw);
    return parsed !== null ? parsed : raw;
  } catch (firstErr) {
    console.warn('[callAI] First attempt failed, retrying in 1s...', firstErr.message);
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const raw = await attempt();
      const parsed = safeParseJSON(raw);
      return parsed !== null ? parsed : raw;
    } catch (secondErr) {
      console.error('[callAI] Both attempts failed:', secondErr.message);
      throw secondErr;
    }
  }
}

export default { callAI, safeParseJSON };
