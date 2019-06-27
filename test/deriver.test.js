var assert = require('assert');
var ethUtil = require('ethereumjs-util');
var Mnemonic = require('../dist/mnemonic');
var Deriver = require('../dist/deriver');

const { organization, network, bnbAddress, passwork } = require('./params');


describe('Deriver library', function () {

  describe('Test validateSecureDepositNode()', function () {
    it(`Should be a valid deposit node`, function () {
      // Private config
      let mnemonic = Mnemonic.generateMnemonic();
      // Public config
      let rootPath = Deriver.generateRootPath(network, organization);
      let secureRoot = Deriver.generateSecureRootNode(mnemonic, passwork, rootPath);
      // User functions
      let secureNode = Deriver.generateSecureDepositNode(secureRoot, bnbAddress);

      assert.strictEqual(Deriver.validateSecureDepositNode(secureRoot, secureNode), true, 'Fail correctness');
    });

    it(`Should be an invalid deposit node`, function () {
      // Private config
      let mnemonic = Mnemonic.generateMnemonic();;
      // Public config
      let rootPath = Deriver.generateRootPath(network, organization);
      let secureRoot = Deriver.generateSecureRootNode(mnemonic, passwork, rootPath);
      // User functions
      let secureNode = Deriver.generateSecureDepositNode(secureRoot, bnbAddress);
      secureNode.bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns3'; // Try to incorrect the deposit node

      assert.strictEqual(Deriver.validateSecureDepositNode(secureRoot, secureNode), false, 'Fail soundness');
    });
  });

  describe('Test generateSecureDepositNode() and generateDepositNode()', function () {
    it(`Should be the same addresses`, function () {
      // Private config
      let mnemonic = Mnemonic.generateMnemonic();
      // Public config
      let rootPath = Deriver.generateRootPath(network, organization);
      let secureRoot = Deriver.generateSecureRootNode(mnemonic, passwork, rootPath);
      // User functions
      let secureNode = Deriver.generateSecureDepositNode(secureRoot, bnbAddress);
      let secureAddress = secureNode.ethAddress;
      // Test
      let unsecureRoot = Deriver.generateRootNode(mnemonic, passwork, rootPath);
      let unsecureNode = Deriver.generateDepositNode(unsecureRoot, bnbAddress);
      let unsecureAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(unsecureNode.publicKey, true));

      assert.strictEqual(secureAddress, unsecureAddress, 'Not deterministic generation');
    });
  });

});