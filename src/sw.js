/**
 * Service Worker for Laguntzaile extension
 * Handles message routing, screenshot capture, and API orchestration
 */

import { getApiKey, getModelSettings } from './storage.js';
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
    const language = message.language || 'es';
    handleAnalyzeRequest(message.type.toLowerCase(), language)
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
 * @param {string} language - Language code (es, en, eu)
 * @returns {Promise<object>} Result with success status and data
 */
async function handleAnalyzeRequest(mode, language = 'es') {
  console.log(`[Laguntzaile] Starting ${mode} request in language: ${language}`);

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

  // Step 1b: Load model settings
  const modelSettings = await getModelSettings();
  console.log('[Laguntzaile] Using models:', modelSettings.vision, modelSettings.tts);

  // Step 2: Capture full page screenshot
  console.log('[Laguntzaile] Capturing full page screenshot...');
  let screenshotDataUrl;
  try {
    screenshotDataUrl = await captureFullPage();
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
  const prompt = getPromptForMode(mode, language);
  let analysisResult;
  try {
    analysisResult = await analyzeScreenshot(apiKey, prompt, screenshotDataUrl, modelSettings);
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
    audioData = await generateTTS(apiKey, textForTTS, language);
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
 * Capture the full page as a data URL using scrolling and stitching
 * @returns {Promise<string>} Screenshot as data URL
 */
async function captureFullPage() {
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No se encontró pestaña activa');
  }

  // Check if we can inject scripts (not possible on chrome://, edge://, about: pages)
  const url = tab.url || '';
  if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
    console.log('[Laguntzaile] Restricted page, using visible capture only');
    return captureVisibleTab();
  }

  // Get page dimensions via content script
  let pageInfo;
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        devicePixelRatio: window.devicePixelRatio || 1
      })
    });
    pageInfo = result;
  } catch (error) {
    console.warn('[Laguntzaile] Cannot inject script, using visible capture:', error.message);
    return captureVisibleTab();
  }

  const { scrollHeight, viewportHeight, scrollX, scrollY, devicePixelRatio } = pageInfo;
  
  // If page fits in viewport, just capture visible
  if (scrollHeight <= viewportHeight) {
    return captureVisibleTab();
  }

  // Calculate number of captures needed - limit to max 2 to avoid rate limiting
  const captures = [];
  const maxCaptures = 2;
  const numCaptures = Math.min(Math.ceil(scrollHeight / viewportHeight), maxCaptures);
  
  console.log(`[Laguntzaile] Full page capture: ${numCaptures} screenshots (limited)`);

  // Capture each section with delay to avoid rate limiting
  for (let i = 0; i < numCaptures; i++) {
    const scrollTo = i * viewportHeight;
    
    // Scroll to position
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (y) => window.scrollTo(0, y),
      args: [scrollTo]
    });
    
    // Wait for scroll, render, and rate limit (Chrome allows ~2 captures/sec)
    await new Promise(r => setTimeout(r, 600));
    
    // Capture visible area
    const dataUrl = await captureVisibleTab();
    captures.push({
      dataUrl,
      y: scrollTo,
      isLast: i === numCaptures - 1,
      overlap: i === numCaptures - 1 ? Math.min(scrollHeight - scrollTo, viewportHeight) : viewportHeight
    });
  }

  // Restore original scroll position
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (x, y) => window.scrollTo(x, y),
    args: [scrollX, scrollY]
  });

  // Stitch images together using offscreen document
  const stitchedDataUrl = await stitchImages(captures, scrollHeight, pageInfo.viewportWidth, viewportHeight, devicePixelRatio);
  
  return stitchedDataUrl;
}

/**
 * Stitch multiple screenshots into one using offscreen canvas
 */
async function stitchImages(captures, totalHeight, width, viewportHeight, dpr) {
  // For simplicity, if only 2 captures, use offscreen; otherwise just use first capture
  // This keeps API payload reasonable for OpenAI
  if (captures.length > 3) {
    console.log('[Laguntzaile] Too many captures, using first 3 sections only');
    captures = captures.slice(0, 3);
    totalHeight = viewportHeight * 3;
  }

  // Create offscreen document for canvas operations
  await ensureOffscreenDocument();
  
  const response = await chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'stitch-images',
    data: {
      captures: captures.map(c => ({ dataUrl: c.dataUrl, y: c.y, overlap: c.overlap })),
      totalHeight,
      width: width * dpr,
      viewportHeight: viewportHeight * dpr
    }
  });

  if (!response?.success) {
    console.warn('[Laguntzaile] Stitching failed, using first capture');
    return captures[0].dataUrl;
  }

  return response.dataUrl;
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

/**
 * Ensure offscreen document exists
 */
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  
  if (existingContexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['AUDIO_PLAYBACK', 'BLOBS'],
    justification: 'Play TTS audio and stitch screenshots'
  });
}
