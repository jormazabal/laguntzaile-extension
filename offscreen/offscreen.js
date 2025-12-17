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

  if (message.action === 'stitch-images') {
    stitchImages(message.data)
      .then(dataUrl => sendResponse({ success: true, dataUrl }))
      .catch(error => {
        console.error('[Laguntzaile Offscreen] Stitch error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
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

/**
 * Stitch multiple screenshots into one image
 * @param {object} data - Stitch parameters
 * @returns {Promise<string>} Data URL of stitched image
 */
async function stitchImages(data) {
  const { captures, totalHeight, width, viewportHeight } = data;
  
  console.log(`[Laguntzaile Offscreen] Stitching ${captures.length} images, total height: ${totalHeight}`);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.min(totalHeight, viewportHeight * 3); // Limit height
  const ctx = canvas.getContext('2d');
  
  // Load and draw each image
  for (let i = 0; i < captures.length; i++) {
    const capture = captures[i];
    const img = await loadImage(capture.dataUrl);
    
    // Calculate y position on canvas
    const yPos = i * viewportHeight;
    
    // For last image, only draw the visible portion
    if (i === captures.length - 1 && capture.overlap < viewportHeight) {
      const sourceY = viewportHeight - capture.overlap;
      ctx.drawImage(img, 0, sourceY, width, capture.overlap, 0, yPos, width, capture.overlap);
    } else {
      ctx.drawImage(img, 0, yPos);
    }
  }
  
  // Convert to data URL with reduced quality to manage size
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  console.log(`[Laguntzaile Offscreen] Stitched image size: ${dataUrl.length}`);
  
  return dataUrl;
}

/**
 * Load image from data URL
 * @param {string} dataUrl - Image data URL
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

console.log('[Laguntzaile Offscreen] Document loaded and ready');
