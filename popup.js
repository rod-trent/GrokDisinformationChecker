// ============================================================
// popup.js  –  Grok Disinformation Checker
// ============================================================

// ── State ────────────────────────────────────────────────────
let selectionText   = '';
let currentAnalysis = null;
let currentTabId    = null;
let analysisTimeoutId = null;

// ── DOM refs ─────────────────────────────────────────────────
const pageUrlEl         = document.getElementById('pageUrl');
const noApiKeyEl        = document.getElementById('noApiKey');
const checkPageBtn      = document.getElementById('checkPage');
const checkSelectionBtn = document.getElementById('checkSelection');
const resultArea        = document.getElementById('resultArea');

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

// ── Background message listener (set up before DOMContentLoaded) ─
// Analysis runs in the service worker and sends results back here.
chrome.runtime.onMessage.addListener((message) => {
  // Only act on messages for the tab this popup is showing
  if (message.tabId !== undefined && message.tabId !== currentTabId) return;

  if (message.type === 'analysisResult') {
    clearAnalysisTimeout();
    currentAnalysis = message.result;
    renderAnalysis(currentAnalysis);
    setButtons(true);
  }

  if (message.type === 'analysisError') {
    clearAnalysisTimeout();
    showError(message.error);
    setButtons(true);
  }

  if (message.type === 'autoCheckStarted') {
    // Auto-check kicked off by background — show loading if popup is on Analyze tab
    const analyzePanel = document.getElementById('panel-analyze');
    if (analyzePanel?.classList.contains('active')) {
      showLoading('Auto-checking page for disinformation…');
      setButtons(false);
    }
  }
});

function clearAnalysisTimeout() {
  if (analysisTimeoutId) { clearTimeout(analysisTimeoutId); analysisTimeoutId = null; }
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await applyTheme();

  // Identify the active tab
  let tab = null;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const u = new URL(tab.url);
      pageUrlEl.textContent = u.hostname + (u.pathname.length > 1 ? u.pathname.substring(0, 45) : '');
    } else {
      pageUrlEl.textContent = '';
    }
    if (tab?.id) currentTabId = tab.id;
  } catch { pageUrlEl.textContent = ''; }

  // Check API key
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) {
    noApiKeyEl.style.display = 'block';
    checkPageBtn.disabled    = true;
    checkSelectionBtn.disabled = true;
  }

  // Check for a pending action from context menu / keyboard shortcut
  try {
    const { pendingCheck } = await chrome.storage.session.get('pendingCheck');
    if (pendingCheck) {
      await chrome.storage.session.remove('pendingCheck');
      if (pendingCheck.type === 'selection' && pendingCheck.text && apiKey) {
        selectionText = pendingCheck.text;
        checkSelectionBtn.style.display = 'flex';
        runAnalysis('selection', selectionText);
        return;
      } else if (pendingCheck.type === 'page' && apiKey) {
        runAnalysis('page');
        return;
      }
    }
  } catch { /* storage.session unavailable in some builds */ }

  // Check if the background already has an in-progress or completed analysis for this tab
  if (tab?.id) {
    try {
      const stored  = await chrome.storage.session.get(`tabState_${tab.id}`);
      const tabState = stored[`tabState_${tab.id}`];

      if (tabState) {
        if (tabState.status === 'analyzing') {
          // Analysis running in background — show loading and wait for message
          showLoading(tabState.autoCheck ? 'Auto-checking page for disinformation…' : 'Analyzing page content…');
          setButtons(false);
          // Timeout safety net in case the service worker is interrupted
          analysisTimeoutId = setTimeout(() => {
            showError('Analysis took too long. Please try again.');
            setButtons(true);
          }, 120000);
          return;
        }
        if (tabState.status === 'complete' && tabState.result) {
          currentAnalysis = tabState.result;
          renderAnalysis(currentAnalysis);
          return;
        }
        if (tabState.status === 'error') {
          showError(tabState.error || 'Analysis failed. Please try again.');
          return;
        }
      }
    } catch { /* session storage unavailable */ }
  }

  // Auto-detect selected text on page (respects user setting)
  const { autoDetectSelection } = await chrome.storage.sync.get('autoDetectSelection');
  if (autoDetectSelection !== false && tab?.id) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() ?? ''
      });
      if (result && result.trim().length > 10) {
        selectionText = result.trim();
        checkSelectionBtn.style.display = 'flex';
      }
    } catch { /* scripting blocked on some pages */ }
  }

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
// Content is extracted here (requires activeTab + user gesture), then the
// API call is handed off to background.js so it survives the popup closing.
async function runAnalysis(type, text = null) {
  const { apiKey } = await chrome.storage.sync.get('apiKey');

  if (!apiKey) {
    showError('No API key configured. Please open Settings and add your Grok API key.');
    return;
  }

  setButtons(false);
  showLoading(type === 'selection' ? 'Analyzing selected text…' : 'Analyzing page content…');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let content = text;

    if (type === 'page') {
      const [{ result: pageText }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
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
    }

    if (!content || content.trim().length < 40) {
      throw new Error('Not enough readable text on this page to analyze. Try a content-rich article or news page.');
    }

    // Hand off to background.js — the fetch continues even if popup closes
    chrome.runtime.sendMessage({
      type:         'runAnalysis',
      tabId:        tab.id,
      analysisType: type,
      content,
      url:          tab.url || ''
    });

    // Set a safety timeout in case the service worker is interrupted
    clearAnalysisTimeout();
    analysisTimeoutId = setTimeout(() => {
      if (resultArea.querySelector('.spinner')) {
        showError('Analysis took too long. Please try again.');
        setButtons(true);
      }
    }, 120000);

  } catch (err) {
    showError(err.message);
    setButtons(true);
  }
}

