// ============================================================
// background.js  –  Grok Disinformation Checker service worker
// ============================================================

// ── Tab-state helpers (session storage, keyed by tabId) ──────
async function getTabState(tabId) {
  const key = `tabState_${tabId}`;
  const res = await chrome.storage.session.get(key).catch(() => ({}));
  return res[key] || null;
}

async function setTabState(tabId, state) {
  await chrome.storage.session.set({ [`tabState_${tabId}`]: state }).catch(() => {});
}

async function clearTabState(tabId) {
  await chrome.storage.session.remove(`tabState_${tabId}`).catch(() => {});
}

// ── Badge helpers ────────────────────────────────────────────
function setBadgeForScore(score) {
  let color = '#22c55e';             // green  ≥ 70
  if (score < 30)      color = '#ef4444';   // red
  else if (score < 50) color = '#f97316';   // orange
  else if (score < 70) color = '#eab308';   // yellow
  chrome.action.setBadgeText({ text: score.toString() });
  chrome.action.setBadgeBackgroundColor({ color });
}

function clearBadge() {
  chrome.action.setBadgeText({ text: '' });
}

// ── History helper ───────────────────────────────────────────
async function saveToHistory(analysis) {
  const { history = [] } = await chrome.storage.local.get('history').catch(() => ({ history: [] }));
  history.unshift(analysis);
  await chrome.storage.local.set({ history: history.slice(0, 20) }).catch(() => {});
}

// ── Core analysis (runs entirely in the service worker) ──────
// content: string (pre-extracted by popup) or null (background extracts it)
async function performAnalysis(tabId, type, content) {
  const { apiKey, model, liveSearch } = await chrome.storage.sync.get(
    ['apiKey', 'model', 'liveSearch']
  );

  if (!apiKey) {
    throw new Error('No API key configured. Please open Settings and add your Grok API key.');
  }

  // Extract page content when running in background (auto-check)
  if (type === 'page' && !content) {
    try {
      const [{ result: pageText }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const sel = 'article, main, [role="main"], p, h1, h2, h3, h4, h5, li';
          const nodes = document.querySelectorAll(sel);
          let out = '';
          if (nodes.length > 8) {
            nodes.forEach(n => { out += n.innerText + '\n'; });
          } else {
            out = document.body.innerText;
          }
          return out.substring(0, 16000);
        }
      });
      content = pageText;
    } catch (e) {
      throw new Error('Could not extract page content. The page may be restricted or not yet loaded.');
    }
  }

  if (!content || content.trim().length < 40) {
    throw new Error('Not enough readable text on this page to analyze. Try a content-rich article or news page.');
  }

  // Build prompt
  const typeLabel = type === 'selection' ? 'selected text' : 'web page content';
  const prompt =
