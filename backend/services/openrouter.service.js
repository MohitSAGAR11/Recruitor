/**
 * Backwards-compat shim.
 *
 * The AI gateway moved to the multi-provider `llm.service.js` (Groq → Gemini →
 * OpenRouter/Kimi). Controllers still import { callAI, safeParseJSON } from here,
 * so we simply re-export to avoid touching every controller.
 */
export { callAI, safeParseJSON, default } from './llm.service.js';
