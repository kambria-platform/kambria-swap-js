var Web3 = require('web3');
var web3 = new Web3();
var { getEthRPC, getBnbRPC } = require('./rpc');


var Validator = function () { }

Validator.validateEthOpts = (ethOpts) => {
  // General check
  if (!ethOpts) return false;
  // Network check
  if (!ethOpts.network) return false;
  if (!getEthRPC(ethOpts.network)) return false;
  // Token check
  if (!ethOpts.token) return false;
  if (!ethOpts.token.address || !web3.isAddress(ethOpts.token.address)) return false;
  if (!ethOpts.token.decimals) return false;
  // Valid
  return true;
}

Validator.validateBnbOpts = (bnbOpts) => {
  // General check
  if (!bnbOpts) return false;
  // Network check
  if (!bnbOpts.network) return false;
  if (!getBnbRPC(bnbOpts.network)) return false;
  // Token check
  if (!bnbOpts.token) return false;
  if (!bnbOpts.token.denom) return false;
  if (!bnbOpts.token.decimals) return false;
  // Coinbase check
  if (!bnbOpts.coinbase) return false;
  if (!bnbOpts.coinbase.address) return false;
  if (!bnbOpts.coinbase.privKey) return false;
  // Valid
  return true;
}

module.exports = Validator;