var bip39 = require('bip39');
var hdkey = require('hdkey');
var ethUtil = require('ethereumjs-util');
var util = require('./util');

const _default = require('./const');

var Swap = function () { }

Swap.generateMnemonic = function () {
  let mnemonic = bip39.generateMnemonic();
  return mnemonic;
}

Swap.generateRootPath = function (networkId, orgnazationName) {
  // Full path: m/<base>/<net>/<org>/<bnbAddressPath>
  let organization = util.stringToPath(orgnazationName);
  let path = {
    base: _default.ETH_DERIVATION_PATH,
    net: networkId,
    org: organization,
    concat: function (extraPath) {
      let dpath = util.addDPath(util.addDPath(this.base, this.net), this.org);
      if (extraPath) dpath = util.addDPath(dpath, extraPath);
      return dpath;
    }
  }
  return path;
}

Swap.generateRootNode = function (mnemonic, passwork, rootPath) {
  let seed = bip39.mnemonicToSeedSync(mnemonic, passwork);
  let master = hdkey.fromMasterSeed(seed);
  if (typeof rootPath === 'object') rootPath = rootPath.concat();
  let root = master.derive(rootPath);
  return root;
}

Swap.generateDepositAddress = function (publicKey, chainCode, bnbAddress) {
  let bnbAddressPath = util.stringToPath(bnbAddress);
  let child = util.deriveChild(publicKey, chainCode, bnbAddressPath);
  let address = ethUtil.bufferToHex(ethUtil.pubToAddress(child.publicKey, true));
  return {
    bnbAddress: bnbAddress,
    dpath: bnbAddressPath,
    ethAddress: address
  }
}

Swap.generateDepositNode = function (root, bnbAddress) {
  let dpath = util.stringToPath(bnbAddress);
  let child = root.derive(util.addDPath('m/', dpath));
  return child;
}

module.exports = Swap;