# Entra ID Auto Confirm

> A Chromium browser extension that automatically handles the Microsoft Entra ID "Stay signed in?" dialog with configurable options.

## Overview

Entra ID Auto Confirm eliminates the need to manually interact with the "Stay signed in?" prompt that appears after authenticating with Microsoft Entra ID (formerly Azure AD). The extension detects the dialog automatically and performs your preferred action based on your settings.

## Features

- **Automatic Detection** - Identifies the "Stay signed in?" dialog instantly
- **Configurable Actions** - Choose to click "Yes" or "No"
- **Optional Checkbox** - Optionally check "Don't show this again"
- **Adjustable Delay** - Set custom wait time before button click (0-5000ms)
- **Visual Countdown** - Optional countdown timer displayed in extension icon badge
- **Simple Settings UI** - Easy-to-use popup for configuration
- **Privacy-Focused** - All processing happens locally, no data collection
- **Universal Support** - Works on all Microsoft/Entra ID login pages

## Installation

### Prerequisites
- Chromium-based browser (Chrome, Edge, Brave, etc.)
- No additional software required

### Steps

1. **Download or clone this repository** to your local machine

2. **Open your browser's extension page:**
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`

3. **Enable Developer Mode** using the toggle in the top-right corner

4. **Click "Load unpacked"**

5. **Select the extension folder** containing the `manifest.json` file

6. **Done!** The extension icon should appear in your toolbar

## Configuration

### Accessing Settings

Click the extension icon in your browser toolbar to open the settings popup.

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| **Dialog Action** | Choose whether to click "Yes" (stay signed in) or "No" (don't stay signed in) | Yes |
| **Check "Don't show this again"** | Enable to automatically check the checkbox before clicking the button | Enabled |
| **Delay Before Click** | Time to wait (in milliseconds) before clicking the button | 1000ms (1 second) |
| **Visual Countdown** | Display a countdown timer in the extension icon badge | Disabled |

### Example Configurations

**Scenario 1: Always stay signed in (standard)**
- Dialog Action: `Yes`
- Check "Don't show this again": `Enabled`
- Delay Before Click: `1000ms`
- Visual Countdown: `Disabled`

**Scenario 2: Never stay signed in**
- Dialog Action: `No`
- Check "Don't show this again": `Enabled`
- Delay Before Click: `1000ms`
- Visual Countdown: `Disabled`

**Scenario 3: Stay signed in with visual feedback**
- Dialog Action: `Yes`
- Check "Don't show this again": `Enabled`
- Delay Before Click: `2000ms`
- Visual Countdown: `Enabled`

**Scenario 4: Instant click (no delay)**
- Dialog Action: `Yes`
- Check "Don't show this again": `Enabled`
- Delay Before Click: `0ms`
- Visual Countdown: `Disabled`

**Scenario 5: Longer delay for slower connections**
- Dialog Action: `Yes`
- Check "Don't show this again": `Enabled`
- Delay Before Click: `3000ms`
- Visual Countdown: `Enabled`

## Usage

Once installed and configured, the extension works automatically:

1. Navigate to any Microsoft/Entra ID login page
2. Complete your authentication
3. When the "Stay signed in?" dialog appears, the extension will:
   - Execute your chosen action (Yes/No)
   - Check the checkbox if enabled
   - All in a fraction of a second

**No manual interaction required!**

## Debugging

The extension logs detailed activity to the browser console for troubleshooting.

### Viewing Console Logs

1. On a Microsoft login page, press `F12` to open DevTools
2. Navigate to the **Console** tab
3. Look for messages prefixed with `[Entra Auto Confirm]`

### Example Console Output

```
[Entra Auto Confirm] Extension initialized
[Entra Auto Confirm] Settings loaded: {action: 'yes', checkDontShow: true}
[Entra Auto Confirm] Watching for dialog...
[Entra Auto Confirm] Dialog detected
[Entra Auto Confirm] Checkbox checked
[Entra Auto Confirm] Yes button clicked
[Entra Auto Confirm] Observer disconnected
```

## Supported Domains

The extension automatically activates on the following Microsoft authentication domains:

- `login.microsoftonline.com`
- `*.login.microsoftonline.com`
- `login.microsoft.com`
- `*.login.microsoft.com`

## Project Structure

```
entra-auto-confirm/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Background service worker for badge updates
├── content.js         # Main automation logic and dialog detection
├── languages.json     # Multi-language dialog patterns
├── popup.html         # Settings UI structure
├── popup.js           # Settings management logic
├── popup.css          # Settings UI styles
├── _locales/          # Internationalization
│   ├── en/
│   │   └── messages.json  # English translations
│   └── uk/
│       └── messages.json  # Ukrainian translations
├── LICENSE            # MIT License
└── README.md          # Documentation
```

## Multi-Language Support

The extension supports multiple languages for both:
1. **Dialog Detection** - Recognizes "Stay signed in?" dialog in different languages
2. **UI Translation** - Settings popup displays in your browser's language

### Supported Languages

- **English (en)** - Default
- **Ukrainian (uk)** - Complete support

### Adding a New Language

To add support for a new language (e.g., Spanish):

#### 1. Add Dialog Patterns

Edit `languages.json` and add the language code with patterns:

```json
{
  "en": { ... },
  "uk": { ... },
  "es": {
    "dialogText": ["Mantener la sesión iniciada", "mantener la sesión iniciada"],
    "checkboxText": ["No volver a mostrar", "no volver a mostrar"],
    "yesButton": ["Sí"],
    "noButton": ["No"]
  }
}
```

#### 2. Add UI Translations

Create `_locales/es/messages.json` with all translated strings:

```json
{
  "extName": {
    "message": "Entra ID Auto Confirm",
    "description": "Extension name"
  },
  "extDescription": {
    "message": "Maneja automáticamente el diálogo 'Mantener la sesión iniciada?' de Microsoft Entra ID",
    "description": "Extension description"
  },
  ...
}
```

Copy the structure from `_locales/en/messages.json` and translate all values.

**That's it!** No code changes needed. The extension automatically:
- Loads and uses the new language patterns
- Detects the browser's language and shows the appropriate UI

### Language Detection

- **Dialog patterns**: Checks against ALL languages simultaneously
- **UI language**: Uses browser's UI language (falls back to English)

## Privacy & Security

This extension is designed with privacy as a top priority:

- ✅ **No Data Collection** - Zero telemetry or analytics
- ✅ **No External Communication** - All processing happens locally
- ✅ **Minimal Permissions** - Only requests storage (for settings) and access to Microsoft login domains
- ✅ **Open Source** - All code is transparent and auditable
- ✅ **Local Storage Only** - Settings are stored using Chrome's sync storage (encrypted by browser)

### Permissions Explained

| Permission | Reason | Usage |
|------------|--------|-------|
| `storage` | Store your preferences | Saves your "Yes/No" preference and checkbox setting |
| `host_permissions` | Access Microsoft login pages | Detects and interacts with the "Stay signed in?" dialog |

## Uninstallation

### Remove Extension

1. Navigate to `chrome://extensions` (or your browser's equivalent)
2. Locate "Entra ID Auto Confirm"
3. Click **Remove**
4. Confirm removal