// ── Rendering ─────────────────────────────────────────────────
function renderAnalysis(a) {
  const { trustScore, riskLevel, summary, issues, recommendation, type } = a;
  const color      = scoreColor(trustScore);
  const circumf    = 2 * Math.PI * 33;
  const dashOffset = circumf - (trustScore / 100) * circumf;
  const riskIcon   = riskLevel === 'LOW' ? '✅' : riskLevel === 'MEDIUM' ? '⚠️' : '🚨';
  const typeLabel  = type === 'selection' ? '✂️ Selected Text' : '📄 Full Page';

  const issuesHtml = issues.length > 0
    ? `<div class="section-title">⚠️ Issues Found (${issues.length})</div>
       <div class="issues-list">
         ${issues.map(iss => `
           <div class="issue-item" style="border-left-color:${color}">
             <div class="issue-claim">${esc(iss.claim)}</div>
             <div class="issue-verdict">${esc(iss.verdict)}</div>
             ${iss.source ? `<div class="issue-source">📎 ${renderSource(iss.source)}</div>` : ''}
           </div>`).join('')}
       </div>`
    : `<div class="section-title">✅ No Issues Detected</div>
       <div style="font-size:12px;color:var(--muted);margin-bottom:14px">
         No significant disinformation or misinformation was found in this content.
       </div>`;

  resultArea.innerHTML = `
    <div class="analysis-tag">${typeLabel} · ${esc(a.model || '')}</div>

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

  // Re-analyze: if this is a historical (different-URL) page result, open the
  // original URL in a new tab and queue a pending check there.
  document.getElementById('reanalyzeBtn').addEventListener('click', async () => {
    if (a.type === 'page' && a.url) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (a.url !== tab.url) {
          // Open the original article URL in a new tab and trigger auto-analysis
          await chrome.storage.session.set({ pendingCheck: { type: 'page' } });
          chrome.tabs.create({ url: a.url });
          return;
        }
      } catch {}
    }
    runAnalysis(a.type, a.type === 'selection' ? selectionText : null);
  });
}

// Render a source field: URL → clickable link, plain text → escaped text
function renderSource(source) {
  if (!source) return '';
  const s = source.trim();
  // Only allow http/https to prevent javascript: injection
  if (/^https?:\/\//i.test(s)) {
    const display = s.length > 65 ? s.substring(0, 62) + '…' : s;
    return `<a href="${esc(s)}" target="_blank" rel="noopener noreferrer" class="source-link">${esc(display)}</a>`;
  }
  return esc(s);
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
      <div class="status-sub">Using Grok AI + Live Search for real-time fact-checking…<br>
      <em style="font-size:9px;margin-top:4px;display:block">Analysis continues even if you switch tabs.</em></div>
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
    const color    = scoreColor(item.trustScore);
    const typeIcon = item.type === 'selection' ? '✂️' : '📄';
    const date     = new Date(item.timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Show hostname for page analyses, "Selected Text" for selections
    let host = 'Selected Text';
    let linkHtml = '';
    if (item.type !== 'selection' && item.url) {
      try {
        host = new URL(item.url).hostname;
      } catch { host = item.url.substring(0, 30); }
      // Direct link to the original article (opens in new tab)
      linkHtml = `<a class="hist-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"
                     title="${esc(item.url)}">🔗</a>`;
    }

    return `
      <div class="history-item" data-idx="${idx}">
        <div class="hist-score" style="background:${color}1a;color:${color};border:2px solid ${color}40">
          ${item.trustScore}
        </div>
        <div class="hist-info">
          <div class="hist-url">${esc(host)} ${linkHtml}</div>
          <div class="hist-date">${date} · ${typeIcon}</div>
        </div>
        <div class="hist-risk" style="color:${color}">${item.riskLevel}</div>
      </div>`;
  }).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't intercept clicks on the direct-link button
      if (e.target.closest('.hist-link')) return;

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
