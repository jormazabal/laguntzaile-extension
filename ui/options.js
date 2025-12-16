/**
 * Options page script for Laguntzaile extension
 * Handles API key and model configuration
 */

const STORAGE_KEY = 'laguntzaile_apikey';
const MODELS_KEY = 'laguntzaile_models';

// Reasoning models list
const REASONING_MODELS = ['o3-mini', 'o4-mini'];

// DOM elements
const apiKeyInput = document.getElementById('api-key');
const toggleVisibility = document.getElementById('toggle-visibility');
const btnSave = document.getElementById('btn-save');
const btnClear = document.getElementById('btn-clear');
const messageEl = document.getElementById('message');

// Model DOM elements
const visionModelSelect = document.getElementById('vision-model');
const reasoningGroup = document.getElementById('reasoning-group');
const reasoningEffortSelect = document.getElementById('reasoning-effort');
const ttsModelSelect = document.getElementById('tts-model');
const btnSaveModels = document.getElementById('btn-save-models');
const modelsMessageEl = document.getElementById('models-message');

// State
let isPasswordVisible = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load existing settings
  await loadApiKey();
  await loadModelSettings();

  // API Key event listeners
  toggleVisibility.addEventListener('click', togglePasswordVisibility);
  btnSave.addEventListener('click', saveApiKey);
  btnClear.addEventListener('click', clearApiKey);
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });

  // Model event listeners
  visionModelSelect.addEventListener('change', onVisionModelChange);
  btnSaveModels.addEventListener('click', saveModelSettings);
});

/**
 * Load existing API key from storage
 */
async function loadApiKey() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const apiKey = result[STORAGE_KEY];
    
    if (apiKey) {
      apiKeyInput.value = apiKey;
      showMessage('API Key configurada', 'success');
    }
  } catch (error) {
    console.error('[Laguntzaile Options] Error loading API key:', error);
  }
}

/**
 * Save API key to storage
 */
async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showMessage('Por favor, introduce una API Key', 'error');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showMessage('La API Key debe empezar con "sk-"', 'error');
    return;
  }

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: apiKey });
    showMessage('API Key guardada correctamente', 'success');
  } catch (error) {
    console.error('[Laguntzaile Options] Error saving API key:', error);
    showMessage('Error al guardar la API Key', 'error');
  }
}

/**
 * Clear API key from storage
 */
async function clearApiKey() {
  if (!confirm('¿Estás seguro de que quieres eliminar la API Key?')) {
    return;
  }

  try {
    await chrome.storage.local.remove(STORAGE_KEY);
    apiKeyInput.value = '';
    showMessage('API Key eliminada', 'success');
  } catch (error) {
    console.error('[Laguntzaile Options] Error clearing API key:', error);
    showMessage('Error al eliminar la API Key', 'error');
  }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  isPasswordVisible = !isPasswordVisible;
  apiKeyInput.type = isPasswordVisible ? 'text' : 'password';
  toggleVisibility.textContent = isPasswordVisible ? '🙈' : '👁️';
}

/**
 * Show message to user
 * @param {string} text - Message text
 * @param {string} type - 'success' or 'error'
 * @param {HTMLElement} element - Message element to use
 */
function showMessage(text, type, element = messageEl) {
  element.textContent = text;
  element.className = `message ${type}`;
  
  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      element.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Load model settings from storage
 */
async function loadModelSettings() {
  try {
    const result = await chrome.storage.local.get(MODELS_KEY);
    const settings = result[MODELS_KEY] || {};
    
    // Set vision model
    if (settings.vision) {
      visionModelSelect.value = settings.vision;
    }
    
    // Set TTS model
    if (settings.tts) {
      ttsModelSelect.value = settings.tts;
    }
    
    // Set reasoning effort
    if (settings.reasoningEffort) {
      reasoningEffortSelect.value = settings.reasoningEffort;
    }
    
    // Show/hide reasoning options based on model
    onVisionModelChange();
  } catch (error) {
    console.error('[Laguntzaile Options] Error loading model settings:', error);
  }
}

/**
 * Save model settings to storage
 */
async function saveModelSettings() {
  const settings = {
    vision: visionModelSelect.value,
    tts: ttsModelSelect.value,
    reasoningEffort: reasoningEffortSelect.value
  };

  try {
    await chrome.storage.local.set({ [MODELS_KEY]: settings });
    showMessage('Modelos guardados correctamente', 'success', modelsMessageEl);
  } catch (error) {
    console.error('[Laguntzaile Options] Error saving model settings:', error);
    showMessage('Error al guardar los modelos', 'error', modelsMessageEl);
  }
}

/**
 * Handle vision model change - show/hide reasoning options
 */
function onVisionModelChange() {
  const selectedModel = visionModelSelect.value;
  const isReasoningModel = REASONING_MODELS.includes(selectedModel);
  reasoningGroup.style.display = isReasoningModel ? 'block' : 'none';
}
