# Laguntzaile - Store Submission Notes

## Single Purpose Statement

Laguntzaile is a browser extension that helps students with learning difficulties (dyslexia, language impairment) read and understand educational content visible on screen using AI-powered vision analysis and text-to-speech.

**Core functionality:**
- **Read:** Extracts and reads aloud the main text or selected content from the visible tab.
- **Explain:** Generates a simple explanation of the visible content and reads it aloud.

---

## Permission Justifications

### `activeTab`
**Required for:** Capturing a screenshot of the currently active tab when the user clicks the Read or Explain button.
**User gesture:** Only triggered by explicit button click in the extension popup.
**Scope:** Limited to the active tab at the moment of user interaction.

### `storage`
**Required for:** 
- Storing the user's OpenAI API key locally (never transmitted except to OpenAI).
- Storing user preferences (language selection).
- Storing user consent status for data processing.

### `offscreen`
**Required for:** Playing TTS audio in the background. Chrome extensions cannot play audio directly from service workers, so an offscreen document is needed for audio playback even when the popup closes.

### `scripting`
**Required for:** Injecting a minimal script to detect page dimensions for full-page screenshot capture. No DOM scraping or content modification is performed.

### `host_permissions: https://api.openai.com/*`
**Required for:** Making API calls to OpenAI services:
- Vision API for screenshot analysis
- TTS API for text-to-speech generation

---

## Data Collection Disclosure

### What data is collected/transmitted?

| Data Type | When Collected | Destination | Retention |
|-----------|---------------|-------------|-----------|
| Screenshot of visible tab | On user button click | OpenAI API | Not stored (store:false) |
| Generated text | After API response | Local only | Session only |
| Generated audio | After API response | Local only | Session only |
| API Key | User input | OpenAI API (auth) | Local storage only |

### Data handling statements

- ✅ **User-initiated only:** Data is only transmitted when the user explicitly clicks Read or Explain.
- ✅ **No background collection:** No data is collected without user action.
- ✅ **No persistent storage:** Screenshots, text, and audio are not stored after use.
- ✅ **No analytics/tracking:** No usage analytics, telemetry, or tracking.
- ✅ **No advertising:** No ads, no data sold to advertisers.
- ✅ **No third parties (except OpenAI):** Data only goes to OpenAI for processing.
- ✅ **Consent required:** Users must accept consent modal before first use.
- ✅ **Transparent disclosure:** Visible disclosure in popup at all times.

### Sensitive data considerations

The screenshot MAY contain personal data if visible on the webpage. Users are:
1. Informed via consent modal before first use
2. Reminded via always-visible disclosure in popup
3. Able to revoke consent at any time

---

## Privacy Policy

Privacy policy URL (after enabling GitHub Pages): 
`https://[username].github.io/laguntzaile-extension/privacy.html`

Local file: `/docs/privacy.html`

---

## Security Measures

1. **HTTPS only:** All API calls use HTTPS encryption.
2. **No remote code:** No external scripts loaded; all code bundled in extension.
3. **Minimal permissions:** Only permissions strictly necessary for functionality.
4. **Local API key storage:** Never transmitted to any server except OpenAI.
5. **store:false flag:** Instructs OpenAI not to retain submitted data.

---

## Review Preparation Checklist

- [ ] Privacy policy URL is live and accessible
- [ ] Contact email updated in privacy.html
- [ ] Extension loads without errors
- [ ] Consent modal appears on first use
- [ ] Read/Explain functions work after consent
- [ ] Revoke consent works (shows modal again)
- [ ] All 3 languages work (ES, EN, EU)
- [ ] No console errors or warnings
- [ ] No sensitive data logged to console

---

## Answers for Store Review Questions

**Q: Does your extension collect user data?**
A: Yes, but only when the user explicitly clicks a button. A screenshot of the visible tab is sent to OpenAI for analysis. No data is stored permanently.

**Q: Is data used for advertising?**
A: No. Data is only used to provide the core read/explain functionality.

**Q: Is data sold to third parties?**
A: No. Data is only sent to OpenAI for processing and is not shared with any other parties.

**Q: Where is user data stored?**
A: Only the API key and preferences are stored locally in the browser. Screenshots and generated content are not stored.

**Q: How can users delete their data?**
A: Users can delete their API key from the options page. Uninstalling the extension removes all local data.
