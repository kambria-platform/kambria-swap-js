var MnemonicObj = require('./mnemonicObj');
var Crypto = require('./crypto');
var Deriver = require('./deriver');
var util = require('./util');

var Swap = function () { }

/**
 * Generate Private Swap Key
 * Please keep generate and keep it privately
 * @function generatePrivteSwapKey
 * @param network - Ethereum network id
 * @param organization - Organization name
 * @param password - Password required in 2-ways swap
 * @param isTwoWaySwap - Enable swap in 2-ways (ERC20 -> BEP2 and BEP2 -> ERC20)
 */
Swap.generateSwapKey = function (network, organization, password, isTwoWaySwap) {
  if (!parseInt(network)) throw new Error('Network should be a number');
  if (!organization || typeof organization !== 'string') throw new Error('Organization should be a string');

  isTwoWaySwap = Boolean(isTwoWaySwap);
  if (isTwoWaySwap && (!password || typeof password !== 'string')) throw new Error('Password required');

  let mnemonicObj = MnemonicObj.generateMnemonicObj();
  let rootPath = Deriver.generateRootPath(network, organization);

  let common = { network, organization, isTwoWaySwap }
  // Public swap key
  let root = Deriver.generateSecureRootNode(mnemonicObj, rootPath);
  let PublicSwapKey = { ...root, ...common };
  // Private swap key
  let PrivateSwapKey = null;
  if (isTwoWaySwap) PrivateSwapKey = { mnemonicObj, ...common }
  // Encrypted private swap key
  let EncryptedPrivateSwapKey = null;
  if (PrivateSwapKey) EncryptedPrivateSwapKey = Crypto.encrypt(JSON.stringify(PrivateSwapKey), password);

  return { EncryptedPrivateSwapKey, PublicSwapKey }
}

/**
 * Generate swap key from private swap key
 * @function encryptedPrivateSwapKeyToSwapKey
 * @param encryptedPrivateSwapKey - Encrypted private swap key
 * @param password - Password
 */
Swap.encryptedPrivateSwapKeyToSwapKey = function (encryptedPrivateSwapKey, password) {
  if (!encryptedPrivateSwapKey) throw new Error('Invalid encrypted private swap key');
  if (typeof encryptedPrivateSwapKey !== 'object') try {
    encryptedPrivateSwapKey = JSON.parse(encryptedPrivateSwapKey);
  } catch (er) { if (er) throw new Error('Invalid encrypted private swap key'); }

  let privateSwapKey = Crypto.decrypt(encryptedPrivateSwapKey, password);
  if (!privateSwapKey) throw new Error('Invalid encrypted private swap key');
  if (typeof privateSwapKey !== 'object') try {
    privateSwapKey = JSON.parse(privateSwapKey);
  } catch (er) { if (er) throw new Error('Invalid private swap key'); }

  let { mnemonicObj, network, organization, isTwoWaySwap } = privateSwapKey;
  if (!parseInt(network)) throw new Error('Invalid private swap key');
  if (!organization || typeof organization !== 'string') throw new Error('Invalid private swap key');
  if (!isTwoWaySwap || typeof isTwoWaySwap !== 'boolean') throw new Error('Invalid private swap key');
  if (!mnemonicObj || typeof mnemonicObj !== 'object') throw new Error('Invalid private swap key');
  if (!mnemonicObj.mnemonic || typeof mnemonicObj.mnemonic !== 'string') throw new Error('Invalid private swap key');
  if (!mnemonicObj.salt || typeof mnemonicObj.salt !== 'string') throw new Error('Invalid private swap key');

  let common = { network, organization, isTwoWaySwap }
  let rootPath = Deriver.generateRootPath(network, organization);
  let root = Deriver.generateSecureRootNode(mnemonicObj, rootPath);
  let PublicSwapKey = { ...root, ...common };
  return { EncryptedPrivateSwapKey: encryptedPrivateSwapKey, PublicSwapKey }
}

/**
 * Generate ETH deposit key by BNB address user provided
 * @function generateEthDepositKey
 * @param publicSwapKey - Public swap key
 * @param bnbAddr - BNB address
 */
Swap.generateEthDepositKey = function (publicSwapKey, bnbAddr) {
  if (!publicSwapKey) throw new Error('Invalid public swap key');
  if (typeof publicSwapKey !== 'object') try {
    publicSwapKey = JSON.parse(publicSwapKey);
  } catch (er) { if (er) throw new Error('Invalid public swap key'); }

  let { publicKey, chainCode } = publicSwapKey;
  if (!publicKey || typeof publicKey !== 'string') throw new Error('Invalid public swap key');
  if (!chainCode || typeof chainCode !== 'string') throw new Error('Invalid public swap key');
  if (!util.isValidBnbAddress(bnbAddr)) throw new Error('Invalid BNB address');

  return Deriver.generateSecureDepositNode(publicSwapKey, bnbAddr);
}

/**
 * Validate ETH deposit key
 * @function validateEthDepositKey
 * @param publicSwapKey - Public swap key
 * @param bnbAddr - BNB address
 */
Swap.validateEthDepositKey = function (publicSwapKey, ethDepositKey) {
  if (!publicSwapKey) return false;
  if (typeof publicSwapKey !== 'object') try {
    publicSwapKey = JSON.parse(publicSwapKey);
  } catch (er) { if (er) return false; }

  let { publicKey, chainCode } = publicSwapKey;
  if (!publicKey || typeof publicKey !== 'string') return false;
  if (!chainCode || typeof chainCode !== 'string') return false;

  if (!ethDepositKey) return false;
  if (typeof ethDepositKey !== 'object') try {
    ethDepositKey = JSON.parse(ethDepositKey);
  } catch (er) { if (er) return false; }

  let { ethAddress, bnbAddress } = ethDepositKey;
  if (!ethAddress || typeof ethAddress !== 'string') return false;
  if (!bnbAddress || typeof bnbAddress !== 'string') return false;

  return Deriver.validateSecureDepositNode(publicSwapKey, ethDepositKey);
}

module.exports = Swap;