/**
 * Popup script for Laguntzaile extension
 * Handles UI interactions and communication with service worker
 * Target: 12-year-olds with TEL and dyslexia
 */

import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../src/i18n.js';

// Storage key for language preference
const LANG_STORAGE_KEY = 'laguntzaile_lang';

// DOM elements
const langSelect = document.getElementById('lang-select');
const btnRead = document.getElementById('btn-read');
const btnExplain = document.getElementById('btn-explain');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const btnConfig = document.getElementById('btn-config');
const linkOptions = document.getElementById('link-options');

// State
let isProcessing = false;
let currentLang = DEFAULT_LANGUAGE;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved language
  await loadLanguage();
  
  // Event listeners
  langSelect.addEventListener('change', handleLanguageChange);
  btnRead.addEventListener('click', () => handleAction('READ'));
  btnExplain.addEventListener('click', () => handleAction('EXPLAIN'));
  btnConfig.addEventListener('click', openOptions);
  linkOptions.addEventListener('click', (e) => {
    e.preventDefault();
    openOptions();
  });
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
    console.warn('[Laguntzaile Popup] Could not load language:', error);
  }
  
  langSelect.value = currentLang;
  applyTranslations();
}

/**
 * Handle language change
 */
async function handleLanguageChange() {
  currentLang = langSelect.value;
  
  // Save preference
  try {
    await chrome.storage.local.set({ [LANG_STORAGE_KEY]: currentLang });
  } catch (error) {
    console.warn('[Laguntzaile Popup] Could not save language:', error);
  }
  
  applyTranslations();
}

/**
 * Apply translations to UI
 */
function applyTranslations() {
  const t = translations[currentLang] || translations[DEFAULT_LANGUAGE];
  
  // Update button tooltips
  btnRead.title = t.btnRead;
  btnExplain.title = t.btnExplain;
  btnConfig.textContent = t.btnConfigure;
  
  // Update status if not processing
  if (!isProcessing) {
    statusTextEl.textContent = t.statusReady;
  }
  
  // Update document language
  document.documentElement.lang = currentLang;
}

/**
 * Get translation for current language
 */
function t(key) {
  const langData = translations[currentLang] || translations[DEFAULT_LANGUAGE];
  return langData[key] || key;
}

/**
 * Handle READ or EXPLAIN action
 * @param {string} type - 'READ' or 'EXPLAIN'
 */
async function handleAction(type) {
  if (isProcessing) return;

  isProcessing = true;
  setButtonsEnabled(false);
  hideError();

  try {
    // Step 1: Capturing
    updateStatus('loading', '📸', t('statusCapturing'));
    await delay(100);

    // Step 2: Send message to service worker with language
    updateStatus('loading', '🔍', t('statusAnalyzing'));
    
    const response = await chrome.runtime.sendMessage({ 
      type,
      language: currentLang
    });
    
    if (!response) {
      throw new Error(t('errorUnknown'));
    }

    if (!response.success) {
      if (response.needsConfig) {
        showError(t('errorNoApiKey'), true);
      } else {
        showError(response.error || t('errorUnknown'));
      }
      updateStatus('error', '❌', t('statusError'));
      return;
    }

    // Step 3: Audio playing
    updateStatus('loading', '🔊', t('statusGeneratingAudio'));
    
    // Success
    await delay(500);
    updateStatus('success', '✓', t('statusDone'));

  } catch (error) {
    console.error('[Laguntzaile Popup] Error:', error);
    showError(error.message || t('errorUnknown'));
    updateStatus('error', '❌', t('statusError'));
  } finally {
    isProcessing = false;
    setButtonsEnabled(true);
  }
}

/**
 * Update status display
 */
function updateStatus(state, icon, text) {
  statusEl.className = 'status';
  if (state === 'loading') {
    statusEl.classList.add('loading');
  } else if (state === 'error') {
    statusEl.classList.add('error');
  }
  statusTextEl.textContent = text;
}

/**
 * Show error message
 */
function showError(message, showConfigButton = false) {
  errorMessage.textContent = message;
  errorContainer.classList.remove('hidden');
  
  if (showConfigButton) {
    btnConfig.classList.remove('hidden');
  } else {
    btnConfig.classList.add('hidden');
  }
}

/**
 * Hide error
 */
function hideError() {
  errorContainer.classList.add('hidden');
  btnConfig.classList.add('hidden');
}

/**
 * Enable/disable action buttons
 */
function setButtonsEnabled(enabled) {
  btnRead.disabled = !enabled;
  btnExplain.disabled = !enabled;
}

/**
 * Open options page
 */
function openOptions() {
  chrome.runtime.openOptionsPage();
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
