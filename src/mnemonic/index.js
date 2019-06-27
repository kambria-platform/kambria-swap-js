var bip39 = require('bip39');

var Mnemonic = function () { }

/**
 * Generate a random Mnemonic
 * @function generateMnemonic
 * @param - 
 */
Mnemonic.generateMnemonic = function () {
  let mnemonic = bip39.generateMnemonic();
  return mnemonic;
}

/**
 * Validate mnemonic
 * @function validateMnemonic
 * @param mnemonic - Mnemonic
 */
Mnemonic.validateMnemonic = function (mnemonic) {
  let ok = bip39.validateMnemonic(mnemonic);
  return ok;
}

/**
 * Generate seed from mnemonic and password
 * @function mnemonicToSeed
 * @param mnemonic - Mnemonic
 * @param password - Password
 */
Mnemonic.mnemonicToSeed = function (mnemonic, passwork) {
  return bip39.mnemonicToSeedSync(mnemonic, passwork);
}

module.exports = Mnemonic;