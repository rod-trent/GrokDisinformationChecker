// ============================================================
// popup.js  –  Grok Disinformation Checker
// ============================================================

// ── State ────────────────────────────────────────────────────
let selectionText  = '';
let currentAnalysis = null;

// ── DOM refs ─────────────────────────────────────────────────
const pageUrlEl        = document.getElementById('pageUrl');
const noApiKeyEl       = document.getElementById('noApiKey');
const checkPageBtn     = document.getElementById('checkPage');
const checkSelectionBtn = document.getElementById('checkSelection');
const resultArea       = document.getElementById('resultArea');

// ── Theme ─────────────────────────────────────────────────────
async function applyTheme() {
  const { theme } = await chrome.storage.sync.get('theme');
  let resolved;
  if (!theme || theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } else {
    resolved = theme;
  }
  document.documentElement.setAttribute('data-theme', resolved);
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Apply theme before anything renders to avoid a flash
  await applyTheme();

  // Show hostname of active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const u = new URL(tab.url);
      pageUrlEl.textContent = u.hostname + (u.pathname.length > 1 ? u.pathname.substring(0, 45) : '');
    } else {
      pageUrlEl.textContent = '';
    }
  } catch { pageUrlEl.textContent = ''; }

  // Check API key
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) {
    noApiKeyEl.style.display = 'block';
    checkPageBtn.disabled    = true;
    checkSelectionBtn.disabled = true;
  }

  // Check for a pending action triggered from context menu / keyboard shortcut
  try {
    const { pendingCheck } = await chrome.storage.session.get('pendingCheck');
    if (pendingCheck) {
      await chrome.storage.session.remove('pendingCheck');
      if (pendingCheck.type === 'selection' && pendingCheck.text && apiKey) {
        selectionText = pendingCheck.text;
        checkSelectionBtn.style.display = 'flex';
        await runAnalysis('selection', selectionText);
        return;
      } else if (pendingCheck.type === 'page' && apiKey) {
        await runAnalysis('page');
        return;
      }
    }
  } catch { /* storage.session may not be available in all builds */ }

  // Auto-detect selected text on page (respects user setting)
  const { autoDetectSelection } = await chrome.storage.sync.get('autoDetectSelection');
  if (autoDetectSelection !== false) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection()?.toString() ?? ''
        });
        if (result && result.trim().length > 10) {
          selectionText = result.trim();
          checkSelectionBtn.style.display = 'flex';
        }
      }
    } catch { /* scripting blocked on some pages */ }
  }

  // Welcome state
  showWelcome();
}

// ── Tab switching ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'history') renderHistory();
  });
});

// ── Settings button ───────────────────────────────────────────
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
document.getElementById('setupLink').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ── Check buttons ─────────────────────────────────────────────
checkPageBtn.addEventListener('click',      () => runAnalysis('page'));
checkSelectionBtn.addEventListener('click', () => runAnalysis('selection', selectionText));

