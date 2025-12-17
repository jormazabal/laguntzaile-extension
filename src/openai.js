/**
 * OpenAI API integration for Laguntzaile extension
 * Handles vision analysis and TTS generation
 */

import { JSON_FIX_PROMPT } from './vision_prompts.js';
import { AVAILABLE_MODELS } from './storage.js';

// Default models (fallbacks)
const DEFAULT_VISION_MODEL = 'gpt-4o-mini';
const DEFAULT_TTS_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_TTS_VOICE = 'nova';
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Check if a model supports reasoning
 */
function isReasoningModel(modelId) {
  const model = AVAILABLE_MODELS.vision.find(m => m.id === modelId);
  return model?.supportsReasoning || false;
}

/**
 * Call OpenAI Responses API with vision
 * @param {string} apiKey - OpenAI API key
 * @param {string} prompt - System prompt for the task
 * @param {string} imageDataUrl - Base64 data URL of the screenshot
 * @param {object} modelSettings - Model configuration {vision, reasoningEffort}
 * @returns {Promise<object>} Parsed JSON response
 */
export async function analyzeScreenshot(apiKey, prompt, imageDataUrl, modelSettings = {}) {
  const visionModel = modelSettings.vision || DEFAULT_VISION_MODEL;
  const reasoningEffort = modelSettings.reasoningEffort || 'medium';
  const supportsReasoning = isReasoningModel(visionModel);
  
  console.log(`[Laguntzaile] Calling OpenAI vision API with model: ${visionModel}`);
  
  // Build request body - reasoning models need more tokens for thinking + output
  const maxTokens = supportsReasoning ? 200000 : 2000;
  
  const requestBody = {
    model: visionModel,
    store: false,
    max_output_tokens: maxTokens,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt
          },
          {
            type: 'input_image',
            image_url: imageDataUrl,
            detail: 'high'
          }
        ]
      }
    ]
  };
  
  // Add reasoning_effort for reasoning models
  if (supportsReasoning) {
    requestBody.reasoning = { effort: reasoningEffort };
    console.log(`[Laguntzaile] Using reasoning effort: ${reasoningEffort}`);
  }
  
  const response = await fetchWithTimeout('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  }, REQUEST_TIMEOUT);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Laguntzaile] Vision API error:', response.status);
    throw new OpenAIError(response.status, errorText);
  }

  const data = await response.json();
  console.log('[Laguntzaile] Vision API response received, status:', data.status || 'ok');
  
  // Extract the text content from the response
  const outputText = extractResponseText(data);
  
  // Try to parse as JSON
  let parsed = tryParseJSON(outputText);
  
  // If parsing failed, retry with fix prompt
  if (parsed === null) {
    console.log('[Laguntzaile] JSON parse failed, retrying with fix prompt...');
    parsed = await retryWithJsonFix(apiKey, prompt, imageDataUrl, outputText, modelSettings);
  }
  
  return parsed;
}

/**
 * Retry the vision call asking for valid JSON
 */
async function retryWithJsonFix(apiKey, originalPrompt, imageDataUrl, previousOutput, modelSettings = {}) {
  const visionModel = modelSettings.vision || DEFAULT_VISION_MODEL;
  
  const response = await fetchWithTimeout('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: visionModel,
      store: false,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: originalPrompt
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
              detail: 'high'
            }
          ]
        },
        {
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text: previousOutput
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON_FIX_PROMPT
            }
          ]
        }
      ]
    })
  }, REQUEST_TIMEOUT);

  if (!response.ok) {
    const errorText = await response.text();
    throw new OpenAIError(response.status, errorText);
  }

  const data = await response.json();
  const outputText = extractResponseText(data);
  const parsed = tryParseJSON(outputText);
  
  if (parsed === null) {
    throw new Error('No se pudo obtener una respuesta JSON válida del modelo después de reintentar.');
  }
  
  return parsed;
}

/**
 * Extract text from OpenAI Responses API response
 */
function extractResponseText(data) {
  // Check for incomplete response
  if (data.status === 'incomplete') {
    console.error('[Laguntzaile] Response incomplete:', data.incomplete_details);
    throw new Error('La respuesta del modelo está incompleta. Intenta con un modelo más rápido.');
  }
  
  // The Responses API returns output in a different format
  if (data.output && Array.isArray(data.output)) {
    for (const item of data.output) {
      // Standard message output
      if (item.type === 'message' && item.content) {
        for (const content of item.content) {
          if (content.type === 'output_text' && content.text) {
            return content.text;
          }
        }
      }
      // Direct text output (some models)
      if (item.type === 'text' && item.text) {
        return item.text;
      }
    }
  }
  
  // Fallback: try to find any text in the response
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  
  console.error('[Laguntzaile] Unexpected response structure');
  throw new Error('Estructura de respuesta inesperada de OpenAI');
}

/**
 * Try to parse text as JSON, handling common issues
 */
function tryParseJSON(text) {
  if (!text) return null;
  
  // Clean up the text
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  
  // Try to find JSON object in the text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('[Laguntzaile] JSON parse error:', e.message);
    return null;
  }
}

/**
 * Generate TTS audio using OpenAI
 * @param {string} apiKey - OpenAI API key
 * @param {string} text - Text to convert to speech
 * @param {string} language - Language code (es, en, eu)
 * @returns {Promise<ArrayBuffer>} MP3 audio data
 */
export async function generateTTS(apiKey, text, language = 'es') {
  const ttsModel = AVAILABLE_MODELS.tts;
  const ttsVoice = DEFAULT_TTS_VOICE;
  const instructions = AVAILABLE_MODELS.ttsInstructions[language] || AVAILABLE_MODELS.ttsInstructions.es;
  
  console.log(`[Laguntzaile] Calling OpenAI TTS API with model: ${ttsModel}, language: ${language}`);
  
  const response = await fetchWithTimeout('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: ttsModel,
      voice: ttsVoice,
      input: text,
      instructions: instructions,
      response_format: 'mp3'
    })
  }, REQUEST_TIMEOUT);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Laguntzaile] TTS API error:', response.status);
    throw new OpenAIError(response.status, errorText);
  }

  console.log('[Laguntzaile] TTS audio received');
  return await response.arrayBuffer();
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo. Por favor, inténtalo de nuevo.');
    }
    throw error;
  }
}

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIError extends Error {
  constructor(status, body) {
    let message;
    switch (status) {
      case 401:
        message = 'API Key inválida. Por favor, verifica tu configuración.';
        break;
      case 429:
        message = 'Límite de uso alcanzado. Por favor, espera un momento e inténtalo de nuevo.';
        break;
      case 500:
      case 502:
      case 503:
        message = 'Error del servidor de OpenAI. Por favor, inténtalo de nuevo más tarde.';
        break;
      default:
        message = `Error de OpenAI (${status}): ${body.substring(0, 200)}`;
    }
    super(message);
    this.name = 'OpenAIError';
    this.status = status;
  }
}
