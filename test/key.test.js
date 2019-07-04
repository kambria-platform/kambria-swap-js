var assert = require('assert');
var util = require('../dist/util');
var Crypto = require('../dist/crypto');
var key = require('../dist/key');

const { organization, network, bnbAddress, password } = require('./params');


describe('Key library', function () {

  describe('Test generateSwapKey()', function () {
    it('Should be valid private swap key', function () {
      let isTwoWaySwap = true;
      let SwapKey = key.generateSwapKey(network, organization, password, isTwoWaySwap);

      assert.strictEqual(Crypto.validate(SwapKey.EncryptedPrivateSwapKey), true, 'Invalid swap key');
    });

    it('Should be emppty private swap key', function () {
      let isTwoWaySwap = false;
      let SwapKey = key.generateSwapKey(network, organization, password, isTwoWaySwap);

      assert.equal(SwapKey.EncryptedPrivateSwapKey, null, 'Invalid swap key');
    });
  });

  describe('Test encryptedPrivateSwapKeyToSwapKey()', function () {
    it('Should be valid swap key', function () {
      let isTwoWaySwap = true;
      let SwapKey = key.generateSwapKey(network, organization, password, isTwoWaySwap);
      let newSwapKey = key.encryptedPrivateSwapKeyToSwapKey(SwapKey.EncryptedPrivateSwapKey, password);
      assert.deepEqual(SwapKey, newSwapKey, 'Invalid swap key');
    });
  });

  describe('Test generateEthDepositKey()', function () {
    it('Should be a valid deposit key', function () {
      let isTwoWaySwap = false;
      let SwapKey = key.generateSwapKey(network, organization, password, isTwoWaySwap);
      let PublicSwapKey = SwapKey.PublicSwapKey;
      let ethDepositKey = key.generateEthDepositKey(PublicSwapKey, bnbAddress);

      assert.strictEqual(util.isValidEthAddress(ethDepositKey.ethAddress), true, 'Invalid Swap key');
      assert.strictEqual(util.isValidBnbAddress(ethDepositKey.bnbAddress), true, 'Invalid Swap key');
      assert.strictEqual(key.validateEthDepositKey(PublicSwapKey, ethDepositKey), true, 'Invalid Swap key');
    });

    it('Should be an invalid deposit key', function () {
      let isTwoWaySwap = false;
      let SwapKey = key.generateSwapKey(network, organization, password, isTwoWaySwap);
      let PublicSwapKey = SwapKey.PublicSwapKey;
      let ethDepositKey = key.generateEthDepositKey(PublicSwapKey, bnbAddress);
      ethDepositKey.bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns3'; // Try to incorrect the deposit node

      assert.strictEqual(key.validateEthDepositKey(PublicSwapKey, ethDepositKey), false, 'Invalid Swap key');
    });
  });

});