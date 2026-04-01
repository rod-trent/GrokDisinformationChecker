# Introducing the Grok Disinformation Checker — A Free Browser Extension That Fact-Checks the Web in Real Time

*Cross the internet with more confidence. Let AI do the heavy lifting.*

---

We've all been there. You're reading a news article, a social media post, or a forwarded link, and something just doesn't feel right. The headline is a little too dramatic. The statistics seem off. The source is a website you've never heard of. You want to verify it — but that means opening new tabs, cross-referencing multiple sources, and spending time you don't have.

What if your browser could just… tell you?

That's the idea behind the **Grok Disinformation Checker** — a free, open-source browser extension for Chrome and Microsoft Edge that uses xAI's Grok AI to analyze any web page or piece of selected text for disinformation, misinformation, and false claims. Instantly. Right inside your browser.

---

## Why Build This?

Disinformation isn't a new problem, but the scale of it is. AI-generated content, algorithmically amplified outrage, and the 24-hour news cycle have created an environment where misleading information spreads faster than corrections ever can. Traditional fact-checking organizations do excellent work, but they can't keep up with the volume — and most people don't go looking for fact-checks after they've already formed an opinion.

The only way to make fact-checking actually work is to make it effortless and immediate. Put it directly in the path of consumption. That's what this extension attempts to do.

Grok was a natural choice for the AI engine. xAI's models are built with a strong emphasis on truthfulness, and the **Live Search** capability — which lets Grok search the web in real time during analysis — means it isn't limited to what it knew at training time. It can check claims against *today's* news and data.

---

## What It Does

### A Trust Score You Can See at a Glance

Every analysis produces a **Trust Score from 0 to 100**, displayed as a color-coded animated ring directly in the popup.

![Grok Disinformation Checker analyzing a news article](images/Main.png)

The score maps to four risk levels:

| Score | Risk Level | What It Means |
|---|---|---|
| 80–100 | 🟢 LOW | Content appears accurate and well-sourced |
| 50–79 | 🟡 MEDIUM | Some unverified or potentially misleading elements |
| 30–49 | 🟠 HIGH | Significant misinformation detected |
| 0–29 | 🔴 CRITICAL | Severe disinformation — treat with extreme caution |

The ring gives you an immediate visual answer. No reading required for the headline verdict.

### Specific Issues, Not Just a Number

A score by itself isn't enough. Below the trust ring, the extension lists every specific claim it flagged — the exact statement, its verdict, and a source or reference where available. If nothing concerning was found, it tells you that too, clearly and plainly.

![Full analysis panel showing trust score, issues, and recommendation](images/fulldisinfopanel.png)

Every analysis closes with a **Recommendation** — a single, plain-English sentence telling you what to do with this information. Think of it as Grok's editorial note.

### Check a Full Page or Just the Part You're Unsure About

Two modes of analysis are built in:

- **Check Full Page** — Scans the entire readable content of the active tab. Great for articles, blog posts, and news stories.
- **Check Selection** — Highlight any sentence, paragraph, or passage, and check just that. Useful when something specific catches your eye without wanting to analyze an entire page.

The selection check is also available directly from the right-click context menu, so you don't even need to open the popup. Just highlight, right-click, and choose **Check with Grok**.

If you prefer the keyboard, **Alt+Shift+G** triggers a full-page check from anywhere, instantly.

### History Tab

Every check you run is saved locally to a History tab inside the popup. The last 20 analyses are stored — with the URL, date, type, and trust score — and clicking any entry brings the full result back up without hitting the API again. Useful for revisiting something you checked earlier or comparing results across similar sources.

### Copy Report

The **Copy Report** button exports a complete plain-text analysis to your clipboard: trust score, risk level, summary, every flagged issue with its verdict and source, and the recommendation. Ready to paste into a document, a message, or an email.

---

## The Settings Page

![Settings and configuration page](images/Settings.png)

The extension is configurable without touching any code. The Settings page (click the ⚙️ icon in the popup) lets you:

- **Store your API key securely** — saved to your browser's own `chrome.storage.sync`, never transmitted anywhere except the Grok API itself
- **Choose your model** — defaults to Grok 4 Fast Reasoning, with options for Grok 4, Grok 3, and Grok 2
- **Toggle Live Search** — enable or disable real-time web search during analysis
- **Control the toolbar badge** — show or hide the trust score number on the extension icon
- **Pick your theme** — System (follows your OS), Light, or Dark

The theme setting takes effect immediately as a live preview — no save button needed.

---

## How Live Search Makes It Better

Most AI fact-checkers are limited to their training data, which has a cutoff date. Grok's **Live Search** capability changes that. When enabled, Grok actively searches the web during analysis to find current reporting, official sources, and recent data that can corroborate or contradict the claims it's reading.

For breaking news — where misinformation is most likely to be spreading and most likely to be recent — this is the difference between a useful tool and an unreliable one.

Live Search is enabled by default and requires a grok-4 family model (the extension automatically uses one if you have an older model selected).

---

## Privacy First

The extension was designed with a straightforward privacy principle: your data belongs to you.

- Page content is sent **only** to the xAI Grok API (`api.x.ai`) — nowhere else
- Your API key is stored in your browser's own secure storage and is **never** seen by the developer
- Zero telemetry, zero analytics, zero data collection on the developer's side
- Analysis history lives locally on your device
- Uninstalling the extension removes everything

The full privacy policy is included with the extension and [available in the repository](privacy.html).

---

## Getting Started in Three Steps

**Step 1: Get a Grok API key**

Head to [console.x.ai](https://console.x.ai), sign in with your X account, and create a new API key. A free tier is available. The key will start with `xai-`.

**Step 2: Install the extension**

For now, installation is via Developer Mode (a Chrome Web Store submission is in progress):

1. Download or clone the repository:
   ```
   git clone https://github.com/rod-trent/GrokDisinformationChecker.git
   ```
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the folder

**Step 3: Add your API key**

Click the 🔍 toolbar icon → ⚙️ Settings → paste your key → Save. Hit **Test Connection** to confirm everything is working.

That's it. Browse to any article and click **Check Full Page**.

---

## It's Open Source

Every line of code is available at:

**[https://github.com/rod-trent/GrokDisinformationChecker](https://github.com/rod-trent/GrokDisinformationChecker)**

Issues, suggestions, and pull requests are welcome. If you find a site it handles particularly well or particularly poorly, please open an issue — real-world feedback is what makes a tool like this better.

---

## A Note on What This Is (and Isn't)

This extension is a tool, not a referee. AI fact-checking is genuinely useful, but it isn't infallible. Grok can be wrong. Live Search can return incomplete results. Satire can be misread as misinformation. Nuanced political commentary can trigger false positives.

The trust score is a starting point, not a final verdict. Use it to flag things worth investigating further, not to settle arguments. The goal is to make you a *more* skeptical and *better-informed* reader — not to outsource your judgment entirely to an AI.

With that caveat firmly in place: in a world drowning in misleading content, having a second opinion from a well-sourced AI at your fingertips is a meaningful improvement over having nothing at all.

---

*Download the Grok Disinformation Checker at [github.com/rod-trent/GrokDisinformationChecker](https://github.com/rod-trent/GrokDisinformationChecker). Requires a free xAI API key from [console.x.ai](https://console.x.ai).*
