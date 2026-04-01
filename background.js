// ============================================================
// background.js  –  Grok Disinformation Checker service worker
// ============================================================

// ----- Context menus ----------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  // Remove any stale menus first
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

// Context menu click → stash intent, open popup
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'check-selection' && info.selectionText) {
    await chrome.storage.session.set({
      pendingCheck: { type: 'selection', text: info.selectionText }
    });
  } else if (info.menuItemId === 'check-page') {
    await chrome.storage.session.set({
      pendingCheck: { type: 'page' }
    });
  }

  // openPopup() requires a user gesture (context-menu click qualifies) and Chrome ≥ 99
  try {
    await chrome.action.openPopup();
  } catch (e) {
    // Fallback: open popup as a tab so the user still sees results
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  }
});

// ----- Keyboard shortcut ------------------------------------
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

// ----- Badge helpers (called by popup.js via message) -------
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'updateBadge') {
    const score = message.score;
    let color = '#22c55e';           // green  ≥ 70
    if (score < 30)      color = '#ef4444';  // red
    else if (score < 50) color = '#f97316';  // orange
    else if (score < 70) color = '#eab308';  // yellow

    chrome.action.setBadgeText({ text: score.toString() });
    chrome.action.setBadgeBackgroundColor({ color });
  }

  if (message.type === 'clearBadge') {
    chrome.action.setBadgeText({ text: '' });
  }
});
