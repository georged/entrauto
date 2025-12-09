// Background service worker for Entra ID Auto Confirm

// Create icons in multiple sizes for better display
function createIconWithText(text, size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill background with Microsoft blue
  ctx.fillStyle = '#0078d4';
  ctx.fillRect(0, 0, size, size);

  // Draw text in white
  ctx.fillStyle = '#ffffff';
  const fontSize = Math.floor(size * 0.6);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);

  return ctx.getImageData(0, 0, size, size);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    try {
      console.log('[Entra Auto Confirm] Updating icon with countdown:', message.text);

      // Create icons in multiple sizes
      const iconData = {
        '16': createIconWithText(message.text, 16),
        '32': createIconWithText(message.text, 32),
        '48': createIconWithText(message.text, 48),
        '128': createIconWithText(message.text, 128)
      };

      chrome.action.setIcon({
        imageData: iconData,
        tabId: sender.tab.id
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('[Entra Auto Confirm] Error setting icon:', chrome.runtime.lastError);
        } else {
          console.log('[Entra Auto Confirm] Icon updated successfully');
        }
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error('[Entra Auto Confirm] Error in updateBadge handler:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.type === 'clearBadge') {
    try {
      console.log('[Entra Auto Confirm] Clearing icon, restoring default');

      // Create default "AC" icons in multiple sizes
      const iconData = {
        '16': createIconWithText('AC', 16),
        '32': createIconWithText('AC', 32),
        '48': createIconWithText('AC', 48),
        '128': createIconWithText('AC', 128)
      };

      chrome.action.setIcon({
        imageData: iconData,
        tabId: sender.tab.id
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('[Entra Auto Confirm] Error restoring icon:', chrome.runtime.lastError);
        } else {
          console.log('[Entra Auto Confirm] Icon restored successfully');
        }
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error('[Entra Auto Confirm] Error in clearBadge handler:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  return true; // Keep message channel open for async response
});

// Set default "AC" icon on extension startup
try {
  const defaultIconData = {
    '16': createIconWithText('AC', 16),
    '32': createIconWithText('AC', 32),
    '48': createIconWithText('AC', 48),
    '128': createIconWithText('AC', 128)
  };

  chrome.action.setIcon({
    imageData: defaultIconData
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('[Entra Auto Confirm] Error setting default icon on startup:', chrome.runtime.lastError);
    } else {
      console.log('[Entra Auto Confirm] Default icon set successfully');
    }
  });
} catch (error) {
  console.error('[Entra Auto Confirm] Error in startup icon setup:', error);
}
