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
    actionDelay: 1000, // milliseconds
    showCountdown: false // show countdown timer on page
  };

  // Language patterns (loaded from languages.json)
  let LANGUAGES = {};
  let languagesLoaded = false;

  let hasRun = false;
  let startTime = Date.now();
  let observer = null;
  let settings = DEFAULT_SETTINGS;
  let countdownInterval = null;

  // Load language patterns from languages.json
  async function loadLanguages() {
    try {
      const url = chrome.runtime.getURL('languages.json');
      const response = await fetch(url);
      LANGUAGES = await response.json();
      languagesLoaded = true;
      log('Languages loaded:', Object.keys(LANGUAGES).join(', '));
    } catch (error) {
      log('Error loading languages:', error);
      // Fallback to empty object
      LANGUAGES = {};
      languagesLoaded = true;
    }
  }

  // Logging helper
  function log(message, data = '') {
    console.log(`[Entra Auto Confirm] ${message}`, data);
  }

  // Display countdown in extension badge
  function showCountdownTimer(seconds) {
    try {
      if (!settings.showCountdown) return;

      let remainingSeconds = Math.ceil(seconds / 1000);

      // Update badge immediately
      chrome.runtime.sendMessage({
        type: 'updateBadge',
        text: remainingSeconds.toString()
      });

      log('Countdown timer displayed in badge');

      // Update countdown every second
      countdownInterval = setInterval(() => {
        try {
          remainingSeconds--;
          if (remainingSeconds > 0) {
            chrome.runtime.sendMessage({
              type: 'updateBadge',
              text: remainingSeconds.toString()
            });
          } else {
            // Clear badge
            chrome.runtime.sendMessage({
              type: 'clearBadge'
            });
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
        } catch (error) {
          log('Error in countdown interval:', error);
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }, 1000);
    } catch (error) {
      log('Error in showCountdownTimer:', error);
    }
  }

  // Clean up countdown
  function cleanupCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    // Clear badge
    try {
      chrome.runtime.sendMessage({
        type: 'clearBadge'
      });
    } catch (error) {
      log('Error clearing badge:', error);
    }
  }

  // Helper: Check if text matches any language pattern
  function matchesAnyLanguage(text, patternKey) {
    if (!text) return false;
    const lowerText = text.toLowerCase();

    for (const lang in LANGUAGES) {
      const patterns = LANGUAGES[lang][patternKey];
      if (patterns) {
        for (const pattern of patterns) {
          if (lowerText.includes(pattern.toLowerCase())) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Helper: Find button by text in any language
  function findButtonByPattern(container, patternKey) {
    const buttons = container.querySelectorAll('input[type="button"], input[type="submit"], button');

    for (const button of buttons) {
      const text = button.value || button.textContent.trim();
      if (!text) continue;

      for (const lang in LANGUAGES) {
        const patterns = LANGUAGES[lang][patternKey];
        if (patterns && patterns.includes(text)) {
          return button;
        }
      }
    }
    return null;
  }

  // Find the "Stay signed in?" dialog (multi-language)
  function findDialog() {
    // Look for the characteristic heading text in any language
    const headings = document.querySelectorAll('div[role="heading"]');
    for (const heading of headings) {
      if (matchesAnyLanguage(heading.textContent, 'dialogText')) {
        return heading.closest('div[role="dialog"]') || heading.parentElement.parentElement;
      }
    }

    // Fallback: look for Yes button in any language
    const buttons = document.querySelectorAll('input[type="button"], button');
    for (const button of buttons) {
      const text = button.value || button.textContent.trim();
      if (matchesAnyLanguage(text, 'yesButton')) {
        const parent = button.closest('div[role="dialog"]');
        if (parent) return parent;
      }
    }

    return null;
  }

  // Find the checkbox "Don't show this again" (multi-language)
  function findCheckbox(container) {
    // Try to find by label text in any language
    const labels = container.querySelectorAll('label');
    for (const label of labels) {
      if (matchesAnyLanguage(label.textContent, 'checkboxText')) {
        const checkbox = label.querySelector('input[type="checkbox"]') ||
                        document.getElementById(label.getAttribute('for'));
        if (checkbox) return checkbox;
      }
    }

    // Fallback: find any checkbox in the container
    return container.querySelector('input[type="checkbox"]');
  }

  // Find the "Yes" button (multi-language)
  function findYesButton(container) {
    return findButtonByPattern(container, 'yesButton');
  }

  // Find the "No" button (multi-language)
  function findNoButton(container) {
    return findButtonByPattern(container, 'noButton');
  }

  // Main automation function
  function handleDialog() {
    try {
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

    // Show countdown if enabled
    showCountdownTimer(settings.actionDelay);

      // Click target button after configured delay
      setTimeout(() => {
        targetButton.click();
        log(`${buttonName} button clicked`);
        hasRun = true;
        cleanup();
      }, settings.actionDelay);
    } catch (error) {
      log('Error in handleDialog:', error);
      // Clean up on error to prevent infinite loops
      cleanup();
    }
  }

  // Clean up observer
  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
      log('Observer disconnected');
    }
    cleanupCountdown();
  }

  // Initialize
  async function init() {
    try {
      log('Extension initialized');

      // Load language patterns first
      await loadLanguages();

      // Load settings from storage
      chrome.storage.sync.get(DEFAULT_SETTINGS, (loadedSettings) => {
        settings = loadedSettings;
        log('Settings loaded:', settings);

        // Check immediately on page load
        handleDialog();

        // Set up MutationObserver to watch for dialog appearing
        if (document.body) {
          observer = new MutationObserver(() => {
            try {
              handleDialog();
            } catch (error) {
              log('Error in MutationObserver callback:', error);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });

          log('Watching for dialog...');
        } else {
          log('document.body not available, cannot set up observer');
        }
      });
    } catch (error) {
      log('Error in init:', error);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
