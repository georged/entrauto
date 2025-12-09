// Popup settings management

// Initialize i18n
function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      element.textContent = message;
    }
  });
}

// Default settings
const DEFAULT_SETTINGS = {
  action: 'yes', // 'yes' or 'no'
  checkDontShow: true,
  actionDelay: 1000, // milliseconds
  showCountdown: false // show countdown timer on page
};

// DOM elements
const actionToggle = document.getElementById('actionToggle');
const toggleDescription = document.getElementById('toggleDescription');
const checkDontShow = document.getElementById('checkDontShow');
const actionDelayInput = document.getElementById('actionDelay');
const showCountdown = document.getElementById('showCountdown');
const saveBtn = document.getElementById('saveBtn');
const statusElement = document.getElementById('status');

// Update toggle description text
function updateToggleDescription() {
  const key = actionToggle.checked ? 'staySignedIn' : 'dontStaySignedIn';
  toggleDescription.textContent = chrome.i18n.getMessage(key);
}

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    actionToggle.checked = settings.action === 'yes';
    updateToggleDescription();
    checkDontShow.checked = settings.checkDontShow;
    actionDelayInput.value = settings.actionDelay;
    showCountdown.checked = settings.showCountdown;
  });
}

// Save settings
function saveSettings() {
  // Parse delay value, default to 1000 if invalid, convert negative to 0
  let delay = parseInt(actionDelayInput.value, 10);
  if (isNaN(delay)) {
    delay = 1000;
  } else if (delay < 0) {
    delay = 0;
  }

  const settings = {
    action: actionToggle.checked ? 'yes' : 'no',
    checkDontShow: checkDontShow.checked,
    actionDelay: delay,
    showCountdown: showCountdown.checked
  };

  chrome.storage.sync.set(settings, () => {
    // Show success message
    statusElement.textContent = chrome.i18n.getMessage('saveSuccess');
    statusElement.className = 'status success';

    // Clear message after 2 seconds
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'status';
    }, 2000);
  });
}

// Event listeners
actionToggle.addEventListener('change', updateToggleDescription);
saveBtn.addEventListener('click', saveSettings);

// Allow Enter key to save
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

// Initialize i18n and load settings when popup opens
initI18n();
loadSettings();
