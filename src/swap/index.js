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
 *  network: <number>,
 *  token: {
 *    address: <string>,
 *    decimals: <number>
 *  },
 *  confirmation: <number>
 *  minimum: <number>
 * }
 * 
 * bnbOpts = {
 *  network: <string>,
 *  token: {
 *    denom: <string>,
 *    decimals: <number>
 *  },
 *  coinbase: {
 *    address: <string>,
 *    privKey: <string>
 *  },
 *  interest: {
 *    type: <string>,
 *    value: <number>
 *  }
 * }
 */

class Swap {
  constructor(publicSwapKey, ethOpts, bnbOpts) {
    if (!bnbOpts.interest) bnbOpts.interest = { type: 'fixed', value: 0 }
    if (!validator.validateEthOpts(ethOpts)) throw new Error('Invalid Ethereum options');
    if (!validator.validateBnbOpts(bnbOpts)) throw new Error('Invalid Binance options');

    this.publicSwapKey = JSON.parse(JSON.stringify(publicSwapKey));
    this.ethOpts = JSON.parse(JSON.stringify(ethOpts));
    this.bnbOpts = JSON.parse(JSON.stringify(bnbOpts));
    this.ethOpts.token.decimals = new BN('1' + '0'.repeat(ethOpts.token.decimals));
    this.bnbOpts.token.decimals = new BN('1' + '0'.repeat(bnbOpts.token.decimals));
    this.ethOpts.minimum = new BN(ethOpts.minimum ? ethOpts.minimum : 0);

    if (this.publicSwapKey.network != this.ethOpts.network) throw new Error('Different netowrks between Public swap key and ETH options');
    if (this.ethOpts.network == 1 && this.bnbOpts.network != 'mainnet') throw new Error('Cannot pair mainnet and testnet');
    if (this.ethOpts.network != 1 && this.bnbOpts.network == 'mainnet') throw new Error('Cannot pair mainnet and testnet');

    // Temp storage
    this.bnbClient = null;
  }

  getBnbClient = () => {
    return new Promise((resolve, reject) => {
      if (this.bnbClient) return resolve(this.bnbClient);
      let bnbClient = new BnbApiClient(getBnbRPC(this.bnbOpts.network));
      bnbClient.chooseNetwork(this.bnbOpts.network);
      bnbClient.setPrivateKey(this.bnbOpts.coinbase.privKey).then(() => {
        return bnbClient.initChain();
      }).then(() => {
        this.bnbClient = { api: bnbClient, core: BnbApiClient };
        return resolve(this.bnbClient);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  swap = (ethTxId, ethDepositKey) => {
    return new Promise((resolve, reject) => {
      if (!ethTxId) return reject('Invalid Ethereum transaction hash');
      if (!ethDepositKey || !key.validateEthDepositKey(this.publicSwapKey, ethDepositKey)) return reject('Invalid ETH deposit key');

      let providerEngine = new Web3.providers.HttpProvider(getEthRPC(this.ethOpts.network));
      let web3 = new Web3(providerEngine);
      const ethTx = web3.eth.getTransaction(ethTxId);
      const ethTxReceipt = web3.eth.getTransactionReceipt(ethTxId);
      const currentBlockNumner = web3.eth.blockNumber;

      // Check status
      if (!ethTxReceipt || !ethTxReceipt.status) return reject('The transaction is not confirmed');
      if (ethTxReceipt.status != '0x1') return reject('The transaction is reverted');
      // Check type of transaction
      if (!ethTx) return reject('The transaction is not confirmed');
      if (!ethTx.input) return reject('The transaction is not transfer transaction');
      // Check type of token
      if (ethTx.to != this.ethOpts.token.address.toLowerCase()) return reject('The transaction transfers incorrect type of token');
      // Check type of called function
      let sig = ethTx.input.slice(0, 10);
      if (sig != '0xa9059cbb') return reject('The transaction is not transfer transaction');
      // Check confimation
      let confirmedBlockNumber = ethTx.blockNumber;
      if (currentBlockNumner - confirmedBlockNumber < this.ethOpts.confirmation) return reject('The transaction is not confirmed enough');
      // Check deposit address
      let encode = ethTx.input.slice(10);
      let decode = abi.rawDecode(['address', 'uint256'], Buffer.from(encode, 'hex'));
      let ethAddress = util.padHex(decode[0]);
      if (ethAddress != ethDepositKey.ethAddress) return reject('The destination is not deposit address');
      // Check deposit amount
      let rawAmount = decode[1].div(this.ethOpts.token.decimals);
      if (rawAmount.lt(this.ethOpts.minimum)) return reject('Deposit amount unmets the minimum.');
      // Calculate interest amount
      let bonusAmount = 0;
      if (this.bnbOpts.interest.type == 'fixed') {
        bonusAmount = new BN(this.bnbOpts.interest.value);
      }
      else if (this.bnbOpts.interest.type == 'dynamic') {
        bonusAmount = rawAmount.mul(new BN(this.bnbOpts.interest.value)).div(new BN(100));
      }
      else bonusAmount = new BN(0);

      this.getBnbClient().then((bnbClient) => {
        // Check coinbase
        let prefix = 'bnb';
        if (this.publicSwapKey.network !== 1) prefix = 'tbnb';
        if (bnbClient.core.crypto.getAddressFromPrivateKey(this.bnbOpts.coinbase.privKey, prefix) != this.bnbOpts.coinbase.address) return reject('Invalid Binance coinbase');

        if (!bonusAmount || bonusAmount.isZero()) return bnbClient.api.transfer(
          this.bnbOpts.coinbase.address,
          ethDepositKey.bnbAddress,
          rawAmount.toNumber(),
          this.bnbOpts.token.denom,
          `Swap ${ethDepositKey.ethAddress} ${ethTxId}`
        );

        return bnbClient.api.multiSend(
          this.bnbOpts.coinbase.address,
          [
            {
              to: ethDepositKey.bnbAddress,
              coins: [{ denom: 'KATT1-C26', amount: rawAmount.toNumber() }]
            },
            {
              to: ethDepositKey.bnbAddress,
              coins: [{ denom: 'KATT1-C26', amount: bonusAmount.toNumber() }]
            }
          ],
          `Swap ${ethDepositKey.ethAddress} ${ethTxId}`
        )
      }).then(re => {
        return resolve({
          ethTx: {
            hash: ethTxId,
            from: ethTx.from,
            to: ethAddress,
            amount: decode[1]
          },
          bnbTx: {
            hash: re.result[0].hash.toLowerCase(),
            from: this.bnbOpts.coinbase.address,
            to: ethDepositKey.bnbAddress,
            amount: rawAmount.mul(this.bnbOpts.token.decimals),
            interest: bonusAmount.mul(this.bnbOpts.token.decimals)
          }
        });
      }).catch(er => {
        return reject(er);
      });
    });
  }
}

module.exports = Swap;