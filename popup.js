// Popup settings management

// Default settings
const DEFAULT_SETTINGS = {
  action: 'yes', // 'yes' or 'no'
  checkDontShow: true,
  actionDelay: 1000 // milliseconds
};

// DOM elements
const actionYes = document.getElementById('actionYes');
const actionNo = document.getElementById('actionNo');
const checkDontShow = document.getElementById('checkDontShow');
const actionDelayInput = document.getElementById('actionDelay');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    actionYes.checked = settings.action === 'yes';
    actionNo.checked = settings.action === 'no';
    checkDontShow.checked = settings.checkDontShow;
    actionDelayInput.value = settings.actionDelay;
  });
}

// Save settings
function saveSettings() {
  const settings = {
    action: actionYes.checked ? 'yes' : 'no',
    checkDontShow: checkDontShow.checked,
    actionDelay: parseInt(actionDelayInput.value, 10) || 1000
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
saveBtn.addEventListener('click', saveSettings);

// Allow Enter key to save
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

// Load settings when popup opens
loadSettings();