// ── Core analysis ─────────────────────────────────────────────
async function runAnalysis(type, text = null) {
  const { apiKey, model, liveSearch, showBadge } = await chrome.storage.sync.get(
    ['apiKey', 'model', 'liveSearch', 'showBadge']
  );

  if (!apiKey) {
    showError('No API key configured. Please open Settings and add your Grok API key.');
    return;
  }

  setButtons(false);
  showLoading(type === 'selection' ? 'Analyzing selected text…' : 'Analyzing page content…');

  try {
    // ── Gather content ──────────────────────────────────────
    let content = text;

    if (type === 'page') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [{ result: pageText }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Prefer semantic elements over raw body dump
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
    }

    if (!content || content.trim().length < 40) {
      throw new Error('Not enough readable text on this page to analyze. Try a content-rich article or news page.');
    }

    // ── Build prompt ────────────────────────────────────────
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
      "source": "<supporting source or reference, or empty string>"
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

Content to analyze:
${content}`;

    // ── API call ────────────────────────────────────────────
    // Uses the xAI Responses API (/v1/responses).
    // Live search on /v1/chat/completions is fully deprecated (HTTP 410).
    // The Responses API uses `input` instead of `messages`, a top-level
    // `system` field, and `tools: [{ type: 'web_search' }]` for live search.
    let usedModel = model || 'grok-4-fast-reasoning';

    // web_search (server-side tools) requires the grok-4 model family.
    // If the user has selected an older model, automatically upgrade for
    // this request so live search still works.
    const useSearch = liveSearch !== false;
    if (useSearch && !usedModel.startsWith('grok-4')) {
      usedModel = 'grok-4-fast-reasoning';
    }

    const requestBody = {
      model: usedModel,
      system: 'You are a neutral, expert fact-checking AI assistant. You detect disinformation, misinformation, and false claims with precision. Always respond with valid JSON only, exactly as specified.',
      input: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_output_tokens: 1600
    };

    // Add web_search tool only when Live Search is enabled in Settings
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

    // ── Extract text from the Responses API reply ──────────
    // Try every known shape the xAI Responses API may return, most specific first.
    let raw = '';

    // Shape 1: output[] array with message items containing content[]
    const msgItems = (data.output || []).filter(o => o.type === 'message');
    if (msgItems.length) {
      raw = msgItems
        .flatMap(o => (o.content || []).filter(c => c.type === 'output_text' || c.type === 'text').map(c => c.text))
        .join('');
    }

    // Shape 2: top-level output_text convenience field
    if (!raw && data.output_text) raw = data.output_text;

    // Shape 3: output[] items that are plain strings
    if (!raw && Array.isArray(data.output)) {
      raw = data.output
        .filter(o => typeof o === 'string')
        .join('');
    }

    // Shape 4: fallback to chat-completions style (in case API version varies)
    if (!raw && data.choices?.[0]?.message?.content) {
      raw = data.choices[0].message.content;
    }

    raw = raw.trim();

    // Still empty — surface the raw response so the structure can be inspected
    if (!raw) {
      throw new Error(`No text found in API response. Raw keys: ${Object.keys(data).join(', ')}. First output item type: ${data.output?.[0]?.type ?? 'none'}.`);
    }

    // Strip markdown code fences the model may have added
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      // Model may have prepended reasoning text before the JSON block —
      // find the first { ... } that spans the whole object.
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        analysis = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse Grok\'s response as JSON. Try again or switch to a different model in Settings.');
      }
    }

    // Sanitize required fields
    analysis.trustScore   = Math.max(0, Math.min(100, parseInt(analysis.trustScore) || 50));
    analysis.riskLevel    = ['LOW','MEDIUM','HIGH','CRITICAL'].includes(analysis.riskLevel) ? analysis.riskLevel : 'MEDIUM';
    analysis.issues       = Array.isArray(analysis.issues) ? analysis.issues : [];
    analysis.summary      = analysis.summary      || 'Analysis complete.';
    analysis.recommendation = analysis.recommendation || '';

    // Attach metadata
    currentAnalysis = {
      ...analysis,
      type,
      url:       await getCurrentUrl(),
      model:     usedModel,
      timestamp: Date.now()
    };

    // Persist to history
    await saveToHistory(currentAnalysis);

    // Update toolbar badge
    if (showBadge !== false) {
      chrome.runtime.sendMessage({ type: 'updateBadge', score: analysis.trustScore });
    }

    renderAnalysis(currentAnalysis);

  } catch (err) {
    showError(err.message);
  } finally {
    setButtons(true);
  }
}

// ── Rendering ─────────────────────────────────────────────────
function renderAnalysis(a) {
  const { trustScore, riskLevel, summary, issues, recommendation, type } = a;
  const color       = scoreColor(trustScore);
  const circumf     = 2 * Math.PI * 33;
  const dashOffset  = circumf - (trustScore / 100) * circumf;
  const riskIcon    = riskLevel === 'LOW' ? '✅' : riskLevel === 'MEDIUM' ? '⚠️' : '🚨';
  const typeLabel   = type === 'selection' ? '✂️ Selected Text' : '📄 Full Page';

  const issuesHtml = issues.length > 0
    ? `<div class="section-title">⚠️ Issues Found (${issues.length})</div>
       <div class="issues-list">
         ${issues.map(iss => `
           <div class="issue-item" style="border-left-color:${color}">
             <div class="issue-claim">${esc(iss.claim)}</div>
             <div class="issue-verdict">${esc(iss.verdict)}</div>
             ${iss.source ? `<div class="issue-source">📎 ${esc(iss.source)}</div>` : ''}
           </div>`).join('')}
       </div>`
    : `<div class="section-title">✅ No Issues Detected</div>
       <div style="font-size:12px;color:var(--muted);margin-bottom:14px">
         No significant disinformation or misinformation was found in this content.
       </div>`;

  resultArea.innerHTML = `
    <div class="analysis-tag">${typeLabel} · ${a.model || ''}</div>

    <div class="trust-card">
      <div class="score-ring">
        <svg width="82" height="82" viewBox="0 0 82 82">
          <circle class="track" cx="41" cy="41" r="33"/>
          <circle class="fill"  cx="41" cy="41" r="33"
            stroke="${color}"
            stroke-dasharray="${circumf}"
            stroke-dashoffset="${dashOffset}"/>
        </svg>
        <div class="score-text">
          <div class="score-number" style="color:${color}">${trustScore}</div>
          <div class="score-label">Trust</div>
        </div>
      </div>
      <div class="score-info">
        <div class="risk-badge risk-${riskLevel}">${riskIcon} ${riskLevel} RISK</div>
        <div class="score-summary">${esc(summary)}</div>
      </div>
    </div>

    ${issuesHtml}

    ${recommendation
      ? `<div class="section-title">💡 Recommendation</div>
         <div class="recommendation">${esc(recommendation)}</div>`
      : ''}

    <div class="action-row">
      <button class="btn btn-secondary btn-sm" id="copyBtn">📋 Copy Report</button>
      <button class="btn btn-secondary btn-sm" id="reanalyzeBtn">🔄 Re-analyze</button>
    </div>
  `;

  document.getElementById('copyBtn').addEventListener('click', () => copyReport(a));
  document.getElementById('reanalyzeBtn').addEventListener('click', () =>
    runAnalysis(a.type, a.type === 'selection' ? selectionText : null)
  );
}

function showWelcome() {
  resultArea.innerHTML = `
    <div class="status-view">
      <div style="font-size:34px;margin-bottom:10px">🔍</div>
      <div>Click <strong>Check Full Page</strong> to analyze this page,<br>
      or highlight text and click <strong>Check Selection</strong>.</div>
      <div class="status-sub">You can also right-click any page or selection,<br>or press <strong>Alt+Shift+G</strong>.</div>
    </div>`;
}

function showLoading(msg) {
  resultArea.innerHTML = `
    <div class="status-view">
      <div class="spinner"></div>
      <div>${msg}</div>
      <div class="status-sub">Using Grok AI + Live Search for real-time fact-checking…</div>
    </div>`;
}

function showError(msg) {
  resultArea.innerHTML = `
    <div class="error-box">
      <strong>⚠️ Error</strong><br>${esc(msg)}
      ${msg.includes('API key') || msg.includes('401')
        ? '<br><br><a onclick="chrome.runtime.openOptionsPage()">Open Settings →</a>'
        : ''}
    </div>`;
}

// ── Copy report to clipboard ──────────────────────────────────
async function copyReport(a) {
  const issueText = a.issues && a.issues.length
    ? a.issues.map((iss, i) =>
        `  ${i + 1}. ${iss.claim}\n     Verdict: ${iss.verdict}${iss.source ? `\n     Source:  ${iss.source}` : ''}`
      ).join('\n\n')
    : '  No issues found.';

  const report =
`Grok Disinformation Analysis Report
=====================================
URL:         ${a.url}
Date:        ${new Date(a.timestamp).toLocaleString()}
Type:        ${a.type === 'selection' ? 'Selected Text' : 'Full Page'}
Model:       ${a.model || 'unknown'}
Trust Score: ${a.trustScore}/100
Risk Level:  ${a.riskLevel}

Summary
-------
${a.summary}

Issues Found
------------
${issueText}

Recommendation
--------------
${a.recommendation || 'None.'}

─────────────────────────────────────
Generated by Grok Disinformation Checker
https://github.com/rod-trent/GrokDisinformationChecker`;

  try {
    await navigator.clipboard.writeText(report);
    const btn = document.getElementById('copyBtn');
    if (btn) {
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy Report'; }, 2200);
    }
  } catch {
    showError('Could not access clipboard. Try again after clicking inside the popup.');
  }
}

// ── History ───────────────────────────────────────────────────
async function saveToHistory(analysis) {
  const { history = [] } = await chrome.storage.local.get('history');
  history.unshift(analysis);
  await chrome.storage.local.set({ history: history.slice(0, 20) });
}

async function renderHistory() {
  const { history = [] } = await chrome.storage.local.get('history');
  const list = document.getElementById('historyList');

  if (!history.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕐</div>
        <div class="empty-text">No analysis history yet.<br>Check a page to get started.</div>
      </div>`;
    return;
  }

  list.innerHTML = history.map((item, idx) => {
    const color = scoreColor(item.trustScore);
    const host  = item.url
      ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
      : 'Selected Text';
    const date  = new Date(item.timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const typeIcon = item.type === 'selection' ? '✂️' : '📄';

    return `
      <div class="history-item" data-idx="${idx}">
        <div class="hist-score" style="background:${color}1a;color:${color};border:2px solid ${color}40">
          ${item.trustScore}
        </div>
        <div class="hist-info">
          <div class="hist-url">${esc(host)}</div>
          <div class="hist-date">${date} · ${typeIcon}</div>
        </div>
        <div class="hist-risk" style="color:${color}">${item.riskLevel}</div>
      </div>`;
  }).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = history[parseInt(el.dataset.idx)];
      currentAnalysis = item;
      // Switch to Analyze tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelector('[data-tab="analyze"]').classList.add('active');
      document.getElementById('panel-analyze').classList.add('active');
      renderAnalysis(item);
    });
  });
}

// ── Utilities ─────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 70) return 'var(--green)';
  if (score >= 50) return 'var(--yellow)';
  if (score >= 30) return 'var(--orange)';
  return 'var(--red)';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab?.url || '';
  } catch { return ''; }
}

function setButtons(enabled) {
  checkPageBtn.disabled      = !enabled;
  checkSelectionBtn.disabled = !enabled;
}
