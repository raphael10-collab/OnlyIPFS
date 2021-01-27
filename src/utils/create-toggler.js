// https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/src/utils/create-toggler.js

const { ipcMain } = require('electron');
const store = require('../common/store');
const logger = require('../common/logger');

module.exports = function (settingsOption, activate) {

  // https://www.electronjs.org/docs/all#ipcmainonchannel-listener
  // ipcMain.on(channel, listener):
  //   listens to 'channel': when a new message arrives,
  //   'listener' Function (event, ...args) will be called with 'listener(event, args...)'

  ipcMain.on(`toggle_${settingsOption}`, async () => {
    const oldValue = store.get(settingsOption, null);
    const newValue = !oldValue;

    if (await activate({ newValue, oldValue, feedback: true })) {
      store.set(settingsOption, newValue);

      const action = newValue ? 'enabled' : 'disabled'
      logger.info(`[${settingsOption}] ${action}`);
    }

    // We always emit the event so any handlers for it can act upon
    // the current configuration, whether it was successfully
    // updated or not.
    ipcMain.emit('configUpdated');
  })
}
