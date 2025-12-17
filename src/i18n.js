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
    langEu: 'Euskara',
    
    // Options page
    optionsTitle: '⚙️ Opciones de Laguntzaile',
    sectionApi: 'Configuración de API',
    labelApiKey: 'OpenAI API Key',
    placeholderApiKey: 'sk-...',
    helpApiKey: 'Necesitas una API Key de OpenAI para usar esta extensión.',
    linkGetApiKey: 'Obtener API Key',
    btnSave: 'Guardar',
    btnDelete: 'Eliminar API Key',
    msgSaved: '✓ Guardado correctamente',
    msgDeleted: '✓ API Key eliminada',
    msgErrorSave: 'Error al guardar',
    
    sectionModels: 'Modelos de IA',
    labelVisionModel: 'Modelo de Análisis (Visión + Texto)',
    helpVisionModel: 'Modelo usado para analizar la imagen y generar el texto.',
    labelReasoning: 'Nivel de Razonamiento',
    helpReasoning: 'Solo para modelos razonadores. Mayor nivel = más tiempo pero mejor análisis.',
    btnSaveModels: 'Guardar Modelos',
    msgModelsSaved: '✓ Modelos guardados',
    
    sectionInfo: 'Información',
    infoPrivacyTitle: '🔒 Privacidad',
    infoPrivacy1: 'Tu API Key se guarda localmente en tu navegador y nunca se envía a ningún servidor excepto OpenAI.',
    infoPrivacy2: 'Cuando usas "Leer" o "Explicar", se envía una captura de la pestaña visible a la API de OpenAI para su análisis.',
    infoVoiceTitle: '🔊 Voz generada por IA',
    infoVoice: 'El audio de lectura es generado mediante OpenAI TTS (Text-to-Speech). La voz no es humana, es sintética generada por inteligencia artificial.',
    infoHowToTitle: '💡 Cómo usar',
    infoHowTo1: 'Navega a una página con un ejercicio o contenido educativo',
    infoHowTo2: 'Haz clic en el icono de Laguntzaile',
    infoHowTo3Read: 'Leer:',
    infoHowTo3ReadDesc: 'Lee en voz alta el texto seleccionado o el enunciado principal',
    infoHowTo4Explain: 'Explicar:',
    infoHowTo4ExplainDesc: 'Genera una explicación sencilla y la lee en voz alta',
    
    // Consent
    consentTitle: 'Consentimiento requerido',
    consentText: 'Al usar Leer o Explicar, se enviará una captura de la pestaña visible a OpenAI para generar texto y audio. La captura puede contener datos personales visibles en pantalla.',
    consentPrivacyLink: 'Ver política de privacidad',
    consentAccept: 'Aceptar y continuar',
    consentCancel: 'Cancelar',
    disclosureText: '📸 Captura enviada a OpenAI',
    disclosureLink: 'Privacidad',
    revokeConsent: 'Revocar consentimiento',
    privacyPolicy: 'Política de privacidad'
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
    langEu: 'Euskara',
    
    // Options page
    optionsTitle: '⚙️ Laguntzaile Options',
    sectionApi: 'API Configuration',
    labelApiKey: 'OpenAI API Key',
    placeholderApiKey: 'sk-...',
    helpApiKey: 'You need an OpenAI API Key to use this extension.',
    linkGetApiKey: 'Get API Key',
    btnSave: 'Save',
    btnDelete: 'Delete API Key',
    msgSaved: '✓ Saved successfully',
    msgDeleted: '✓ API Key deleted',
    msgErrorSave: 'Error saving',
    
    sectionModels: 'AI Models',
    labelVisionModel: 'Analysis Model (Vision + Text)',
    helpVisionModel: 'Model used to analyze the image and generate text.',
    labelReasoning: 'Reasoning Level',
    helpReasoning: 'Only for reasoning models. Higher level = more time but better analysis.',
    btnSaveModels: 'Save Models',
    msgModelsSaved: '✓ Models saved',
    
    sectionInfo: 'Information',
    infoPrivacyTitle: '🔒 Privacy',
    infoPrivacy1: 'Your API Key is stored locally in your browser and is never sent to any server except OpenAI.',
    infoPrivacy2: 'When you use "Read" or "Explain", a screenshot of the visible tab is sent to the OpenAI API for analysis.',
    infoVoiceTitle: '🔊 AI Generated Voice',
    infoVoice: 'The reading audio is generated using OpenAI TTS (Text-to-Speech). The voice is not human, it is synthetic generated by artificial intelligence.',
    infoHowToTitle: '💡 How to use',
    infoHowTo1: 'Navigate to a page with an exercise or educational content',
    infoHowTo2: 'Click on the Laguntzaile icon',
    infoHowTo3Read: 'Read:',
    infoHowTo3ReadDesc: 'Reads aloud the selected text or main statement',
    infoHowTo4Explain: 'Explain:',
    infoHowTo4ExplainDesc: 'Generates a simple explanation and reads it aloud',
    
    // Consent
    consentTitle: 'Consent required',
    consentText: 'When using Read or Explain, a screenshot of the visible tab will be sent to OpenAI to generate text and audio. The screenshot may contain personal data visible on screen.',
    consentPrivacyLink: 'View privacy policy',
    consentAccept: 'Accept and continue',
    consentCancel: 'Cancel',
    disclosureText: '📸 Screenshot sent to OpenAI',
    disclosureLink: 'Privacy',
    revokeConsent: 'Revoke consent',
    privacyPolicy: 'Privacy policy'
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
    langEu: 'Euskara',
    
    // Options page
    optionsTitle: '⚙️ Laguntzaile Aukerak',
    sectionApi: 'API Konfigurazioa',
    labelApiKey: 'OpenAI API Gakoa',
    placeholderApiKey: 'sk-...',
    helpApiKey: 'OpenAI API Gako bat behar duzu luzapen hau erabiltzeko.',
    linkGetApiKey: 'API Gakoa lortu',
    btnSave: 'Gorde',
    btnDelete: 'API Gakoa ezabatu',
    msgSaved: '✓ Ondo gordeta',
    msgDeleted: '✓ API Gakoa ezabatuta',
    msgErrorSave: 'Errorea gordetzean',
    
    sectionModels: 'IA Modeloak',
    labelVisionModel: 'Analisi Modeloa (Ikusmena + Testua)',
    helpVisionModel: 'Irudia aztertu eta testua sortzeko erabiltzen den modeloa.',
    labelReasoning: 'Arrazonamendu Maila',
    helpReasoning: 'Arrazonamendu modeloentzat bakarrik. Maila altuagoa = denbora gehiago baina analisi hobea.',
    btnSaveModels: 'Modeloak gorde',
    msgModelsSaved: '✓ Modeloak gordeta',
    
    sectionInfo: 'Informazioa',
    infoPrivacyTitle: '🔒 Pribatutasuna',
    infoPrivacy1: 'Zure API Gakoa lokalean gordetzen da zure nabigatzailean eta ez da inongo zerbitzarira bidaltzen OpenAI-z aparte.',
    infoPrivacy2: '"Irakurri" edo "Azaldu" erabiltzen duzunean, ikusgai dagoen fitxaren pantaila-argazkia OpenAI APIra bidaltzen da aztertzeko.',
    infoVoiceTitle: '🔊 IAk sortutako ahotsa',
    infoVoice: 'Irakurketa audioa OpenAI TTS (Text-to-Speech) bidez sortzen da. Ahotsa ez da gizakiarena, adimen artifizialak sortutako sintetikoa da.',
    infoHowToTitle: '💡 Nola erabili',
    infoHowTo1: 'Nabigatu ariketa edo hezkuntza edukia duen orrialde batera',
    infoHowTo2: 'Egin klik Laguntzaile ikonoan',
    infoHowTo3Read: 'Irakurri:',
    infoHowTo3ReadDesc: 'Hautatutako testua edo enuntziatu nagusia ozen irakurtzen du',
    infoHowTo4Explain: 'Azaldu:',
    infoHowTo4ExplainDesc: 'Azalpen sinple bat sortzen du eta ozen irakurtzen du',
    
    // Consent
    consentTitle: 'Baimena behar da',
    consentText: 'Irakurri edo Azaldu erabiltzean, ikusgai dagoen fitxaren pantaila-argazkia OpenAI-ra bidaliko da testua eta audioa sortzeko. Pantaila-argazkiak datu pertsonalak izan ditzake.',
    consentPrivacyLink: 'Ikusi pribatutasun politika',
    consentAccept: 'Onartu eta jarraitu',
    consentCancel: 'Utzi',
    disclosureText: '📸 Argazkia OpenAI-ra bidalia',
    disclosureLink: 'Pribatutasuna',
    revokeConsent: 'Baimena kendu',
    privacyPolicy: 'Pribatutasun politika'
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
