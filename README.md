# Laguntzaile

**Asistente personal para leer y explicar ejercicios usando IA de visión y voz.**

Laguntzaile es una extensión de navegador (Chrome/Edge) que ayuda a estudiantes a comprender ejercicios y contenido educativo mediante:

- **Lectura en voz alta** del texto seleccionado o del enunciado principal
- **Explicaciones sencillas** generadas por IA

## 🚀 Instalación

### Requisitos previos

1. Navegador Chrome (v109+) o Microsoft Edge (Chromium)
2. Una API Key de OpenAI con acceso a:
   - Modelo de visión (`gpt-4o-mini`)
   - API de TTS (`gpt-4o-mini-tts`)

### Pasos de instalación

1. **Clonar o descargar** este repositorio:
   ```bash
   git clone https://github.com/jormazabal/laguntzaile-extension.git
   ```

2. **Generar los iconos** (solo la primera vez):
   ```powershell
   cd laguntzaile-extension
   powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
   ```

3. **Cargar la extensión en el navegador:**

   **Chrome:**
   - Ir a `chrome://extensions/`
   - Activar "Modo de desarrollador" (esquina superior derecha)
   - Clic en "Cargar descomprimida"
   - Seleccionar la carpeta `laguntzaile-extension`

   **Edge:**
   - Ir a `edge://extensions/`
   - Activar "Modo de desarrollador" (panel izquierdo)
   - Clic en "Cargar descomprimida"
   - Seleccionar la carpeta `laguntzaile-extension`

4. **Configurar la API Key:**
   - Clic en el icono de Laguntzaile en la barra de herramientas
   - Clic en "Opciones" o ir a la página de opciones de la extensión
   - Introducir tu API Key de OpenAI (empieza con `sk-...`)
   - Clic en "Guardar"

## 📖 Uso

1. Navega a una página web con un ejercicio o contenido educativo
2. (Opcional) Selecciona/resalta el texto específico que quieres leer
3. Haz clic en el icono de **Laguntzaile** en la barra de herramientas
4. Elige una acción:

   | Botón | Acción |
   |-------|--------|
   | **📖 Leer** | Lee en voz alta el texto seleccionado, o si no hay selección, el enunciado principal del ejercicio |
   | **💡 Explicar** | Genera una explicación sencilla del ejercicio y la lee en voz alta |

5. El texto aparecerá en el popup y se reproducirá automáticamente

## 🔧 Depuración (Debug)

### Ver logs del Service Worker

1. Ir a `chrome://extensions/` (o `edge://extensions/`)
2. Encontrar "Laguntzaile"
3. Clic en "Service Worker" (enlace azul)
4. Se abre DevTools con la consola del service worker
5. Los logs tienen prefijo `[Laguntzaile]`

### Inspeccionar el Popup

1. Clic derecho en el icono de Laguntzaile
2. Seleccionar "Inspeccionar ventana emergente" (o similar)
3. Se abre DevTools para el popup

### Ver peticiones de red

1. En las DevTools del Service Worker
2. Ir a la pestaña "Network"
3. Las llamadas a OpenAI aparecerán como peticiones a `api.openai.com`

### Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "API Key no configurada" | No se ha guardado la API Key | Ir a Opciones y configurar la API Key |
| "API Key inválida" | La API Key es incorrecta o ha expirado | Verificar la API Key en platform.openai.com |
| "Límite de uso alcanzado" | Cuota de OpenAI excedida | Esperar o aumentar límites en OpenAI |
| "No se pudo capturar la pantalla" | La pestaña no permite capturas | Probar en otra pestaña (algunas páginas del navegador están protegidas) |

## 🏗️ Estructura del proyecto

```
laguntzaile-extension/
├── manifest.json           # Configuración de la extensión (Manifest V3)
├── README.md               # Este archivo
├── src/
│   ├── sw.js               # Service Worker principal
│   ├── openai.js           # Integración con API de OpenAI
│   ├── vision_prompts.js   # Prompts para análisis de visión
│   ├── storage.js          # Gestión de almacenamiento (API Key)
│   └── offscreen.js        # Gestión del documento offscreen
├── ui/
│   ├── popup.html          # HTML del popup
│   ├── popup.css           # Estilos del popup
│   ├── popup.js            # Lógica del popup
│   ├── options.html        # Página de opciones
│   ├── options.css         # Estilos de opciones
│   └── options.js          # Lógica de opciones
├── offscreen/
│   ├── offscreen.html      # Documento offscreen para audio
│   └── offscreen.js        # Reproductor de audio
├── assets/
│   ├── icon16.png          # Icono 16x16
│   ├── icon32.png          # Icono 32x32
│   ├── icon48.png          # Icono 48x48
│   └── icon128.png         # Icono 128x128
└── scripts/
    └── generate-icons.ps1  # Script para generar iconos
```

## 🔒 Privacidad

- **API Key**: Se almacena localmente en tu navegador (`chrome.storage.local`). Nunca se envía a ningún servidor excepto OpenAI.
- **Capturas de pantalla**: Al usar "Leer" o "Explicar", se captura la pestaña visible y se envía a la API de OpenAI para su análisis. La captura NO se guarda localmente.
- **Sin analytics**: La extensión no recopila ningún dato de uso ni telemetría.

## 🔊 Aviso sobre TTS

El audio generado utiliza **OpenAI TTS** (Text-to-Speech). La voz es **sintética, generada por inteligencia artificial**, no es una grabación humana.

## 📝 Flujo técnico

1. Usuario hace clic en "Leer" o "Explicar"
2. `popup.js` envía mensaje al Service Worker
3. `sw.js` captura screenshot con `chrome.tabs.captureVisibleTab`
4. Se envía el screenshot a OpenAI Responses API (modelo de visión)
5. Se parsea la respuesta JSON con el texto/explicación
6. Se genera audio con OpenAI TTS API
7. Se crea/activa documento offscreen para reproducir el audio
8. El audio continúa aunque se cierre el popup

## 🛠️ Tecnologías

- **Manifest V3** (Chrome Extension)
- **OpenAI API**:
  - Visión: `gpt-4o-mini` via Responses API
  - TTS: `gpt-4o-mini-tts` via Audio Speech API
- **Chrome APIs**:
  - `chrome.tabs.captureVisibleTab` - Captura de pantalla
  - `chrome.storage.local` - Almacenamiento local
  - `chrome.offscreen` - Reproducción de audio en background

## 📄 Licencia

Este proyecto es de uso personal/educativo.

---

*Laguntzaile* significa "ayudante" en euskera (vasco).
