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
  • 🔴  0–29  → CRITICAL risk (severe disinformation)

🔍 Real-Time Live Search
Grok searches the web in real time to cross-reference claims against current news, data, and sources — not just its training knowledge.

⏳ Background Analysis
The API call runs in the extension's service worker, so analysis continues even if you switch tabs while waiting for results. Come back whenever you're ready.

🕐 Analysis History
Your last 20 analyses are saved locally. Each history entry shows a direct 🔗 link back to the original article, and "Re-analyze" opens that URL in a new tab and queues a fresh check automatically.

🔗 Clickable Source Links
When issues are found, each issue card includes a clickable link to a more accurate source so you can read the truth directly.

📋 Copy Report
Export a full plain-text analysis report to your clipboard with one click — great for sharing or archiving.

⌨️ Keyboard Shortcut
Press Alt+Shift+G to trigger a page analysis instantly, without opening the popup.

🖱️ Right-Click Context Menu
Right-click on any page or selected text to check for disinformation directly from the context menu.

🤖 Auto-check Pages (Optional)
Enable Auto-check in Settings to have every page you navigate to analyzed automatically in the background. Off by default — enable it intentionally as it uses API credits on every page load.

🏷️ Per-Tab Toolbar Badge
The trust-score badge on the extension icon is tab-specific. It only appears when Auto-check is enabled and the current page has been checked. It clears automatically when you switch tabs or navigate away.

⚙️ Configurable Settings
  • Choose your Grok model (Grok 4 Fast Reasoning, Grok 4, Grok 3, Grok 2)
  • Toggle Live Search on or off
  • Enable/disable auto-detection of selected text
  • Enable/disable Auto-check Pages (off by default)
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

A free or paid Grok API key from xAI (console.x.ai) is required. API usage may incur charges depending on your xAI plan. Auto-check Pages will use one API call per page visited — monitor your usage if you enable it.
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
*(Required by Chrome Web Store during review — paste into the "Permission justification" field)*

| Permission | Justification |
|---|---|
| `activeTab` | To read the text content of the current tab when the user manually initiates an analysis by clicking a button or using the keyboard shortcut. |
| `scripting` | To execute a script that extracts visible text from a tab's DOM for analysis — used both for manual checks (active tab) and for the optional Auto-check Pages feature. |
| `storage` | To securely store the user's API key, analysis settings, and local analysis history entirely within the browser. |
| `contextMenus` | To add a right-click menu option so users can check selected text or the whole page without opening the popup. |
| `tabs` | To listen for tab navigation events so the toolbar badge can be cleared when the user switches tabs or navigates to a new page, ensuring the badge always reflects the current page. Also required for the optional Auto-check Pages feature. |
| `host: <all_urls>` | Required exclusively for the optional **Auto-check Pages** feature (disabled by default). When enabled by the user, the service worker must extract text from any page the user navigates to in order to run the background analysis. Page content is sent only to `api.x.ai`. This permission is never used when Auto-check is disabled. |
| `host: api.x.ai` | To send page content to the Grok API for disinformation analysis. This is the only external host the extension communicates with. |

---

## Single-Purpose Description
*(Chrome Web Store requires a clear statement of the extension's single purpose)*
```
This extension's single purpose is to analyze web page content and selected text for disinformation and misinformation using the xAI Grok AI API, and to present the results to the user as a trust score, risk level, and list of flagged claims with source links.
```

---

## Screenshot Suggestions
*(Take 1280×800 or 640×400 screenshots of the extension in action)*

1. **Popup – Welcome state** — Show the clean dark UI with the two action buttons.
2. **Popup – Analysis result (LOW risk)** — Green trust score ring on a reputable news article.
3. **Popup – Analysis result (HIGH/CRITICAL risk)** — Red/orange ring with issue cards showing clickable source links.
4. **Popup – History tab** — Several rows of past analyses with color-coded scores and 🔗 link icons.
5. **Settings page** — Full options page showing API key field, model selector, Auto-check toggle, and other toggles.
6. **Context menu** — Browser right-click showing the "Check with Grok" menu item on selected text.
7. **Toolbar badge** — Close-up of the extension icon showing a trust score badge (requires Auto-check enabled).

---

## Promotional Tile Text  *(440×280 small tile)*
```
AI-powered disinformation detection
Fact-check any page in seconds
Powered by Grok + Live Search
```

---

## Version History  *(for store release notes)*

### v1.2.0 — April 2026
- New: Analysis runs in the background service worker — switching tabs no longer stops an in-progress check
- New: History entries now include a direct link to the original article; Re-analyze from history opens the saved URL in a new tab
- New: Issue cards show clickable source links (https://) to more accurate information
- New: Auto-check Pages setting (off by default) — automatically analyzes every page you visit
- New: Toolbar badge is now per-tab and only shown when Auto-check is enabled; clears on tab switch or navigation
- Updated: Privacy policy reflects new `tabs` and `<all_urls>` permissions and their purpose
- Updated: Permissions justification updated for store review

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
- Security: API key moved from .env file to chrome.storage.sync

### v1.0.0 — Initial Release
- Basic page analysis using Grok API
- Single-button popup interface

---

*Last updated: April 2026*