`Analyze the following ${typeLabel} for disinformation, misinformation, propaganda, or false/misleading claims. Use live search to cross-reference facts where possible.

Respond ONLY with valid JSON — no markdown fences, no extra prose — in exactly this structure:
{
  "trustScore": <integer 0–100; 100 = fully trustworthy>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2–3 sentence plain-English overview of your findings>",
  "issues": [
    {
      "claim": "<the specific problematic claim or statement>",
      "verdict": "<your fact-check verdict>",
      "source": "<URL (https://...) where the reader can find more accurate information, or empty string if none>"
    }
  ],
  "recommendation": "<one concise, actionable sentence for the reader>"
}

Guidelines:
- trustScore 80–100 → LOW risk (accurate, well-sourced content)
- trustScore 50–79  → MEDIUM risk (some unverified or misleading elements)
- trustScore 30–49  → HIGH risk (significant misinformation present)
- trustScore 0–29   → CRITICAL risk (severe disinformation)
- If no issues found, return an empty issues array and trustScore ≥ 80.
- For each issue found, provide a source URL (starting with https://) where the reader can find more accurate information.

Content to analyze:
${content}`;

  let usedModel = model || 'grok-4-fast-reasoning';
  const useSearch = liveSearch !== false;
  if (useSearch && !usedModel.startsWith('grok-4')) {
    usedModel = 'grok-4-fast-reasoning';
  }

  const requestBody = {
    model: usedModel,
    system: 'You are a neutral, expert fact-checking AI assistant. You detect disinformation, misinformation, and false claims with precision. Always respond with valid JSON only, exactly as specified.',
    input: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_output_tokens: 1600
  };

  if (useSearch) {
    requestBody.tools = [{ type: 'web_search' }];
  }

  const resp = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    if (resp.status === 401) throw new Error('Invalid API key (401). Please check your key in Settings.');
    if (resp.status === 429) throw new Error('Rate limit reached (429). Please wait a moment and try again.');
    throw new Error(`API error ${resp.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await resp.json();

  // Extract text from every known xAI Responses API shape
  let raw = '';
  const msgItems = (data.output || []).filter(o => o.type === 'message');
  if (msgItems.length) {
    raw = msgItems
      .flatMap(o => (o.content || []).filter(c => c.type === 'output_text' || c.type === 'text').map(c => c.text))
      .join('');
  }
  if (!raw && data.output_text) raw = data.output_text;
  if (!raw && Array.isArray(data.output)) {
    raw = data.output.filter(o => typeof o === 'string').join('');
  }
  if (!raw && data.choices?.[0]?.message?.content) {
    raw = data.choices[0].message.content;
  }
  raw = raw.trim();

  if (!raw) {
    throw new Error(`No text found in API response. Raw keys: ${Object.keys(data).join(', ')}. First output type: ${data.output?.[0]?.type ?? 'none'}.`);
  }

  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let analysis;
  try {
    analysis = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      analysis = JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse Grok\'s response as JSON. Try again or switch to a different model in Settings.');
    }
  }

  // Sanitize required fields
  analysis.trustScore     = Math.max(0, Math.min(100, parseInt(analysis.trustScore) || 50));
  analysis.riskLevel      = ['LOW','MEDIUM','HIGH','CRITICAL'].includes(analysis.riskLevel) ? analysis.riskLevel : 'MEDIUM';
  analysis.issues         = Array.isArray(analysis.issues) ? analysis.issues : [];
  analysis.summary        = analysis.summary || 'Analysis complete.';
  analysis.recommendation = analysis.recommendation || '';

  // Get the tab's URL
  let tabUrl = '';
  try {
    const tab = await chrome.tabs.get(tabId);
    tabUrl = tab.url || '';
  } catch {}

  return {
    ...analysis,
    type,
    url: tabUrl,
    model: usedModel,
    timestamp: Date.now()
  };
}

// ── Context menus ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'check-selection',
      title: '🔍 Check with Grok: "%s"',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'check-page',
      title: '🔍 Check This Page for Disinformation',
      contexts: ['page', 'frame']
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'check-selection' && info.selectionText) {
    await chrome.storage.session.set({
      pendingCheck: { type: 'selection', text: info.selectionText }
    });
  } else if (info.menuItemId === 'check-page') {
    await chrome.storage.session.set({ pendingCheck: { type: 'page' } });
  }

  try {
    await chrome.action.openPopup();
  } catch (e) {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  }
});

// ── Keyboard shortcut ─────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'check-page') {
    await chrome.storage.session.set({ pendingCheck: { type: 'page' } });
    try {
      await chrome.action.openPopup();
    } catch (e) {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    }
  }
});

// ── Message handler ───────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  // Manual analysis triggered from popup
  // Content has already been extracted by popup (uses activeTab permission).
  // We run the API call here so it survives the popup closing.
  if (message.type === 'runAnalysis') {
    const { tabId, analysisType, content, url } = message;

    setTabState(tabId, { status: 'analyzing', url });

    performAnalysis(tabId, analysisType, content)
      .then(async result => {
        await setTabState(tabId, { status: 'complete', result, url: result.url });
        await saveToHistory(result);
        // Notify popup if it is still open — failure is expected if it closed
        chrome.runtime.sendMessage({ type: 'analysisResult', result, tabId }).catch(() => {});
      })
      .catch(err => {
        setTabState(tabId, { status: 'error', error: err.message, url });
        chrome.runtime.sendMessage({ type: 'analysisError', error: err.message, tabId }).catch(() => {});
      });

    // No sendResponse used — response arrives via separate sendMessage above
  }
});

// ── Tab navigation: clear stale badge & state ─────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // New URL means stale analysis — discard it and clear badge
  if (changeInfo.url) {
    await clearTabState(tabId);
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }).catch(() => [null]);
    if (activeTab?.id === tabId) clearBadge();
  }

  // Auto-check: run analysis when a page finishes loading
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    const { autoCheck, apiKey, showBadge } = await chrome.storage.sync.get(
      ['autoCheck', 'apiKey', 'showBadge']
    );
    if (!autoCheck || !apiKey) return;

    // Skip if we already have a result for this URL (e.g., page reload without navigation)
    const state = await getTabState(tabId);
    if (state && state.url === tab.url) return;

    await setTabState(tabId, { status: 'analyzing', url: tab.url });
    chrome.runtime.sendMessage({ type: 'autoCheckStarted', tabId }).catch(() => {});

    try {
      const result = await performAnalysis(tabId, 'page', null);
      await setTabState(tabId, { status: 'complete', result, url: tab.url });
      await saveToHistory(result);

      // Only badge the active tab (requirement 5: badge tied to auto-check)
      if (showBadge !== false) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }).catch(() => [null]);
        if (activeTab?.id === tabId) setBadgeForScore(result.trustScore);
      }

      chrome.runtime.sendMessage({ type: 'analysisResult', result, tabId }).catch(() => {});
    } catch (err) {
      await setTabState(tabId, { status: 'error', error: err.message, url: tab.url });
      chrome.runtime.sendMessage({ type: 'analysisError', error: err.message, tabId }).catch(() => {});
    }
  }
});

// ── Tab switch: restore or clear badge (requirement 5) ────────
// Badge is per-tab and only shown when auto-check is enabled.
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const { autoCheck, showBadge } = await chrome.storage.sync.get(['autoCheck', 'showBadge']);

  if (!autoCheck || showBadge === false) {
    clearBadge();
    return;
  }

  // Restore badge from the tab's stored auto-check result
  const state = await getTabState(tabId);
  if (state?.status === 'complete' && state.result) {
    setBadgeForScore(state.result.trustScore);
  } else {
    clearBadge();
  }
});
