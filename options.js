// ============================================================
// options.js  –  Grok Disinformation Checker settings page
// ============================================================

const STORAGE_KEYS = ['apiKey', 'model', 'liveSearch', 'autoDetectSelection', 'showBadge', 'theme'];

// ── Theme helpers ─────────────────────────────────────────────
function resolveTheme(stored) {
  // 'system' (or undefined) → follow OS preference
  if (!stored || stored === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return stored; // 'light' or 'dark'
}

function applyTheme(stored) {
  document.documentElement.setAttribute('data-theme', resolveTheme(stored));
}

function setActivePicker(stored) {
  const value = stored || 'system';
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === value);
  });
}

// ── Load saved settings on open ─────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const s = await chrome.storage.sync.get(STORAGE_KEYS);

  // Apply theme immediately so the page renders in the right mode
  applyTheme(s.theme);
  setActivePicker(s.theme);

  if (s.apiKey) {
    document.getElementById('apiKeyInput').value = s.apiKey;
  }
  document.getElementById('modelSelect').value              = s.model                 ?? 'grok-4-fast-reasoning';
  document.getElementById('liveSearch').checked             = s.liveSearch            !== false;
  document.getElementById('autoDetectSelection').checked    = s.autoDetectSelection   !== false;
  document.getElementById('showBadge').checked              = s.showBadge             !== false;
});

// ── Theme picker — live preview + immediate save ──────────────
document.getElementById('themePicker').addEventListener('click', async (e) => {
  const btn = e.target.closest('.theme-btn');
  if (!btn) return;
  const chosen = btn.dataset.theme;
  setActivePicker(chosen);
  applyTheme(chosen);
  await chrome.storage.sync.set({ theme: chosen });
});

// ── Toggle API key visibility ────────────────────────────────
document.getElementById('toggleVisibility').addEventListener('click', () => {
  const inp = document.getElementById('apiKeyInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

// ── Save API key ─────────────────────────────────────────────
document.getElementById('saveKeyBtn').addEventListener('click', async () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) {
    showStatus('keyStatus', 'Please enter an API key.', 'error');
    return;
  }
  if (!key.startsWith('xai-')) {
    showStatus('keyStatus', 'API key should start with "xai-". Please check your key.', 'error');
    return;
  }
  await chrome.storage.sync.set({ apiKey: key });
  showStatus('keyStatus', '✅ API key saved successfully!', 'success');
});

// ── Test connection ──────────────────────────────────────────
document.getElementById('testBtn').addEventListener('click', async () => {
  const key   = document.getElementById('apiKeyInput').value.trim();
  const model = document.getElementById('modelSelect').value || 'grok-4-fast-reasoning';

  if (!key) {
    showStatus('keyStatus', 'Enter an API key first.', 'error');
    return;
  }

  showStatus('keyStatus', '⏳ Testing connection…', 'info');

  try {
    const resp = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        input: [{ role: 'user', content: 'Reply with just the word OK.' }],
        model,
        max_output_tokens: 5
      })
    });

    if (resp.ok) {
      showStatus('keyStatus', '✅ Connection successful! API key is valid.', 'success');
    } else if (resp.status === 401) {
      showStatus('keyStatus', '❌ Invalid API key — please check and try again.', 'error');
    } else {
      const body = await resp.text();
      showStatus('keyStatus', `❌ API responded with status ${resp.status}: ${body.substring(0, 120)}`, 'error');
    }
  } catch (e) {
    showStatus('keyStatus', `❌ Connection failed: ${e.message}`, 'error');
  }
});

// ── Clear API key ────────────────────────────────────────────
document.getElementById('clearKeyBtn').addEventListener('click', async () => {
  document.getElementById('apiKeyInput').value = '';
  await chrome.storage.sync.remove('apiKey');
  showStatus('keyStatus', 'API key cleared.', 'success');
});

// ── Save analysis settings ───────────────────────────────────
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  await chrome.storage.sync.set({
    model:                document.getElementById('modelSelect').value,
    liveSearch:           document.getElementById('liveSearch').checked,
    autoDetectSelection:  document.getElementById('autoDetectSelection').checked,
    showBadge:            document.getElementById('showBadge').checked
    // theme is saved immediately on click — no need to include here
  });
  showStatus('settingsStatus', '✅ Settings saved!', 'success');
});

// ── Clear history ────────────────────────────────────────────
document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
  await chrome.storage.local.remove('history');
  showStatus('dataStatus', '✅ Analysis history cleared.', 'success');
});

// ── Clear all data ───────────────────────────────────────────
document.getElementById('clearAllBtn').addEventListener('click', async () => {
  if (!confirm('This will delete your API key, settings, and all history. Are you sure?')) return;
  await chrome.storage.sync.clear();
  await chrome.storage.local.clear();
  document.getElementById('apiKeyInput').value = '';
  document.getElementById('modelSelect').value              = 'grok-4-fast-reasoning';
  document.getElementById('liveSearch').checked             = true;
  document.getElementById('autoDetectSelection').checked    = true;
  document.getElementById('showBadge').checked              = true;
  setActivePicker('system');
  applyTheme('system');
  showStatus('dataStatus', '✅ All extension data cleared.', 'success');
});

// ── Utility ──────────────────────────────────────────────────
function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `status-msg ${type}`;
  setTimeout(() => {
    el.textContent = '';
    el.className = 'status-msg';
  }, 4500);
}
