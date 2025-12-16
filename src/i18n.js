/**
 * Internationalization (i18n) for Laguntzaile extension
 * Supports: Spanish (es), English (en), Euskera (eu)
 * Target: 12-year-olds with TEL and dyslexia - simple, clear language
 */

export const SUPPORTED_LANGUAGES = ['es', 'en', 'eu'];
export const DEFAULT_LANGUAGE = 'es';

export const translations = {
  es: {
    // Header
    appName: 'Laguntzaile',
    
    // Buttons
    btnRead: 'Leer',
    btnExplain: 'Explicar',
    
    // Status messages
    statusReady: 'Listo',
    statusCapturing: 'Capturando...',
    statusAnalyzing: 'Analizando...',
    statusGeneratingAudio: 'Creando audio...',
    statusPlaying: 'Reproduciendo...',
    statusDone: 'Hecho',
    statusError: 'Error',
    
    // Errors
    errorNoApiKey: 'Falta configurar la clave',
    errorCaptureFailed: 'No pude capturar la pantalla',
    errorAnalysisFailed: 'No pude analizar la imagen',
    errorTtsFailed: 'No pude crear el audio',
    errorUnknown: 'Algo salió mal',
    
    // Links and notes
    btnConfigure: 'Configurar',
    linkOptions: 'Opciones',
    privacyNote: '⚠️ Al pulsar los botones, se envía una foto de la pantalla a OpenAI.',
    ttsNote: '🔊 La voz es creada por inteligencia artificial.',
    
    // Language selector
    language: 'Idioma',
    langEs: 'Español',
    langEn: 'English',
    langEu: 'Euskara'
  },
  
  en: {
    // Header
    appName: 'Laguntzaile',
    
    // Buttons
    btnRead: 'Read',
    btnExplain: 'Explain',
    
    // Status messages
    statusReady: 'Ready',
    statusCapturing: 'Capturing...',
    statusAnalyzing: 'Analyzing...',
    statusGeneratingAudio: 'Creating audio...',
    statusPlaying: 'Playing...',
    statusDone: 'Done',
    statusError: 'Error',
    
    // Errors
    errorNoApiKey: 'Key not configured',
    errorCaptureFailed: 'Could not capture screen',
    errorAnalysisFailed: 'Could not analyze image',
    errorTtsFailed: 'Could not create audio',
    errorUnknown: 'Something went wrong',
    
    // Links and notes
    btnConfigure: 'Configure',
    linkOptions: 'Options',
    privacyNote: '⚠️ When you press the buttons, a screenshot is sent to OpenAI.',
    ttsNote: '🔊 The voice is created by artificial intelligence.',
    
    // Language selector
    language: 'Language',
    langEs: 'Español',
    langEn: 'English',
    langEu: 'Euskara'
  },
  
  eu: {
    // Header
    appName: 'Laguntzaile',
    
    // Buttons
    btnRead: 'Irakurri',
    btnExplain: 'Azaldu',
    
    // Status messages
    statusReady: 'Prest',
    statusCapturing: 'Hartzen...',
    statusAnalyzing: 'Aztertzen...',
    statusGeneratingAudio: 'Audioa sortzen...',
    statusPlaying: 'Erreproduzitzen...',
    statusDone: 'Eginda',
    statusError: 'Errorea',
    
    // Errors
    errorNoApiKey: 'Gakoa falta da',
    errorCaptureFailed: 'Ezin izan dut pantaila hartu',
    errorAnalysisFailed: 'Ezin izan dut irudia aztertu',
    errorTtsFailed: 'Ezin izan dut audioa sortu',
    errorUnknown: 'Zerbait gaizki joan da',
    
    // Links and notes
    btnConfigure: 'Konfiguratu',
    linkOptions: 'Aukerak',
    privacyNote: '⚠️ Botoiak sakatzean, pantailaren argazkia OpenAI-ra bidaltzen da.',
    ttsNote: '🔊 Ahots hau adimen artifizialak sortua da.',
    
    // Language selector
    language: 'Hizkuntza',
    langEs: 'Español',
    langEn: 'English',
    langEu: 'Euskara'
  }
};

/**
 * Get translation for a key in the specified language
 * @param {string} lang - Language code (es, en, eu)
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
export function t(lang, key) {
  const langData = translations[lang] || translations[DEFAULT_LANGUAGE];
  return langData[key] || translations[DEFAULT_LANGUAGE][key] || key;
}

/**
 * Get all translations for a language
 * @param {string} lang - Language code
 * @returns {object} All translations for the language
 */
export function getTranslations(lang) {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}
