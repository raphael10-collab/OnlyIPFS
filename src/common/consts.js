// https://github.com/ipfs-shipyard/ipfs-desktop/blob/master/src/common/consts.js


const os = require('os')
const packageJson = require('../../package.json')

module.exports = Object.freeze({
  IS_MAC: os.platform() === 'darwin',
  IS_WIN: os.platform() === 'win32',
  VERSION: packageJson.version,
  ELECTRON_VERSION: packageJson.dependencies.electron,
  GO_IPFS_VERSION: packageJson.dependencies['go-ipfs'],
})
