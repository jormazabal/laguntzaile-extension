/**
 * Storage utilities for Laguntzaile extension
 * Handles API key and model settings storage using chrome.storage.local
 */

const STORAGE_KEY = 'laguntzaile_apikey';
const MODELS_KEY = 'laguntzaile_models';

/**
 * Default model settings
 */
const DEFAULT_MODELS = {
  vision: 'gpt-4o-mini',
  tts: 'gpt-4o-mini-tts',
  ttsVoice: 'coral',
  reasoningEffort: 'medium'  // low, medium, high (for reasoning models)
};

/**
 * Available models configuration
 */
export const AVAILABLE_MODELS = {
  vision: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', supportsReasoning: false },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', supportsReasoning: false },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', supportsReasoning: true }
  ],
  tts: [
    { id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS' },
    { id: 'tts-1', name: 'TTS-1' },
    { id: 'tts-1-hd', name: 'TTS-1 HD' }
  ],
  reasoningEffort: [
    { id: 'low', name: 'Bajo' },
    { id: 'medium', name: 'Medio' },
    { id: 'high', name: 'Alto' }
  ]
};

/**
 * Get the stored OpenAI API key
 * @returns {Promise<string|null>} The API key or null if not set
 */
export async function getApiKey() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    console.error('[Laguntzaile] Error getting API key:', error);
    return null;
  }
}

/**
 * Save the OpenAI API key
 * @param {string} apiKey - The API key to store
 * @returns {Promise<boolean>} True if saved successfully
 */
export async function setApiKey(apiKey) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: apiKey });
    console.log('[Laguntzaile] API key saved successfully');
    return true;
  } catch (error) {
    console.error('[Laguntzaile] Error saving API key:', error);
    return false;
  }
}

/**
 * Remove the stored API key
 * @returns {Promise<boolean>} True if removed successfully
 */
export async function removeApiKey() {
  try {
    await chrome.storage.local.remove(STORAGE_KEY);
    console.log('[Laguntzaile] API key removed');
    return true;
  } catch (error) {
    console.error('[Laguntzaile] Error removing API key:', error);
    return false;
  }
}

/**
 * Check if API key is configured
 * @returns {Promise<boolean>} True if API key exists
 */
export async function hasApiKey() {
  const key = await getApiKey();
  return key !== null && key.trim().length > 0;
}

/**
 * Get model settings
 * @returns {Promise<object>} Model settings with defaults applied
 */
export async function getModelSettings() {
  try {
    const result = await chrome.storage.local.get(MODELS_KEY);
    return { ...DEFAULT_MODELS, ...result[MODELS_KEY] };
  } catch (error) {
    console.error('[Laguntzaile] Error getting model settings:', error);
    return DEFAULT_MODELS;
  }
}

/**
 * Save model settings
 * @param {object} settings - Model settings to save
 * @returns {Promise<boolean>} True if saved successfully
 */
export async function setModelSettings(settings) {
  try {
    const current = await getModelSettings();
    const updated = { ...current, ...settings };
    await chrome.storage.local.set({ [MODELS_KEY]: updated });
    console.log('[Laguntzaile] Model settings saved:', updated);
    return true;
  } catch (error) {
    console.error('[Laguntzaile] Error saving model settings:', error);
    return false;
  }
}

/**
 * Check if a vision model supports reasoning
 * @param {string} modelId - Model ID to check
 * @returns {boolean} True if model supports reasoning
 */
export function modelSupportsReasoning(modelId) {
  const model = AVAILABLE_MODELS.vision.find(m => m.id === modelId);
  return model?.supportsReasoning || false;
}
