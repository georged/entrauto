// Background service worker for Entra ID Auto Confirm

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    // Update badge text
    chrome.action.setBadgeText({
      text: message.text,
      tabId: sender.tab.id
    });

    // Set badge background color (blue)
    chrome.action.setBadgeBackgroundColor({
      color: '#0078d4',
      tabId: sender.tab.id
    });

    sendResponse({ success: true });
  } else if (message.type === 'clearBadge') {
    // Clear badge text
    chrome.action.setBadgeText({
      text: '',
      tabId: sender.tab.id
    });

    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});
