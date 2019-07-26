var { Key, Swap } = require('../index.js');

const { bnbAddress, publicSwapKey, ethOpts, bnbOpts, depositTx } = require('./params');


describe('Swap library', function () {
  this.timeout(15000);

  describe('Test swap()', function () {
    it('Should be valid swap', function (done) {
      let swap = new Swap(publicSwapKey, ethOpts, bnbOpts);
      let ethDepositKey = Key.generateEthDepositKey(publicSwapKey, bnbAddress);
      swap.swap(depositTx, ethDepositKey).then(re => {
        return done();
      }).catch(er => {
        return done(er);
      });
    });
  });

});