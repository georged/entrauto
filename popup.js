// Popup settings management

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
const status = document.getElementById('status');

// Update toggle description text
function updateToggleDescription() {
  toggleDescription.textContent = actionToggle.checked ? 'Stay signed in' : "Don't stay signed in";
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
  const settings = {
    action: actionToggle.checked ? 'yes' : 'no',
    checkDontShow: checkDontShow.checked,
    actionDelay: parseInt(actionDelayInput.value, 10) || 1000,
    showCountdown: showCountdown.checked
  };

  chrome.storage.sync.set(settings, () => {
    // Show success message
    status.textContent = 'Settings saved successfully!';
    status.className = 'status success';

    // Clear message after 2 seconds
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
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

// Load settings when popup opens
loadSettings();
