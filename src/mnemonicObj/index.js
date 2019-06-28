var bip39 = require('bip39');
var ethUtil = require('ethereumjs-util');

/**
 * MnemonicObject includes mnemonic string and password
 * But, for more secure, the algorith will generates a random
 * bits for password instead of user's input.
 * Then I called password be salt
 */
var MnemonicObj = function () { }

/**
 * Generate a random MnemonicObj
 * @function generateMnemonicObjObj
 * @param - 
 */
MnemonicObj.generateMnemonicObj = function () {
  let mnemonic = bip39.generateMnemonic();
  // Using bip39 as a random generator for salt
  let salt = ethUtil.bufferToHex(ethUtil.keccak256(bip39.generateMnemonic()));
  return { mnemonic, salt };
}

/**
 * Validate mnemonic
 * @function validateMnemonicObj
 * @param mnemonicObj - Mnemonic Object
 */
MnemonicObj.validateMnemonicObj = function (mnemonicObj) {
  if (!mnemonicObj.salt) return false;
  let ok = bip39.validateMnemonic(mnemonicObj.mnemonic);
  return ok;
}

/**
 * Generate seed from MnemonicObj
 * @function MnemonicObjToSeed
 * @param mnemonicObj - Mnemonic Object
 */
MnemonicObj.mnemonicObjToSeed = function (mnemonicObj) {
  return bip39.mnemonicToSeedSync(mnemonicObj.mnemonic, mnemonicObj.salt);
}

module.exports = MnemonicObj;