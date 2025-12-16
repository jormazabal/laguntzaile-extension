/**
 * Offscreen document script for Laguntzaile extension
 * Handles audio playback for TTS
 */

let currentAudio = null;

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only handle messages targeted at offscreen document
  if (message.target !== 'offscreen') {
    return false;
  }

  console.log('[Laguntzaile Offscreen] Received message:', message.type);

  if (message.type === 'PLAY_AUDIO') {
    playAudio(message.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => {
        console.error('[Laguntzaile Offscreen] Playback error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (message.type === 'STOP_AUDIO') {
    stopAudio();
    sendResponse({ success: true });
    return false;
  }

  return false;
});

/**
 * Play audio from base64 encoded MP3 data
 * @param {string} base64Audio - Base64 encoded MP3 audio
 * @returns {Promise<void>}
 */
async function playAudio(base64Audio) {
  // Stop any currently playing audio
  stopAudio();

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create Blob and Object URL
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(blob);

  // Create and play audio
  return new Promise((resolve, reject) => {
    currentAudio = new Audio(audioUrl);
    
    currentAudio.onended = () => {
      console.log('[Laguntzaile Offscreen] Audio playback ended');
      cleanup();
      resolve();
    };

    currentAudio.onerror = (e) => {
      console.error('[Laguntzaile Offscreen] Audio error:', e);
      cleanup();
      reject(new Error('Error al reproducir el audio'));
    };

    currentAudio.play()
      .then(() => {
        console.log('[Laguntzaile Offscreen] Audio playback started');
      })
      .catch(error => {
        console.error('[Laguntzaile Offscreen] Play failed:', error);
        cleanup();
        reject(error);
      });

    function cleanup() {
      URL.revokeObjectURL(audioUrl);
    }
  });
}

/**
 * Stop any currently playing audio
 */
function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    console.log('[Laguntzaile Offscreen] Audio stopped');
  }
}

console.log('[Laguntzaile Offscreen] Document loaded and ready');
