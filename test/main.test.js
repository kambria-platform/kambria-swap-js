var assert = require('assert');
var util = require('../dist/util');
var Mnemonic = require('../dist/mnemonic');
var swap = require('../index.js');

const { organization, network, bnbAddress, passwork } = require('./params');


describe('Main source (Swap library)', function () {

  describe('Test generateSwapKey()', function () {
    it('Should be valid mnemonic', function () {
      let isTwoWaySwap = true;
      let SwapKey = swap.generateSwapKey(network, organization, passwork, isTwoWaySwap);
      let mnemonic = SwapKey.PrivateSwapKey.mnemonic;

      assert.strictEqual(Mnemonic.validateMnemonic(mnemonic), true, 'Invalid swap key');
    });

    it('Should be invalid (empty) mnemonic', function () {
      let isTwoWaySwap = false;
      let SwapKey = swap.generateSwapKey(network, organization, passwork, isTwoWaySwap);
      let mnemonic = SwapKey.PrivateSwapKey.mnemonic;

      assert.equal(mnemonic, null, 'Invalid swap key');
      assert.strictEqual(Mnemonic.validateMnemonic(mnemonic), false, 'Invalid swap key');
    });
  });

  describe('Test privateSwapKeyToSwapKey()', function () {
    it('Should be valid swap key', function () {
      let isTwoWaySwap = true;
      let SwapKey = swap.generateSwapKey(network, organization, passwork, isTwoWaySwap);
      let PrivateSwapKey = SwapKey.PrivateSwapKey;
      let newSwapKey = swap.privateSwapKeyToSwapKey(PrivateSwapKey, passwork);
      assert.deepEqual(SwapKey, newSwapKey, 'Invalid swap key');
    });
  });

  describe('Test generateEthDepositKey()', function () {
    it('Should be a valid deposit key', function () {
      let isTwoWaySwap = false;
      let SwapKey = swap.generateSwapKey(network, organization, passwork, isTwoWaySwap);
      let PublicSwapKey = SwapKey.PublicSwapKey;
      let ethDepositKey = swap.generateEthDepositKey(PublicSwapKey, bnbAddress);

      assert.strictEqual(util.isValidEthAddress(ethDepositKey.ethAddress), true, 'Invalid Swap key');
      assert.strictEqual(util.isValidBnbAddress(ethDepositKey.bnbAddress), true, 'Invalid Swap key');
      assert.strictEqual(swap.validateEthDepositKey(PublicSwapKey, ethDepositKey), true, 'Invalid Swap key');
    });

    it('Should be an invalid deposit key', function () {
      let isTwoWaySwap = false;
      let SwapKey = swap.generateSwapKey(network, organization, passwork, isTwoWaySwap);
      let PublicSwapKey = SwapKey.PublicSwapKey;
      let ethDepositKey = swap.generateEthDepositKey(PublicSwapKey, bnbAddress);
      ethDepositKey.bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns3'; // Try to incorrect the deposit node

      assert.strictEqual(swap.validateEthDepositKey(PublicSwapKey, ethDepositKey), false, 'Invalid Swap key');
    });
  });

});