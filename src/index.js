var Mnemonic = require('./mnemonic');
var Deriver = require('./deriver');
var util = require('./util');

var Swap = function () { }

/**
 * Generate Private Swap Key
 * Please keep generate and keep it privately
 * @function generatePrivteSwapKey
 * @param network - Ethereum network id
 * @param organization - Organization name
 * @param passwork - (Optional) password
 * @param isTwoWaySwap - Enable swap in 2 ways (ERC20 -> BEP2 and BEP2 -> ERC20)
 */
Swap.generateSwapKey = function (network, organization, passwork, isTwoWaySwap) {
  if (!parseInt(network)) throw new Error('Network should be a number');
  if (!organization || typeof organization !== 'string') throw new Error('Organization should be a string');
  if (passwork && typeof passwork !== 'string') throw new Error('Organization should be a string or empty');

  let mnemonic = Mnemonic.generateMnemonic();
  let rootPath = Deriver.generateRootPath(network, organization);

  let PrivateSwapKey = null;
  if (isTwoWaySwap) {
    PrivateSwapKey = {
      mnemonic: mnemonic,
      network: network,
      organization: organization,
      isTwoWaySwap: true
    }
  } else {
    PrivateSwapKey = {
      network: network,
      organization: organization,
      isTwoWaySwap: false
    }
  }
  let PublicSwapKey = Deriver.generateSecureRootNode(mnemonic, passwork, rootPath);
  return { PrivateSwapKey, PublicSwapKey }
}

/**
 * Generate swap key from private swap key
 * @function privateSwapKeyToSwapKey
 * @param privateSwapKey - Public swap key
 */
Swap.privateSwapKeyToSwapKey = function (privateSwapKey, passwork) {
  if (!privateSwapKey) throw new Error('Invalid private swap key');
  if (typeof privateSwapKey !== 'object') try {
    privateSwapKey = JSON.parse(privateSwapKey);
  } catch (er) { if (er) throw new Error('Invalid private swap key'); }

  let { mnemonic, network, organization, isTwoWaySwap } = privateSwapKey;
  if (!parseInt(network)) throw new Error('Invalid private swap key');
  if (!organization || typeof organization !== 'string') throw new Error('Invalid private swap key');
  if (passwork && typeof passwork !== 'string') throw new Error('Invalid private swap key');
  if (mnemonic && !isTwoWaySwap) throw new Error('Invalid private swap key');
  if (!mnemonic && isTwoWaySwap) throw new Error('Invalid private swap key');

  let rootPath = Deriver.generateRootPath(network, organization);
  let PublicSwapKey = Deriver.generateSecureRootNode(mnemonic, passwork, rootPath);
  return { PrivateSwapKey: privateSwapKey, PublicSwapKey }
}

/**
 * Generate ETH deposit key by BNB address user provided
 * @function generateEthDepositKey
 * @param publicSwapKey - Public swap key
 * @param bnbAddr - BNB address
 */
Swap.generateEthDepositKey = function (publicSwapKey, bnbAddr) {
  if (!publicSwapKey || typeof publicSwapKey !== 'object') throw new Error('Invalid public swap key');
  if (!publicSwapKey.publicKey || !publicSwapKey.chainCode) throw new Error('Invalid public swap key');
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
  if (!publicSwapKey || typeof publicSwapKey !== 'object') throw new Error('Invalid public swap key');
  if (!ethDepositKey || typeof ethDepositKey !== 'object') throw new Error('Invalid eth deposit key');

  return Deriver.validateSecureDepositNode(publicSwapKey, ethDepositKey);
}

module.exports = Swap;