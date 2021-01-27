const { app, shell, Notification } = require('electron');
const i18n = require('i18next')

function notify (options, onClick) {
  const not = new Notification(options);

  if (onClick) {
    not.on('click', onClick);
  }
  not.show();
}

// https://www.electronjs.org/docs/api/shell

function notifyError ({ title, body = '' }) {
  notify({
    title,
    body: `${body} ${i18n.t('clickToOpenLogs')}`.trim()
  }, () => {
    // https://www.electronjs.org/docs/api/shell#shellopenpathpath
    shell.openPath(app.getPath('userData'));
  })
}

module.exports = Object.freeze({
  notify,
  notifyError
})
