/**
 * Popup script for Laguntzaile extension
 * Handles UI interactions and communication with service worker
 */

// DOM elements
const btnRead = document.getElementById('btn-read');
const btnExplain = document.getElementById('btn-explain');
const statusEl = document.getElementById('status');
const statusIcon = statusEl.querySelector('.status-icon');
const statusText = statusEl.querySelector('.status-text');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const btnConfig = document.getElementById('btn-config');
const linkOptions = document.getElementById('link-options');

// State
let isProcessing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  btnRead.addEventListener('click', () => handleAction('READ'));
  btnExplain.addEventListener('click', () => handleAction('EXPLAIN'));
  btnConfig.addEventListener('click', openOptions);
  linkOptions.addEventListener('click', (e) => {
    e.preventDefault();
    openOptions();
  });
});

/**
 * Handle READ or EXPLAIN action
 * @param {string} type - 'READ' or 'EXPLAIN'
 */
async function handleAction(type) {
  if (isProcessing) return;

  isProcessing = true;
  setButtonsEnabled(false);
  hideError();
  hideResult();

  try {
    // Step 1: Capturing
    updateStatus('loading', '📸', 'Capturando pantalla...');
    await delay(100); // Small delay to show status

    // Step 2: Send message to service worker
    updateStatus('loading', '🔍', 'Analizando con IA...');
    
    const response = await chrome.runtime.sendMessage({ type });
    
    if (!response) {
      throw new Error('No se recibió respuesta del servicio');
    }

    if (!response.success) {
      if (response.needsConfig) {
        showError(response.error, true);
      } else {
        showError(response.error);
      }
      updateStatus('error', '❌', 'Error');
      return;
    }

    // Step 3: Show result
    updateStatus('loading', '🔊', 'Reproduciendo audio...');
    showResult(response.displayText);
    
    // Success
    await delay(500);
    updateStatus('success', '✓', 'Completado');

  } catch (error) {
    console.error('[Laguntzaile Popup] Error:', error);
    showError(error.message || 'Error desconocido');
    updateStatus('error', '❌', 'Error');
  } finally {
    isProcessing = false;
    setButtonsEnabled(true);
  }
}

/**
 * Update status display
 * @param {string} state - 'success', 'loading', or 'error'
 * @param {string} icon - Icon to display
 * @param {string} text - Status text
 */
function updateStatus(state, icon, text) {
  statusEl.className = 'status';
  if (state === 'loading') {
    statusEl.classList.add('loading');
  } else if (state === 'error') {
    statusEl.classList.add('error');
  }
  statusIcon.textContent = icon;
  statusText.textContent = text;
}

/**
 * Show result text
 * @param {string} text - Result text to display
 */
function showResult(text) {
  resultText.textContent = text;
  resultContainer.classList.add('visible');
}

/**
 * Hide result
 */
function hideResult() {
  resultContainer.classList.remove('visible');
  resultText.textContent = '';
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {boolean} showConfigButton - Whether to show config button
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
 * @param {boolean} enabled - Whether buttons should be enabled
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
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
