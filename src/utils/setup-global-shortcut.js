// https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/src/utils/setup-global-shortcut.js

const { globalShortcut, ipcMain } = require('electron');
const i18n = require('i18next');
const createToggler = require('./create-toggler');
const store = require('../common/store');
const { IS_MAC } = require('../common/consts');
const { showDialog } = require('../dialogs');

// https://www.electronjs.org/docs/api/global-shortcut

// This function registers a global shortcut/accelerator with a certain action
// and (de)activates it according to its 'settingsOption' value on settings.
module.exports = function ({ settingsOption, accelerator, action, confirmationDialog }) {
  const activate = ({ newValue, oldValue, feedback }) => {
    if (newValue === oldValue) {
      return;
    }

    if (newValue === true) {
      if (feedback && confirmationDialog) {
        if (showDialog({
          ...confirmationDialog,
          buttons: [
            i18n.t('enable'),
            i18n.t('cancel')
          ]
        }) !== 0) {
          // User canceled
          return;
        }
      }
      // https://www.electronjs.org/docs/api/global-shortcut#globalshortcutregisteraccelerator-callback
      globalShortcut.register(accelerator, action);
    } else {
      // https://www.electronjs.org/docs/api/global-shortcut#globalshortcutunregisteraccelerator
      globalShortcut.unregister(accelerator);
    }
    return true
  }

  activate({ newValue: store.get(settingsOption, false) });
  createToggler(settingsOption, activate);

  if (!IS_MAC) {
    return;
  }

  // On macOS, when registering accelerators in the menubar, we need to
  // unregister them globally before the menubar is open. Otherwise they
  // won't work unless the user closes the menubar.
  ipcMain.on('menubar-will-open', () => {
    if (store.get(settingsOption, false)) {
      globalShortcut.unregister(accelerator);
    }
  })

  ipcMain.on('menubar-will-close', () => {
    if (store.get(settingsOption, false)) {
      globalShortcut.register(accelerator, action);
    }
  })
}
