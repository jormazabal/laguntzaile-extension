/**
 * Options page script for Laguntzaile extension
 * Handles API key configuration
 */

const STORAGE_KEY = 'laguntzaile_apikey';

// DOM elements
const apiKeyInput = document.getElementById('api-key');
const toggleVisibility = document.getElementById('toggle-visibility');
const btnSave = document.getElementById('btn-save');
const btnClear = document.getElementById('btn-clear');
const messageEl = document.getElementById('message');

// State
let isPasswordVisible = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load existing API key
  await loadApiKey();

  // Event listeners
  toggleVisibility.addEventListener('click', togglePasswordVisibility);
  btnSave.addEventListener('click', saveApiKey);
  btnClear.addEventListener('click', clearApiKey);
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });
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
 */
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  
  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      messageEl.classList.add('hidden');
    }, 3000);
  }
}
