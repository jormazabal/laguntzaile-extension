/**
 * Storage utilities for Laguntzaile extension
 * Handles API key storage using chrome.storage.local
 */

const STORAGE_KEY = 'laguntzaile_apikey';

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
