// https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/src/daemon/daemon.js

//const Ctl = require('ipfsd-ctl');
const i18n = require('i18next');
const { join } = require('path')
const { app } = require('electron')
//const { showDialog } = require('../dialogs')
const logger = require('../common/logger')
const { getCustomBinary } = require('../custom-ipfs-binary')
const { applyDefaults, migrateConfig, checkCorsConfig, checkPorts, configExists, rmApiFile, apiFileExists } = require('./config')

function cannotConnectDialog (addr) {
  showDialog({
    title: i18n.t('cannotConnectToApiDialog.title'),
    message: i18n.t('cannotConnectToApiDialog.message', { addr }),
    type: 'error',
    buttons: [
      i18n.t('close')
    ]
  })
}

function getIpfsBinPath () {
  return process.env.IPFS_GO_EXEC ||
    getCustomBinary() ||
    require('go-ipfs')
      .path()
      .replace('app.asar', 'app.asar.unpacked')
}

function writeIpfsBinaryPath (path) {
  const fs = require('fs-extra');
  fs.outputFileSync(
    join(app.getPath('home'), './.ipfs_base/IPFS_EXEC')
      .replace('app.asar', 'app.asar.unpacked'),
    path
  )
}

async function spawn ({ flags, path, keysize }) {
  const ipfsBin = getIpfsBinPath();
  writeIpfsBinaryPath(ipfsBin);

  // https://www.npmjs.com/package/ipfsd-ctl
  // https://github.com/ipfs/js-ipfsd-ctl#spawning-a-single-ipfs-controller-createcontroller

  const ipfsd = await Ctl.createController({
    ipfsHttpModule: require('ipfs-http-client'),
    ipfsBin,
    ipfsOptions: {
      repo: path
    },
    remote: false,
    disposable: false,
    test: false,
    args: flags
  })

  if (configExists(ipfsd)) {
    migrateConfig(ipfsd);
    checkCorsConfig(ipfsd);
    return { ipfsd, isRemote: false };
  }

  // If config does not exist, but $IPFS_PATH/api exists, then
  // it is a remote repository.
  if (apiFileExists(ipfsd)) {
    return { ipfsd, isRemote: true }
  }

  await ipfsd.init();

  applyDefaults(ipfsd);
  return { ipfsd, isRemote: false };
}

module.exports = async function (opts) {
  const { ipfsd, isRemote } = await spawn(opts);
  if (!isRemote) {
    await checkPorts(ipfsd);
  }

  try {
    await ipfsd.start();
    const { id } = await ipfsd.api.id();
    logger.info(`[daemon] PeerID is ${id}`);
    logger.info(`[daemon] Repo is at ${ipfsd.path}`);
  } catch (err) {
      if (!err.message.includes('ECONNREFUSED')) {
        throw err;
      }

      if (!configExists(ipfsd)) {
        cannotConnectDialog(ipfsd.apiAddr);
        throw err;
      }

      logger.info('[daemon] removing api file');
      rmApiFile(ipfsd);
      await ipfsd.start();
  }
  return ipfsd;
}
