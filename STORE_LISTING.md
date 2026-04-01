# Chrome Web Store & Microsoft Edge Add-ons — Store Listing

Use this file as your copy-paste source when filling out the store submission forms.

---

## Extension Name
```
Grok Disinformation Checker
```

---

## Short Description  *(≤ 132 characters)*
```
Instantly fact-check any web page or selected text for disinformation using Grok AI with real-time live search.
```

---

## Full Description  *(Chrome allows up to 16 000 characters)*

```
Grok Disinformation Checker brings AI-powered fact-checking directly into your browser. Powered by xAI's Grok models and real-time Live Search, it analyzes any web page or highlighted text for disinformation, misinformation, propaganda, and misleading claims — in seconds.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔬 One-Click Page Analysis
Click the extension icon and hit "Check Full Page" to scan an entire article, news story, or website for factual accuracy.

✂️ Selected-Text Analysis
Highlight any sentence or paragraph, right-click, and choose "Check with Grok" — or click the "Check Selection" button — to fact-check just that snippet without sending the whole page.

📊 Visual Trust Score (0–100)
Every analysis returns a color-coded trust score displayed as an animated ring:
  • 🟢 80–100 → LOW risk (accurate, well-sourced)
  • 🟡 50–79  → MEDIUM risk (some unverified elements)
  • 🟠 30–49  → HIGH risk (significant misinformation)
  • 🔴  0–29   → CRITICAL risk (severe disinformation)

🔍 Real-Time Live Search
Grok searches the web in real time to cross-reference claims against current news, data, and sources — not just its training knowledge.

🕐 Analysis History
Your last 20 analyses are saved locally. Click any history item to review previous results without re-running the API call.

📋 Copy Report
Export a full plain-text analysis report to your clipboard with one click — great for sharing or archiving.

⌨️ Keyboard Shortcut
Press Alt+Shift+G to trigger a page analysis instantly, without opening the popup.

🖱️ Right-Click Context Menu
Right-click on any page or selected text to check for disinformation directly from the context menu.

🏷️ Toolbar Badge
After each analysis, the trust score appears on the extension icon so you always have a quick visual indicator.

⚙️ Configurable Settings
  • Choose your Grok model (Grok 4 Fast Reasoning, Grok 3, Grok 2)
  • Toggle Live Search on or off
  • Enable/disable auto-detection of selected text
  • Enable/disable the toolbar badge
  • Clear history or all data with one click

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PRIVACY-FIRST DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Page content is sent ONLY to the Grok API (api.x.ai) — nowhere else.
• Your API key is stored in your browser's own secure storage, never on any external server.
• The developer receives zero telemetry, analytics, or user data.
• All history is stored locally on your device.
• Uninstalling removes all data automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 GETTING STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install the extension.
2. Click the extension icon and then the ⚙️ Settings button.
3. Enter your Grok API key from console.x.ai (free tier available).
4. Click "Test Connection" to verify — you're ready to go!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 OPEN SOURCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full source code is available at:
https://github.com/rod-trent/GrokDisinformationChecker

Issues, pull requests, and feature suggestions are welcome.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A free or paid Grok API key from xAI (console.x.ai) is required. API usage may incur charges depending on your xAI plan.
```

---

## Category
```
News & Weather
```
*(Alternative: Productivity)*

---

## Additional Categories / Tags  *(Edge Add-ons)*
```
News, Fact Check, AI, Disinformation, Misinformation, Research, Productivity
```

---

## Privacy Policy URL
```
https://github.com/rod-trent/GrokDisinformationChecker/blob/main/privacy.html
```
> **Note:** The `privacy.html` file included in the extension can also be hosted as a GitHub Pages page or a raw GitHub URL. You can use:
> `https://raw.githubusercontent.com/rod-trent/GrokDisinformationChecker/main/privacy.html`

---

## Homepage URL
```
https://github.com/rod-trent/GrokDisinformationChecker
```

---

## Support URL
```
https://github.com/rod-trent/GrokDisinformationChecker/issues
```

---

## Permissions Justification
*(Required by Chrome Web Store during review)*

| Permission      | Justification |
|----------------|---------------|
| `activeTab`     | To read the text content of the current tab when the user initiates an analysis. |
| `scripting`     | To execute a script that extracts the visible text from the active tab's DOM. |
| `storage`       | To securely store the user's API key, analysis settings, and local history. |
| `contextMenus`  | To add a right-click menu option so users can check selected text without opening the popup. |
| `host: api.x.ai`| To send page content to the Grok API for disinformation analysis. No other hosts are accessed. |

---

## Screenshot Suggestions
*(Take 1280×800 or 640×400 screenshots of the extension in action)*

1. **Popup – Welcome state** — Show the clean dark UI with the two action buttons.
2. **Popup – Analysis result (LOW risk)** — Green trust score ring on a reputable news article.
3. **Popup – Analysis result (HIGH/CRITICAL risk)** — Red/orange ring on a page with known misinformation, showing issue cards.
4. **Popup – History tab** — Several rows of past analyses with color-coded scores.
5. **Settings page** — Full options page showing API key field, model selector, and toggles.
6. **Context menu** — Browser right-click showing the "Check with Grok" menu item on selected text.
7. **Toolbar badge** — Close-up of the extension icon showing a trust score badge number.

---

## Promotional Tile Text  *(440×280 small tile)*
```
AI-powered disinformation detection
Fact-check any page in seconds
Powered by Grok + Live Search
```

---

## Version History  *(for store release notes)*

### v1.1.0 — March 2026
- New: Visual trust score ring (0–100) with risk-level badge (LOW / MEDIUM / HIGH / CRITICAL)
- New: Right-click context menu — check selected text from anywhere
- New: Keyboard shortcut (Alt+Shift+G) to check the current page
- New: Analysis history (last 20 results) stored locally
- New: Copy Report button exports a full plain-text analysis to clipboard
- New: Full Settings page — configure API key, model, live search, badge, and more
- New: Model selector — choose between Grok 4 Fast Reasoning, Grok 3, and Grok 2
- New: Toolbar badge shows trust score after each analysis
- New: Privacy Policy page included in extension package
- Improved: Structured JSON prompting for consistent, parseable AI responses
- Improved: Smarter page text extraction using semantic HTML elements
- Improved: Robust JSON parsing with fallback extraction
- Improved: API error messages now include actionable guidance
- Security: API key moved from .env file to chrome.storage.sync (no more plaintext key on disk)
- Security: Removed .env file dependency entirely

### v1.0.0 — Initial Release
- Basic page analysis using Grok API
- Single-button popup interface
```

---

*Last updated: March 2026*
