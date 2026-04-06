# 🔍 Grok Disinformation Checker

A browser extension for **Chrome** and **Microsoft Edge** that instantly analyzes any web page or selected text for disinformation, misinformation, and false claims — powered by [xAI's Grok AI](https://x.ai) with real-time Live Search.

![Grok Disinformation Checker](images/Main.png)

---

**NOTE:** You can also install this from the Google Chrome Web store: https://chromewebstore.google.com/detail/grok-disinformation-check/fcigpopdcbiilnkdidokpmkcehemeljl

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Full Page Analysis** | Scans the entire visible text of any web page for disinformation |
| ✂️ **Selected Text Analysis** | Highlight any text, right-click, and check just that snippet |
| 📊 **Trust Score (0–100)** | Animated ring gauge — color-coded from green (safe) to red (critical) |
| 🔍 **Live Search** | Grok searches the web in real time to cross-reference facts as it analyzes |
| 🕐 **Analysis History** | Last 20 analyses stored locally — each entry links back to the original article |
| 🔗 **Source Links** | Clickable links on each issue card take you to more accurate information |
| 📋 **Copy Report** | Export a full plain-text analysis report to your clipboard |
| ⌨️ **Keyboard Shortcut** | Press `Alt+Shift+G` to check the current page instantly |
| 🖱️ **Right-Click Menu** | Context menu on any page or selection — no need to open the popup |
| 🤖 **Auto-check Pages** | Optionally analyze every page automatically as you browse (off by default) |
| 🏷️ **Per-tab Toolbar Badge** | Trust score badge is tab-specific — only shows when Auto-check is enabled |
| 🎨 **Dark / Light / System Theme** | Follows your OS or choose your preferred appearance in Settings |
| ⚙️ **Settings Page** | Configure API key, model, live search, auto-check, badge, theme, and history |
| ⏳ **Background Analysis** | Analysis continues running even if you switch tabs while waiting for results |

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><strong>Popup — Analysis Result</strong></td>
    <td align="center"><strong>Full Disinformation Panel</strong></td>
    <td align="center"><strong>Settings Page</strong></td>
  </tr>
  <tr>
    <td><img src="images/Main.png" alt="Main popup" width="260"/></td>
    <td><img src="images/fulldisinfopanel.png" alt="Full panel" width="260"/></td>
    <td><img src="images/Settings.png" alt="Settings" width="260"/></td>
  </tr>
</table>

---

## 🚀 Getting Started

### 1 — Get a Grok API Key

1. Go to [console.x.ai](https://console.x.ai) and sign in with your X account.
2. Create a new API key. It will start with `xai-`.
3. Copy it — you'll paste it into the extension Settings.

> A free tier is available. Costs scale with usage; Live Search (web_search tool) requires a **grok-4 family model**.

---

### 2 — Install the Extension

**Chrome / Edge (Developer Mode)**

1. Download or clone this repository:
   ```bash
   git clone https://github.com/rod-trent/GrokDisinformationChecker.git
   ```
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the cloned folder.
5. The 🔍 icon will appear in your toolbar.

> **Icons:** If the toolbar icon appears blank, open `generate_icons.html` in your browser, download the four PNG files, and place them in the `icons/` subfolder.

---

### 3 — Add Your API Key

1. Click the 🔍 toolbar icon, then click **⚙️** (Settings).
2. Paste your `xai-...` API key into the **API Key** field.
3. Click **💾 Save Key**.
4. Optionally click **🧪 Test Connection** to verify it works.

---

## 🔬 How to Use

### Check a Full Page
Click the 🔍 toolbar icon → **📄 Check Full Page**.

The analysis runs in the background — you can switch tabs while waiting and the results will be ready when you return.

### Check Selected Text
Highlight any text on a page → either:
- Click **✂️ Check Selection** in the popup, or
- Right-click → **🔍 Check with Grok: "…"**

### Keyboard Shortcut
Press **`Alt+Shift+G`** anywhere to trigger a full-page check.

### Auto-check Pages
Enable **Auto-check Pages** in Settings to have every page you visit automatically analyzed in the background. The trust-score badge on the toolbar icon updates per tab and clears when you navigate away.

### Reading the Results

| Trust Score | Risk Level | Meaning |
|---|---|---|
| 80 – 100 | 🟢 **LOW** | Content appears accurate and well-sourced |
| 50 – 79 | 🟡 **MEDIUM** | Some unverified or potentially misleading elements |
| 30 – 49 | 🟠 **HIGH** | Significant misinformation detected |
| 0 – 29 | 🔴 **CRITICAL** | Severe disinformation — treat with extreme caution |

Each analysis includes:
- A **summary** of findings
- Individual **issue cards** listing specific claims and verdicts
- **Clickable source links** — click any 📎 source to read more accurate information in a new tab
- A **recommendation** for the reader

### Using History
The **🕐 History** tab shows your last 20 analyses. Each entry has:
- A **🔗 link icon** that opens the original article in a new tab
- Clicking the row loads the full analysis result
- The **🔄 Re-analyze** button on a historical result opens the original URL in a new tab and auto-queues a fresh check

---

## ⚙️ Settings

Open Settings via the **⚙️** icon in the popup or by right-clicking the extension icon → *Options*.

| Setting | Default | Description |
|---|---|---|
| API Key | — | Your xAI Grok API key |
| AI Model | Grok 4 Fast Reasoning | Model used for analysis |
| Live Search | On | Real-time web search to verify claims |
| Auto-detect Selection | On | Show "Check Selection" when text is highlighted |
| **Auto-check Pages** | **Off** | **Automatically analyze every page you visit** |
| Show Badge | On | Display trust score badge (only when Auto-check is enabled) |
| Appearance | System | Dark / Light / System (follows OS) |

> **Note:** Live Search requires a **grok-4 family model**. If you select an older model with Live Search enabled, it automatically upgrades to `grok-4-fast-reasoning` for that request.

> **Note:** Auto-check Pages will use API credits on every page load. Enable it intentionally and monitor your xAI API usage.

---

## 🗂️ Project Structure

```
GrokDisinformationChecker/
├── manifest.json          # Extension manifest (MV3)
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic — analysis, history, theming
├── background.js          # Service worker — analysis engine, auto-check, badge, tab tracking
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── privacy.html           # Privacy policy (required for store submission)
├── generate_icons.html    # In-browser tool to generate PNG icon files
├── STORE_LISTING.md       # Ready-to-paste Chrome/Edge store listing copy
├── icons/                 # Extension icons (16, 32, 48, 128px)
└── images/                # Screenshots
```

---

## 🔒 Privacy

- Page content is sent **only** to the [xAI Grok API](https://api.x.ai) — nowhere else.
- Your API key is stored in `chrome.storage.sync` inside your own browser.
- The developer receives **zero** telemetry, analytics, or user data.
- Analysis history is stored locally on your device only.
- Uninstalling the extension removes all stored data.

See the full [Privacy Policy](privacy.html) for details.

---

## 🛠️ Tech Stack

- **Manifest V3** Chrome Extension
- **xAI Grok API** — [Responses API](https://docs.x.ai/docs) (`/v1/responses`)
- **Live Search** via `web_search` Agent Tool (grok-4 family only)
- Vanilla HTML / CSS / JavaScript — no build step, no dependencies

---

## 📋 Changelog

### v1.2.0
- **Background analysis** — API call now runs in the service worker; switching tabs no longer stops an in-progress check
- **History URL links** — each history entry shows a 🔗 icon to open the original article; Re-analyze from history opens the saved URL in a new tab
- **Clickable source links** — issue cards now show clickable `https://` links to more accurate sources
- **Auto-check Pages** — new opt-in setting to automatically analyze every page you navigate to (off by default)
- **Per-tab badge** — toolbar badge is now tab-specific and only shown when Auto-check is enabled; clears on tab switch or navigation

### v1.1.0
- Full UI overhaul (dark/light/system theme, animated trust ring)
- Switched to xAI Responses API (`/v1/responses`) with Live Search support
- Added Analysis History (last 20), Copy Report, and toolbar badge
- Keyboard shortcut `Alt+Shift+G`

---

## 🤝 Contributing

Issues and pull requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Open a pull request against `main`

---

## 📄 License

[MIT License](LICENSE) — see `LICENSE` for details.

---

## 🙏 Acknowledgements

- [xAI](https://x.ai) for the Grok API and Live Search capability
- Built to help people navigate an increasingly complex information landscape

---

*For questions or issues, please [open a GitHub issue](https://github.com/rod-trent/GrokDisinformationChecker/issues).*
