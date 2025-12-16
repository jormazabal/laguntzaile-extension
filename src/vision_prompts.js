/**
 * Vision prompts for Laguntzaile extension
 * Defines the prompts for "Leer" (Read) and "Explicar" (Explain) modes
 * Target audience: 12-year-olds with TEL (Specific Language Impairment) and dyslexia
 * Supports: Spanish (es), English (en), Euskera (eu)
 */

/**
 * Language names for prompts
 */
const LANGUAGE_NAMES = {
  es: 'español',
  en: 'English',
  eu: 'euskara'
};

/**
 * Fallback messages by language
 */
const FALLBACK_MESSAGES = {
  es: {
    noTextFound: 'No se ha detectado texto educativo en la pantalla visible.',
    noContentFound: 'No se detecta un ejercicio o contenido educativo claro en la pantalla visible.',
    noContentShort: 'No se detecta contenido educativo en la pantalla.',
    incompleteInfo: 'No se ve completo el enunciado...'
  },
  en: {
    noTextFound: 'No educational text was detected on the visible screen.',
    noContentFound: 'No clear exercise or educational content detected on the visible screen.',
    noContentShort: 'No educational content detected on screen.',
    incompleteInfo: 'The full instructions are not visible...'
  },
  eu: {
    noTextFound: 'Ez da testu hezitzailerik detektatu pantailan.',
    noContentFound: 'Ez da ariketa edo eduki hezitzaile argirik detektatu pantailan.',
    noContentShort: 'Ez da eduki hezitzailerik detektatu.',
    incompleteInfo: 'Enuntziatua ez da guztiz ikusten...'
  }
};

/**
 * Generate READ prompt for the specified language
 * @param {string} lang - Language code (es, en, eu)
 * @returns {string} The READ prompt
 */
export function getReadPrompt(lang = 'es') {
  const langName = LANGUAGE_NAMES[lang] || LANGUAGE_NAMES.es;
  const fallback = FALLBACK_MESSAGES[lang] || FALLBACK_MESSAGES.es;
  
  // Base prompt in the target language for better results
  if (lang === 'en') {
    return `You are a reading assistant for students with learning difficulties (dyslexia, language impairment). Analyze this screenshot of an educational webpage.

TASK: Extract the most relevant text to read aloud.

RULES:
1. If you detect SELECTED/HIGHLIGHTED text (typically with blue background or different color), extract ONLY that text.
2. If there is NO visible selection, extract the MAIN EXERCISE or educational content.
3. COMPLETELY IGNORE: navigation menus, ads, headers, footers, sidebars, UI buttons.
4. Maximum 1200 characters. If longer, summarize keeping essential information.
5. Keep the original language of the visible text.

RESPOND ONLY with this exact JSON (no markdown, no explanations):
{
  "mode": "read",
  "language": "${lang}",
  "text_to_read": "..."
}

If no educational text is found:
{
  "mode": "read",
  "language": "${lang}",
  "text_to_read": "${fallback.noTextFound}"
}`;
  }
  
  if (lang === 'eu') {
    return `Irakurketa-laguntzailea zara ikaskuntza-zailtasunak dituzten ikasleentzat (dislexia, hizkuntza-nahasmendua). Aztertu hezkuntza-webgune baten pantaila-argazki hau.

ZEREGINA: Ozen irakurtzeko testurik garrantzitsuena atera.

ARAUAK:
1. Testu HAUTATUA/NABARMENDUA detektatzen baduzu (normalean atzeko plano urdina edo kolore desberdina), atera BAKARRIK testu hori.
2. Hautapenik EZ badago, atera ARIKETA NAGUSIA edo hezkuntza-edukia.
3. GUZTIZ ALDE BATERA UTZI: nabigazio-menuak, iragarkiak, goiburuak, oinak, alboko barrak, UI botoiak.
4. Gehienez 1200 karaktere. Luzeagoa bada, laburbildu funtsezko informazioa mantenduz.
5. Mantendu ikusgai dagoen testuaren jatorrizko hizkuntza.

ERANTZUN BAKARRIK JSON honekin (ez markdown, ez azalpenik):
{
  "mode": "read",
  "language": "${lang}",
  "text_to_read": "..."
}

Hezkuntza-testurik aurkitzen ez bada:
{
  "mode": "read",
  "language": "${lang}",
  "text_to_read": "${fallback.noTextFound}"
}`;
  }
  
  // Default: Spanish
  return `Eres un asistente de lectura para estudiantes con dificultades de aprendizaje (dislexia, TEL). Analiza esta captura de pantalla de una página web educativa.

TAREA: Extraer el texto más relevante para leer en voz alta.

REGLAS:
1. Si detectas texto SELECCIONADO/RESALTADO (típicamente con fondo azul o diferente color), extrae SOLO ese texto.
2. Si NO hay selección visible, extrae el ENUNCIADO PRINCIPAL del ejercicio o contenido educativo.
3. IGNORA completamente: menús de navegación, publicidad, cabeceras, footers, barras laterales, botones de UI.
4. Máximo 1200 caracteres. Si el texto es más largo, resume manteniendo la información esencial.
5. Mantén el idioma original del texto visible.

RESPONDE ÚNICAMENTE con este JSON exacto (sin markdown, sin explicaciones):
{
  "mode": "read",
  "language": "${lang}",
  "text_to_read": "..."
}

Si no encuentras texto educativo relevante, responde:
{
  "mode": "read",
  "language": "${lang}",
  "text_to_read": "${fallback.noTextFound}"
}`;
}

/**
 * Generate EXPLAIN prompt for the specified language
 * @param {string} lang - Language code (es, en, eu)
 * @returns {string} The EXPLAIN prompt
 */
