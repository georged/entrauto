// Entra ID Auto Confirm Content Script
// Automatically handles the "Stay signed in?" dialog

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    maxWaitTime: 30000, // Stop watching after 30 seconds
    checkInterval: 500 // Check every 500ms for dialog
  };

  // Default settings
  const DEFAULT_SETTINGS = {
    action: 'yes', // 'yes' or 'no'
    checkDontShow: true,
    actionDelay: 1000 // milliseconds
  };

  let hasRun = false;
  let startTime = Date.now();
  let observer = null;
  let settings = DEFAULT_SETTINGS;

  // Logging helper
  function log(message, data = '') {
    console.log(`[Entra Auto Confirm] ${message}`, data);
  }

  // Find the "Stay signed in?" dialog
  function findDialog() {
    // Look for the characteristic heading text
    const headings = document.querySelectorAll('div[role="heading"]');
    for (const heading of headings) {
      if (heading.textContent.includes('Stay signed in')) {
        return heading.closest('div[role="dialog"]') || heading.parentElement.parentElement;
      }
    }

    // Fallback: look for buttons with specific text
    const buttons = document.querySelectorAll('input[type="button"], button');
    for (const button of buttons) {
      if (button.value === 'Yes' || button.textContent.trim() === 'Yes') {
        const parent = button.closest('div[role="dialog"]');
        if (parent) return parent;
      }
    }

    return null;
  }

  // Find the checkbox "Don't show this again"
  function findCheckbox(container) {
    // Try to find by label text
    const labels = container.querySelectorAll('label');
    for (const label of labels) {
      if (label.textContent.includes("Don't show this again")) {
        const checkbox = label.querySelector('input[type="checkbox"]') ||
                        document.getElementById(label.getAttribute('for'));
        if (checkbox) return checkbox;
      }
    }

    // Fallback: find any checkbox in the container
    return container.querySelector('input[type="checkbox"]');
  }

  // Find the "Yes" button
  function findYesButton(container) {
    const buttons = container.querySelectorAll('input[type="button"], input[type="submit"], button');

    for (const button of buttons) {
      const text = button.value || button.textContent.trim();
      if (text === 'Yes') {
        return button;
      }
    }

    return null;
  }

  // Find the "No" button
  function findNoButton(container) {
    const buttons = container.querySelectorAll('input[type="button"], input[type="submit"], button');

    for (const button of buttons) {
      const text = button.value || button.textContent.trim();
      if (text === 'No') {
        return button;
      }
    }

    return null;
  }

  // Main automation function
  function handleDialog() {
    if (hasRun) return;

    // Check timeout
    if (Date.now() - startTime > CONFIG.maxWaitTime) {
      log('Timeout reached, stopping observation');
      cleanup();
      return;
    }

    const dialog = findDialog();
    if (!dialog) return;

    log('Dialog detected');
    log('Settings:', settings);

    const checkbox = findCheckbox(dialog);
    const targetButton = settings.action === 'yes' ? findYesButton(dialog) : findNoButton(dialog);
    const buttonName = settings.action === 'yes' ? 'Yes' : 'No';

    if (!targetButton) {
      log(`${buttonName} button not found`);
      return;
    }

    // Check the checkbox if setting is enabled and checkbox is found
    if (settings.checkDontShow && checkbox && !checkbox.checked) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new Event('click', { bubbles: true }));
      log('Checkbox checked');
    } else if (settings.checkDontShow && checkbox) {
      log('Checkbox already checked');
    } else if (settings.checkDontShow) {
      log('Checkbox not found, proceeding without it');
    } else {
      log('Checkbox setting disabled, skipping');
    }

    // Click target button after configured delay
    setTimeout(() => {
      targetButton.click();
      log(`${buttonName} button clicked`);
      hasRun = true;
      cleanup();
    }, settings.actionDelay);
  }

  // Clean up observer
  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
      log('Observer disconnected');
    }
  }

  // Initialize
  function init() {
    log('Extension initialized');

    // Load settings from storage
    chrome.storage.sync.get(DEFAULT_SETTINGS, (loadedSettings) => {
      settings = loadedSettings;
      log('Settings loaded:', settings);

      // Check immediately on page load
      handleDialog();

      // Set up MutationObserver to watch for dialog appearing
      observer = new MutationObserver(() => {
        handleDialog();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      log('Watching for dialog...');
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
