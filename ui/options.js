/**
 * Options page script for Laguntzaile extension
 * Handles API key, model configuration, and language settings
 */

import { AVAILABLE_MODELS } from '../src/storage.js';
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../src/i18n.js';

const STORAGE_KEY = 'laguntzaile_apikey';
const MODELS_KEY = 'laguntzaile_models';
const LANG_STORAGE_KEY = 'laguntzaile_lang';

// DOM elements
const langSelect = document.getElementById('lang-select');
const apiKeyInput = document.getElementById('api-key');
const toggleVisibility = document.getElementById('toggle-visibility');
const btnSave = document.getElementById('btn-save');
const btnClear = document.getElementById('btn-clear');
const messageEl = document.getElementById('message');

// Model DOM elements
const visionModelSelect = document.getElementById('vision-model');
const reasoningGroup = document.getElementById('reasoning-group');
const reasoningEffortSelect = document.getElementById('reasoning-effort');
const btnSaveModels = document.getElementById('btn-save-models');
const modelsMessageEl = document.getElementById('models-message');

// State
let isPasswordVisible = false;
let currentLang = DEFAULT_LANGUAGE;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load language first
  await loadLanguage();
  
  // Populate model selects from configuration
  populateModelSelects();
  
  // Load existing settings
  await loadApiKey();
  await loadModelSettings();

  // Language event listener
  langSelect.addEventListener('change', handleLanguageChange);

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
 * Load saved language preference
 */
async function loadLanguage() {
  try {
    const result = await chrome.storage.local.get(LANG_STORAGE_KEY);
    const savedLang = result[LANG_STORAGE_KEY];
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
      currentLang = savedLang;
    }
  } catch (error) {
    console.warn('[Laguntzaile Options] Could not load language:', error);
  }
  
  langSelect.value = currentLang;
  applyTranslations();
}

/**
 * Handle language change
 */
async function handleLanguageChange() {
  currentLang = langSelect.value;
  
  try {
    await chrome.storage.local.set({ [LANG_STORAGE_KEY]: currentLang });
  } catch (error) {
    console.warn('[Laguntzaile Options] Could not save language:', error);
  }
  
  applyTranslations();
}

/**
 * Get translation for current language
 */
function t(key) {
  const langData = translations[currentLang] || translations[DEFAULT_LANGUAGE];
  return langData[key] || key;
}

/**
 * Apply translations to all UI elements
 */
function applyTranslations() {
  // Title
  document.getElementById('options-title').textContent = t('optionsTitle');
  
  // API section
  document.getElementById('section-api').textContent = t('sectionApi');
  document.getElementById('label-api-key').textContent = t('labelApiKey');
  document.getElementById('help-api-key').textContent = t('helpApiKey') + ' ';
  document.getElementById('link-get-api-key').textContent = t('linkGetApiKey');
  btnSave.textContent = t('btnSave');
  btnClear.textContent = t('btnDelete');
  
  // Models section
  document.getElementById('section-models').textContent = t('sectionModels');
  document.getElementById('label-vision-model').textContent = t('labelVisionModel');
  document.getElementById('help-vision-model').textContent = t('helpVisionModel');
  document.getElementById('label-reasoning').textContent = t('labelReasoning');
  document.getElementById('help-reasoning').textContent = t('helpReasoning');
  btnSaveModels.textContent = t('btnSaveModels');
  
  // Info section
  document.getElementById('section-info').textContent = t('sectionInfo');
  document.getElementById('info-privacy-title').textContent = t('infoPrivacyTitle');
  document.getElementById('info-privacy-1').textContent = t('infoPrivacy1');
  document.getElementById('info-privacy-2').textContent = t('infoPrivacy2');
  document.getElementById('info-voice-title').textContent = t('infoVoiceTitle');
  document.getElementById('info-voice').textContent = t('infoVoice');
  document.getElementById('info-howto-title').textContent = t('infoHowToTitle');
  document.getElementById('info-howto-1').textContent = t('infoHowTo1');
  document.getElementById('info-howto-2').textContent = t('infoHowTo2');
  document.getElementById('info-howto-3-read').textContent = t('infoHowTo3Read');
  document.getElementById('info-howto-3-desc').textContent = t('infoHowTo3ReadDesc');
  document.getElementById('info-howto-4-explain').textContent = t('infoHowTo4Explain');
  document.getElementById('info-howto-4-desc').textContent = t('infoHowTo4ExplainDesc');
  
  // Update document language
  document.documentElement.lang = currentLang;
}

/**
 * Populate model select elements from AVAILABLE_MODELS configuration
 */
function populateModelSelects() {
  // Vision models
  AVAILABLE_MODELS.vision.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;
    visionModelSelect.appendChild(option);
  });

  // Reasoning effort levels
  AVAILABLE_MODELS.reasoningEffort.forEach(level => {
    const option = document.createElement('option');
    option.value = level.id;
    option.textContent = level.name;
    reasoningEffortSelect.appendChild(option);
  });
}

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
  const modelConfig = AVAILABLE_MODELS.vision.find(m => m.id === selectedModel);
  const isReasoningModel = modelConfig?.supportsReasoning || false;
  reasoningGroup.style.display = isReasoningModel ? 'block' : 'none';
}
