# Grok Disinformation Checker v1.2.0 — Five Improvements That Make It Better Every Day

*Smarter history, background analysis, clickable sources, auto-check, and a badge that actually means something.*

---

Version 1.1.0 put a working AI fact-checker in your browser toolbar. Version 1.2.0 makes it something you can rely on as part of your daily browsing habit. The five changes in this release each come from the same observation: the tool was already doing good analysis, but the small friction points around that analysis — waiting, tracking down sources, remembering what you checked yesterday — were getting in the way.

Here's what's new.

---

## 1. Analysis No Longer Stops When You Switch Tabs

This was the most-reported frustration with v1.1.0. You'd click **Check Full Page**, a loading spinner would appear, and then — because the analysis takes a few seconds with Live Search enabled — you'd naturally switch to another tab while waiting. When you came back, the popup would be blank. The analysis had been cancelled the moment the popup lost focus.

The reason was architectural: in v1.1.0, the API call to Grok lived inside the popup window itself. Popups are closed by the browser the instant you click away.

In v1.2.0, the analysis runs inside the extension's **background service worker** — a separate process that Chrome keeps alive regardless of what you're doing in the browser. The popup now hands off the work as soon as it extracts the page content, then gets out of the way.

**What this means in practice:**

1. Click **Check Full Page** — a loading state appears and the analysis starts
2. Switch to another tab, open a new window, do whatever you need to do
3. Come back to the extension — the result is waiting for you

If you reopen the popup before the analysis finishes, it picks up where it left off and shows the loading state. No duplicate requests, no lost results. The analysis runs once and the result is cached for that tab until you navigate away.

---

## 2. History Now Links Back to the Original Article

The History tab has always stored your last 20 analyses locally. What it couldn't do was take you back to the source. If you flagged an article three days ago and wanted to re-read it — or share it with someone — you'd have to remember where it came from.

Each history entry now shows a **🔗 link icon** next to the domain name. Click it and the original URL opens in a new tab. The icon is separate from the row click (which still loads the analysis), so you can open the article or review the results independently.

**Re-analyze from history is also smarter.** In v1.1.0, the Re-analyze button would run a new check on whatever tab was currently active — which might have nothing to do with the article you were looking at in history. Now it checks the URL of the historical result against your current tab. If they're different, clicking Re-analyze:

1. Opens the saved URL in a new tab
2. Queues a fresh analysis automatically
3. The popup opens on that tab ready to run

If you're already on the same page, Re-analyze runs immediately as before. No extra steps either way.

---

## 3. Issue Sources Are Now Clickable Links

Every issue card has always shown a source field — a reference Grok cited when flagging a specific claim. In v1.1.0 that was plain text: useful to read, but not actionable. You'd have to copy the URL, open a new tab, paste it in.

In v1.2.0, **source URLs are rendered as clickable links** that open in a new tab. The prompt to Grok was also updated to specifically request `https://` URLs for each issue rather than just citation-style text, so you're more likely to get something you can click directly to read the accurate version of the story.

When a claim is flagged, you now have a one-click path to the more accurate source. This matters most for HIGH and CRITICAL risk results, where the whole point is to help you find the truth — not just to tell you the article has problems.

If Grok couldn't find a specific URL for an issue (which happens with older or obscure topics), the source still renders as plain text. The extension only creates a link when the response starts with `https://`.

---

## 4. Auto-check Pages — Optional, Off by Default

A new setting in the Settings page called **Auto-check Pages** does exactly what it sounds like: every page you navigate to is automatically analyzed for disinformation in the background, without you having to click anything.

This runs through the same background service worker added in this release, so it doesn't slow down your browsing or block page loads. When you open the extension popup on a page that was auto-checked, the results are already there.

**Why it's off by default:** Auto-check will make one API call to Grok for every page you visit. If you browse heavily, that adds up quickly on your xAI API quota. Enable it deliberately for sessions where you're reading news or researching a topic, and turn it off when you're just using the web normally. The toggle is in Settings → **Auto-check Pages**.

When auto-check is running, the loading state in the popup includes a note indicating the check was triggered automatically, so you're never confused about why an analysis is already in progress when you open the popup.

---

## 5. The Toolbar Badge Is Now Honest

The trust score badge on the extension icon has been there since v1.1.0 — a small number on the icon showing the score from the last analysis you ran. The problem: it was *global*. Check an article in Tab A, get a score of 87. Switch to Tab B to look at something completely unchecked. The badge still shows 87 — from an article that has nothing to do with Tab B. That's misleading.

In v1.2.0, the badge works differently:

- **It only appears when Auto-check is enabled** and the current page has been analyzed
- **It's tab-specific** — each tab has its own badge state, independent of every other tab
- **It clears automatically** when you navigate to a new page or switch to an unanalyzed tab
- If you switch back to a tab that *was* auto-checked, the badge restores to that tab's score

This means the badge now answers a specific question: *"Has this page I'm looking at right now been analyzed, and what was the score?"* If the badge is blank, the answer is no. If it shows a number, that number belongs to the page you're currently on.

The **Show Trust-Score Badge** setting in Settings still controls whether the badge appears at all — it just now only activates alongside Auto-check.

---

## Also on the Chrome Web Store

Since the v1.1.0 launch post was written, the extension has been published to the **Chrome Web Store**. If you're installing fresh, you can add it directly from the store without needing Developer Mode:

**[Install from the Chrome Web Store →](https://chromewebstore.google.com/detail/grok-disinformation-check/fcigpopdcbiilnkdidokpmkcehemeljl)**

If you're already running v1.1.0 from the store, Chrome will update the extension automatically. If you installed it manually (unpacked), re-load the folder from `chrome://extensions` after pulling the latest code from the repository.

---

## What Hasn't Changed

Everything that worked in v1.1.0 still works exactly the same way:

- **Alt+Shift+G** triggers a full-page check from anywhere
- The right-click **Check with Grok** context menu option works on pages and selected text
- **Check Selection** analyzes just the highlighted text
- The animated trust score ring, risk level badge, summary, and recommendation are all unchanged
- **Copy Report** exports a plain-text version of the full analysis
- The dark/light/system theme setting works as before
- Your API key, settings, and history all carry over from v1.1.0 — no reconfiguration needed

---

## Getting the Update

**From the Chrome Web Store:** Updates automatically. Nothing to do.

**From GitHub (unpacked / Developer Mode):**

```bash
cd GrokDisinformationChecker
git pull origin main
```

Then go to `chrome://extensions`, find Grok Disinformation Checker, and click the reload ↺ button.

The repository is at **[github.com/rod-trent/GrokDisinformationChecker](https://github.com/rod-trent/GrokDisinformationChecker)**. Issues, feedback, and pull requests are welcome. If a specific site produces bad results or a new feature would make the tool more useful for how you work, open an issue and let's talk about it.

---

*The Grok Disinformation Checker is free and open source. It requires a Grok API key from [console.x.ai](https://console.x.ai) — a free tier is available.*
