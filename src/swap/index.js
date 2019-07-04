var Web3 = require('web3');
var BnbApiClient = require('@binance-chain/javascript-sdk');
var abi = require('ethereumjs-abi');
var BN = require('bn.js');
var validator = require('./validator');
var util = require('../util');
var { getEthRPC, getBnbRPC } = require('./rpc');
var key = require('../key');

/**
 * Option details
 * 
 * ethOpts = {
 *  network: _,
 *  token: {
 *    address: _,
 *    decimals: _
 *  },
 *  minimum: _
 * }
 * 
 * bnbOpts = {
 *  network: _,
 *  token: {
 *    denom: _,
 *    decimals: _
 *  },
 *  coinbase: {
 *    address: _,
 *    privKey: _
 *  }
 * }
 */

class Swap {
  constructor(publicSwapkey, ethOpts, bnbOpts) {
    if (!validator.validateEthOpts(ethOpts)) throw new Error('Invalid Ethereum options');
    if (!validator.validateBnbOpts(bnbOpts)) throw new Error('Invalid Binance options');

    this.publicSwapkey = publicSwapkey;
    this.ethOpts = ethOpts;
    this.bnbOpts = bnbOpts;
    this.ethOpts.token.decimals = new BN('1' + '0'.repeat(this.ethOpts.token.decimals));
    this.bnbOpts.token.decimals = new BN('1' + '0'.repeat(this.bnbOpts.token.decimals));
    this.ethOpts.minimum = new BN(this.ethOpts.minimum ? this.ethOpts.minimum : 0);
  }

  swap = (ethTxId, ethDepositKey) => {
    return new Promise((resolve, reject) => {
      if (!ethTxId) return reject('Invalid Ethereum transaction hash');
      if (!ethDepositKey || !key.validateEthDepositKey(this.publicSwapkey, ethDepositKey)) return reject('Invalid ETH deposit key');

      let providerEngine = new Web3.providers.HttpProvider(getEthRPC(this.ethOpts.network));
      let web3 = new Web3(providerEngine);
      const ethTx = web3.eth.getTransaction(ethTxId);
      // Check token transaction
      if (!ethTx.input) return reject('The transaction is not transfer transaction');
      // Check type of token
      if (ethTx.to != this.ethOpts.token.address.toLowerCase()) return reject('The transaction transfers incorrect type of token');
      // Check type of transaction
      let sig = ethTx.input.slice(0, 10);
      if (sig != '0xa9059cbb') return reject('The transaction is not transfer transaction');
      // Check deposit address
      let encode = ethTx.input.slice(10);
      let decode = abi.rawDecode(['address', 'uint256'], Buffer.from(encode, 'hex'));
      let ethAddress = util.padHex(decode[0]);
      if (ethAddress != ethDepositKey.ethAddress) return reject('The destination is not deposit address');
      // Check deposit amount
      let rawAmount = decode[1].div(this.ethOpts.token.decimals);
      if (rawAmount.lt(this.ethOpts.minimum)) return reject('Deposit amount unmets the minimum.');

      let bnbClient = new BnbApiClient(getBnbRPC(this.bnbOpts.network));
      bnbClient.chooseNetwork(this.bnbOpts.network);
      bnbClient.setPrivateKey(this.bnbOpts.coinbase.privKey).then(() => {
        return bnbClient.initChain();
      }).then(() => {
        // Check coinbase
        if (BnbApiClient.crypto.getAddressFromPrivateKey(this.bnbOpts.coinbase.privKey) != this.bnbOpts.coinbase.address) return reject('Invalid Binance coinbase');

        return bnbClient.transfer(
          this.bnbOpts.coinbase.address,
          ethDepositKey.bnbAddress,
          rawAmount.toNumber(),
          this.bnbOpts.token.denom,
          `Swap ${ethDepositKey.ethAddress} ${ethTxId}`
        );
      }).then(re => {
        return resolve(re);
      }).catch(er => {
        return reject(er);
      });
    });
  }
}

module.exports = Swap;