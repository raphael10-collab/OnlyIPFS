// https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/src/utils/dock.js

const { app, BrowserWindow } = require('electron');

function show () {
  // https://www.electronjs.org/docs/all#appdock-macos-readonly
  if (app.dock) {
    app.dock.show();
  }
}

function hide () {
  if (!app.dock) {
    return;
  }

  // https://www.electronjs.org/docs/all#browserwindowgetallwindows

  const count = BrowserWindow.getAllWindows()
    .filter(w => w.isVisible())
    .length

  if (count <= 0) {
    app.dock.hide()
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze

module.exports = Object.freeze({
  show,
  hide,
  run: async (fn) => {
    show()
    const res = await fn()
    hide()
    return res
  },
  runSync: (fn) => {
    show()
    const res = fn()
    hide()
    return res
  }
})
