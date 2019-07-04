var assert = require('assert');
var key = require('../dist/key');
var Swap = require('../dist/swap');

const { bnbAddress, publicSwapKey, ethOpts, bnbOpts, depositTx } = require('./params');


describe('Swap library', function () {
  this.timeout(15000);

  describe('Test swap()', function () {
    it('Should be valid swap', function (done) {
      let swap = new Swap(publicSwapKey, ethOpts, bnbOpts);
      let ethDepositKey = key.generateEthDepositKey(publicSwapKey, bnbAddress);
      swap.swap(depositTx, ethDepositKey).then(tx => {
        return done();
      }).catch(er => {
        return done(er);
      });
    });
  });

});