export function getExplainPrompt(lang = 'es') {
  const langName = LANGUAGE_NAMES[lang] || LANGUAGE_NAMES.es;
  const fallback = FALLBACK_MESSAGES[lang] || FALLBACK_MESSAGES.es;
  
  if (lang === 'en') {
    return `You are a patient tutor explaining exercises to 12-year-old students with learning difficulties (dyslexia, language impairment). Analyze this screenshot of an educational webpage.

TASK: Explain the exercise or visible content in a clear and simple way IN ENGLISH.

RULES:
1. Identify the main exercise, problem, or educational content (ignore menus, ads, browser UI).
2. Generate a CLEAR and SIMPLE explanation (4-10 sentences maximum).
3. AVOID technical words. Use language a 12-year-old can easily understand.
4. If there are steps to follow, list them (maximum 3-6 short steps).
5. DO NOT invent data that is not visible. If information is missing, say: "${fallback.incompleteInfo}"
6. The read-aloud version should be shorter (max 900 characters).

RESPOND ONLY with this exact JSON (no markdown, no explanations):
{
  "mode": "explain",
  "language": "${lang}",
  "explanation": "...",
  "short_read_aloud": "..."
}

- explanation: the complete explanation (4-10 sentences) IN ENGLISH
- short_read_aloud: shorter version for TTS (max 900 characters) IN ENGLISH

If no educational content is visible:
{
  "mode": "explain",
  "language": "${lang}",
  "explanation": "${fallback.noContentFound}",
  "short_read_aloud": "${fallback.noContentShort}"
}`;
  }
  
  if (lang === 'eu') {
    return `Tutore pazientea zara, ariketak azaltzen 12 urteko ikasleei ikaskuntza-zailtasunekin (dislexia, hizkuntza-nahasmendua). Aztertu hezkuntza-webgune baten pantaila-argazki hau.

ZEREGINA: Azaldu ariketa edo ikusgai dagoen edukia modu argi eta sinplean EUSKARAZ.

ARAUAK:
1. Identifikatu ariketa, problema edo hezkuntza-eduki nagusia (ez ikusi menuak, iragarkiak, nabigatzailearen UI).
2. Sortu azalpen ARGI eta SINPLE bat (4-10 esaldi gehienez).
3. SAIHESTU hitz teknikoak. Erabili 12 urteko batek erraz uler dezakeen hizkuntza.
4. Jarraitu beharreko urratsak badaude, zerrendatu (gehienez 3-6 urrats labur).
5. EZ asmatu ikusgai ez dauden datuak. Informazioa falta bada, esan: "${fallback.incompleteInfo}"
6. Ozen irakurtzeko bertsioak laburragoa izan behar du (gehienez 900 karaktere).

ERANTZUN BAKARRIK JSON honekin (ez markdown, ez azalpenik):
{
  "mode": "explain",
  "language": "${lang}",
  "explanation": "...",
  "short_read_aloud": "..."
}

- explanation: azalpen osoa (4-10 esaldi) EUSKARAZ
- short_read_aloud: TTS-rako bertsio laburragoa (gehienez 900 karaktere) EUSKARAZ

Hezkuntza-edukirik ikusgai ez badago:
{
  "mode": "explain",
  "language": "${lang}",
  "explanation": "${fallback.noContentFound}",
  "short_read_aloud": "${fallback.noContentShort}"
}`;
  }
  
  // Default: Spanish
  return `Eres un tutor paciente que explica ejercicios a estudiantes de 12 años con dificultades de aprendizaje (dislexia, TEL). Analiza esta captura de pantalla de una página web educativa.

TAREA: Explicar el ejercicio o contenido visible de forma clara y sencilla EN ESPAÑOL.

REGLAS:
1. Identifica el ejercicio, problema o contenido principal (ignora menús, publicidad, UI del navegador).
2. Genera una explicación CLARA y SENCILLA (4-10 frases máximo).
3. EVITA tecnicismos. Usa lenguaje que un niño de 12 años pueda entender fácilmente.
4. Si hay pasos a seguir, enuméralos (máximo 3-6 pasos cortos).
5. NO inventes datos que no estén visibles. Si falta información, menciona: "${fallback.incompleteInfo}"
6. La versión para leer en voz alta debe ser más breve (máx 900 caracteres).

RESPONDE ÚNICAMENTE con este JSON exacto (sin markdown, sin explicaciones):
{
  "mode": "explain",
  "language": "${lang}",
  "explanation": "...",
  "short_read_aloud": "..."
}

- explanation: la explicación completa (4-10 frases) EN ESPAÑOL
- short_read_aloud: versión resumida para TTS (máx 900 caracteres) EN ESPAÑOL

Si no hay contenido educativo visible:
{
  "mode": "explain",
  "language": "${lang}",
  "explanation": "${fallback.noContentFound}",
  "short_read_aloud": "${fallback.noContentShort}"
}`;
}

/**
 * Prompt for retry when JSON parsing fails
 */
export const JSON_FIX_PROMPT = `Tu respuesta anterior no era JSON válido. Por favor, responde SOLO con JSON válido, sin texto adicional, sin bloques de código markdown.

La respuesta debe empezar con { y terminar con }. Sin explicaciones antes ni después.`;

/**
 * Get the appropriate prompt for the given mode and language
 * @param {string} mode - 'read' or 'explain'
 * @param {string} lang - Language code (es, en, eu)
 * @returns {string} The prompt text
 */
export function getPromptForMode(mode, lang = 'es') {
  if (mode === 'read') {
    return getReadPrompt(lang);
  } else if (mode === 'explain') {
    return getExplainPrompt(lang);
  }
  throw new Error(`Unknown mode: ${mode}`);
}
