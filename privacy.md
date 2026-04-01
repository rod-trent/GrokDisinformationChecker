# Privacy Policy

**Grok Disinformation Checker** &nbsp;·&nbsp; Last updated: March 2026

> **Plain-English Summary:** This extension reads page content *only when you ask it to*, then sends that content to the Grok AI API for analysis. No data is collected by the extension developer. Your API key lives only in your own browser. You can delete everything at any time from the Settings page.

---

## Contents

1. [What Data We Access](#1-what-data-we-access)
2. [How Your Data Is Used](#2-how-your-data-is-used)
3. [Data Storage](#3-data-storage)
4. [Third-Party Services](#4-third-party-services)
5. [Permissions Explained](#5-permissions-explained)
6. [Data Retention](#6-data-retention)
7. [Children's Privacy](#7-childrens-privacy)
8. [Changes to This Policy](#8-changes-to-this-policy)
9. [Contact](#9-contact)

---

## 1. What Data We Access

Grok Disinformation Checker accesses the following data, strictly on demand:

- **Page text content** — the visible text of the active browser tab, extracted only when you click *Check Full Page* or use the keyboard shortcut (Alt+Shift+G).
- **Selected text** — text you have highlighted on a page, only when you click *Check Selection* or use the right-click context menu option.
- **Your Grok API key** — entered by you in Settings and stored in `chrome.storage.sync`.
- **Analysis history** — the results of previous analyses you have run, stored in `chrome.storage.local` on your device.

The extension does **not** collect passwords, form data, browsing history, cookies, geolocation, or any other personal information.

---

## 2. How Your Data Is Used

- Page or selected text is sent **directly and exclusively** to the [xAI](https://x.ai) Grok API (`https://api.x.ai`) to perform the disinformation analysis you requested.
- Your API key is used solely to authenticate those requests. It is never logged, shared, or sent anywhere other than `api.x.ai`.
- The extension developer **does not receive, store, or have access to** any of the above data.
- Data submitted to the Grok API is subject to [xAI's Privacy Policy](https://x.ai/legal/privacy-policy). Please review it before use.

---

## 3. Data Storage

- **API key & settings** are stored in `chrome.storage.sync`. Chrome and Edge may sync this data across your signed-in devices via your browser account. You can clear it at any time in the extension's Settings page.
- **Analysis history** (up to the last 20 results) is stored in `chrome.storage.local` on the current device only and is never synced.
- No data is written to disk outside of these browser storage APIs.
- Uninstalling the extension removes all locally stored data automatically.

---

## 4. Third-Party Services

This extension communicates **only** with the xAI Grok API at `https://api.x.ai`. No other external connections are made. Please review [xAI's Privacy Policy](https://x.ai/legal/privacy-policy) and [Terms of Service](https://x.ai/legal/terms-of-service) to understand how xAI handles content submitted to their API.

---

## 5. Permissions Explained

| Permission | Why It Is Needed |
|---|---|
| `activeTab` | Allows the extension to read the content of the *currently active tab*, only when you initiate an analysis. |
| `scripting` | Used to extract visible text from the active tab's DOM when you request an analysis. |
| `storage` | Used to store your API key, settings, and local history inside your browser. |
| `contextMenus` | Adds a right-click menu option so you can quickly check highlighted text without opening the popup. |

No broad host permissions are requested. The only allowed external host is `https://api.x.ai/*`.

---

## 6. Data Retention

Analysis history is kept until you manually clear it via *Settings → Clear History*, or until you uninstall the extension. API keys and settings persist until you clear them in Settings or uninstall. There is no server-side retention because no data is sent to any developer-controlled server.

---

## 7. Children's Privacy

This extension is not directed at children under the age of 13 (or the applicable age in your jurisdiction). We do not knowingly process data from children. If you believe a child has used this extension in a way that concerns you, please contact us via the link in Section 9.

---

## 8. Changes to This Policy

We may update this Privacy Policy as the extension evolves. The current version is always available within the extension and at the project's GitHub repository:
[github.com/rod-trent/GrokDisinformationChecker](https://github.com/rod-trent/GrokDisinformationChecker)

Continued use of the extension after an update constitutes acceptance of the revised policy.

---

## 9. Contact

Questions, concerns, or requests regarding this Privacy Policy? Please open an issue at:
[github.com/rod-trent/GrokDisinformationChecker/issues](https://github.com/rod-trent/GrokDisinformationChecker/issues)

---

*Grok Disinformation Checker · v1.1.0 · [GitHub](https://github.com/rod-trent/GrokDisinformationChecker)*
