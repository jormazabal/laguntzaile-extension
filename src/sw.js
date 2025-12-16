/**
 * Service Worker for Laguntzaile extension
 * Handles message routing, screenshot capture, and API orchestration
 */

import { getApiKey } from './storage.js';
import { analyzeScreenshot, generateTTS } from './openai.js';
import { getPromptForMode } from './vision_prompts.js';
import { playAudioInOffscreen, stopAudio } from './offscreen.js';

console.log('[Laguntzaile] Service worker initialized');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Ignore messages meant for offscreen document
  if (message.target === 'offscreen') {
    return false;
  }

  console.log('[Laguntzaile] Received message:', message.type);

  if (message.type === 'READ' || message.type === 'EXPLAIN') {
    handleAnalyzeRequest(message.type.toLowerCase())
      .then(sendResponse)
      .catch(error => {
        console.error('[Laguntzaile] Error handling request:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Error desconocido' 
        });
      });
    return true; // Will respond asynchronously
  }

  if (message.type === 'STOP_AUDIO') {
    stopAudio()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  return false;
});

/**
 * Handle READ or EXPLAIN request
 * @param {string} mode - 'read' or 'explain'
 * @returns {Promise<object>} Result with success status and data
 */
async function handleAnalyzeRequest(mode) {
  console.log(`[Laguntzaile] Starting ${mode} request...`);

  // Step 1: Check API key
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log('[Laguntzaile] No API key configured');
    return {
      success: false,
      error: 'API Key no configurada',
      needsConfig: true
    };
  }

  // Step 2: Capture screenshot
  console.log('[Laguntzaile] Capturing screenshot...');
  let screenshotDataUrl;
  try {
    screenshotDataUrl = await captureVisibleTab();
    console.log('[Laguntzaile] Screenshot captured, size:', screenshotDataUrl.length);
  } catch (error) {
    console.error('[Laguntzaile] Screenshot capture failed:', error);
    return {
      success: false,
      error: 'No se pudo capturar la pantalla. Asegúrate de estar en una pestaña válida.'
    };
  }

  // Step 3: Analyze with vision
  console.log('[Laguntzaile] Analyzing with vision...');
  const prompt = getPromptForMode(mode);
  let analysisResult;
  try {
    analysisResult = await analyzeScreenshot(apiKey, prompt, screenshotDataUrl);
    console.log('[Laguntzaile] Analysis result:', analysisResult);
  } catch (error) {
    console.error('[Laguntzaile] Vision analysis failed:', error);
    return {
      success: false,
      error: error.message || 'Error al analizar la imagen'
    };
  }

  // Step 4: Determine text for TTS
  let textForTTS;
  let displayText;
  
  if (mode === 'read') {
    textForTTS = analysisResult.text_to_read || '';
    displayText = textForTTS;
  } else {
    // explain mode
    textForTTS = analysisResult.short_read_aloud || analysisResult.explanation || '';
    displayText = analysisResult.explanation || textForTTS;
  }

  if (!textForTTS) {
    return {
      success: false,
      error: 'No se encontró texto para procesar'
    };
  }

  // Step 5: Generate TTS
  console.log('[Laguntzaile] Generating TTS for text length:', textForTTS.length);
  let audioData;
  try {
    audioData = await generateTTS(apiKey, textForTTS);
    console.log('[Laguntzaile] TTS audio generated, size:', audioData.byteLength);
  } catch (error) {
    console.error('[Laguntzaile] TTS generation failed:', error);
    return {
      success: false,
      error: error.message || 'Error al generar audio'
    };
  }

  // Step 6: Play audio via offscreen document
  console.log('[Laguntzaile] Playing audio...');
  try {
    await playAudioInOffscreen(audioData);
    console.log('[Laguntzaile] Audio playback started');
  } catch (error) {
    console.error('[Laguntzaile] Audio playback failed:', error);
    // Don't fail the whole request if audio fails
    // The text result is still valuable
  }

  // Return success with the analysis result
  return {
    success: true,
    mode: mode,
    displayText: displayText,
    analysisResult: analysisResult
  };
}

/**
 * Capture the visible tab as a data URL
 * @returns {Promise<string>} Screenshot as data URL
 */
async function captureVisibleTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!dataUrl) {
        reject(new Error('No se obtuvo captura de pantalla'));
      } else {
        resolve(dataUrl);
      }
    });
  });
}