All settings will be automatically deleted when the extension is removed.

## Troubleshooting

### Extension Not Working

**Problem:** Dialog is not being handled automatically

**Solutions:**
- Verify Developer Mode is enabled in `chrome://extensions`
- Check that the extension is enabled (toggle should be blue/on)
- Open console (F12) and look for `[Entra Auto Confirm]` messages
- Ensure you're on a supported Microsoft login domain
- Try reloading the extension (click the reload icon in `chrome://extensions`)

### Settings Not Saving

**Problem:** Changes to settings don't persist

**Solutions:**
- Ensure you clicked the "Save Settings" button
- Check for a success message after saving
- Try closing and reopening the settings popup
- Check browser console for storage errors

### Dialog Still Appearing

**Problem:** Dialog appears despite the extension being active

**Solutions:**
- Microsoft may have updated their page structure
- Check console logs to see if the dialog was detected
- Verify your organization hasn't disabled the "Don't show this again" option
- Report the issue with console output for investigation

### Wrong Button Being Clicked

**Problem:** Extension clicks the opposite button

**Solutions:**
- Open the extension settings popup
- Verify the "Dialog Action" setting matches your preference
- Click "Save Settings" to ensure changes are applied
- Reload the login page and try again

## Technical Details

### Architecture

- **Content Script Injection** - Runs on Microsoft login pages only
- **MutationObserver Pattern** - Efficiently watches for dialog appearance
- **Chrome Storage API** - Syncs settings across devices (if signed into Chrome)
- **Event-Driven** - Minimal resource usage, only active when needed

### Implementation Highlights

- Multiple fallback selectors for robust dialog detection
- 30-second timeout prevents indefinite observation
- Single execution per page load (prevents duplicate actions)
- Configurable delay before button click (default 1 second) for reliable page interaction
- Fully configurable behavior through settings UI (no code modification required)

### Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 88+ | ✅ Fully Supported |
| Edge | 88+ | ✅ Fully Supported |
| Brave | 1.20+ | ✅ Fully Supported |
| Opera | 74+ | ✅ Fully Supported |
| Vivaldi | 3.6+ | ✅ Fully Supported |

*Requires Manifest V3 support*

## Contributing

This is a personal-use extension, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on actual Microsoft login pages
5. Submit a pull request with a clear description

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 George Doubinski

---

**Made with ❤️ for productivity**
