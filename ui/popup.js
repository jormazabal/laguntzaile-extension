/**
 * Popup script for Laguntzaile extension
 * Handles UI interactions and communication with service worker
 * Target: 12-year-olds with TEL and dyslexia
 */

import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../src/i18n.js';

// Storage keys
const LANG_STORAGE_KEY = 'laguntzaile_lang';
const CONSENT_STORAGE_KEY = 'laguntzaile_consent';

// DOM elements
const langSelect = document.getElementById('lang-select');
const btnRead = document.getElementById('btn-read');
const btnExplain = document.getElementById('btn-explain');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const btnConfig = document.getElementById('btn-config');
const linkOptions = document.getElementById('link-options');

// Consent modal elements
const consentModal = document.getElementById('consent-modal');
const consentTitle = document.getElementById('consent-title');
const consentText = document.getElementById('consent-text');
const consentPrivacyLink = document.getElementById('consent-privacy-link');
const btnConsentAccept = document.getElementById('btn-consent-accept');
const btnConsentCancel = document.getElementById('btn-consent-cancel');

// Disclosure elements
const disclosureText = document.getElementById('disclosure-text');
const disclosureLink = document.getElementById('disclosure-link');

// State
let isProcessing = false;
let currentLang = DEFAULT_LANGUAGE;
let hasConsent = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved language
  await loadLanguage();
  
  // Check consent status
  await checkConsent();
  
  // Event listeners
  langSelect.addEventListener('change', handleLanguageChange);
  btnRead.addEventListener('click', () => handleAction('READ'));
  btnExplain.addEventListener('click', () => handleAction('EXPLAIN'));
  btnConfig.addEventListener('click', openOptions);
  linkOptions.addEventListener('click', (e) => {
    e.preventDefault();
    openOptions();
  });
  
  // Consent modal listeners
  btnConsentAccept.addEventListener('click', acceptConsent);
  btnConsentCancel.addEventListener('click', cancelConsent);
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
  const tr = translations[currentLang] || translations[DEFAULT_LANGUAGE];
  
  // Update button tooltips
  btnRead.title = tr.btnRead;
  btnExplain.title = tr.btnExplain;
  btnConfig.textContent = tr.btnConfigure;
  
  // Update consent modal
  consentTitle.textContent = tr.consentTitle || 'Consentimiento requerido';
  consentText.textContent = tr.consentText || 'Al usar Leer o Explicar, se enviará una captura de la pestaña visible a OpenAI.';
  consentPrivacyLink.textContent = tr.consentPrivacyLink || 'Ver política de privacidad';
  btnConsentAccept.textContent = tr.consentAccept || 'Aceptar y continuar';
  btnConsentCancel.textContent = tr.consentCancel || 'Cancelar';
  
  // Update disclosure
  disclosureText.textContent = tr.disclosureText || '📸 Captura enviada a OpenAI';
  disclosureLink.textContent = tr.disclosureLink || 'Privacidad';
  
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
 * Check if user has given consent
 */
async function checkConsent() {
  try {
    const result = await chrome.storage.local.get(CONSENT_STORAGE_KEY);
    hasConsent = result[CONSENT_STORAGE_KEY] === true;
  } catch (error) {
    console.warn('[Laguntzaile Popup] Could not check consent:', error);
    hasConsent = false;
  }
  
  // Show consent modal if not consented
  if (!hasConsent) {
    showConsentModal();
  }
}

/**
 * Show consent modal
 */
function showConsentModal() {
  consentModal.classList.remove('hidden');
}

/**
 * Hide consent modal
 */
function hideConsentModal() {
  consentModal.classList.add('hidden');
}

/**
 * Accept consent
 */
async function acceptConsent() {
  try {
    await chrome.storage.local.set({ [CONSENT_STORAGE_KEY]: true });
    hasConsent = true;
    hideConsentModal();
  } catch (error) {
    console.error('[Laguntzaile Popup] Could not save consent:', error);
  }
}

/**
 * Cancel consent (close popup)
 */
function cancelConsent() {
  window.close();
}

/**
 * Handle READ or EXPLAIN action
 * @param {string} type - 'READ' or 'EXPLAIN'
 */
async function handleAction(type) {
  if (isProcessing) return;
  
  // Check consent before proceeding
  if (!hasConsent) {
    showConsentModal();
    return;
  }

  isProcessing = true;
  setButtonsEnabled(false);
  hideError();

  try {
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
      return;
    }

  } catch (error) {
    console.error('[Laguntzaile Popup] Error:', error);
    showError(error.message || t('errorUnknown'));
  } finally {
    isProcessing = false;
    setButtonsEnabled(true);
  }
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
