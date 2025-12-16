/**
 * Offscreen document management for Laguntzaile extension
 * Handles creation and communication with offscreen document for audio playback
 */

const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';
let creatingOffscreen = null;

/**
 * Ensure the offscreen document exists
 * @returns {Promise<void>}
 */
export async function ensureOffscreen() {
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
  });

  if (existingContexts.length > 0) {
    console.log('[Laguntzaile] Offscreen document already exists');
    return;
  }

  // Avoid creating multiple offscreen documents simultaneously
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }

  console.log('[Laguntzaile] Creating offscreen document...');
  creatingOffscreen = chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Reproducir audio TTS generado por OpenAI'
  });

  await creatingOffscreen;
  creatingOffscreen = null;
  console.log('[Laguntzaile] Offscreen document created');
}

/**
 * Send audio data to offscreen document for playback
 * @param {ArrayBuffer} audioData - MP3 audio data
 * @returns {Promise<void>}
 */
export async function playAudioInOffscreen(audioData) {
  await ensureOffscreen();
  
  // Convert ArrayBuffer to base64 for messaging
  const base64Audio = arrayBufferToBase64(audioData);
  
  console.log('[Laguntzaile] Sending audio to offscreen document...');
  await chrome.runtime.sendMessage({
    target: 'offscreen',
    type: 'PLAY_AUDIO',
    data: base64Audio
  });
}

/**
 * Stop any currently playing audio
 * @returns {Promise<void>}
 */
export async function stopAudio() {
  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
    });

    if (existingContexts.length > 0) {
      await chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'STOP_AUDIO'
      });
    }
  } catch (error) {
    console.warn('[Laguntzaile] Error stopping audio:', error);
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
