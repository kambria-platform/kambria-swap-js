var assert = require('assert');
var ethUtil = require('ethereumjs-util');
var swap = require('../index.js');

describe('Swap library', function () {

  describe('Test validateSecureDepositNode()', function () {
    it(`Valid deposit node`, function () {
      // Private config
      let mnemonic = swap.generateMnemonic();
      let passwork = swap.generateMnemonic(); // We can use mnemonic as random passwords
      // Public config
      let organization = 'Kambria';
      let network = '4';
      let rootPath = swap.generateRootPath(network, organization);
      let secureRoot = swap.generateSecureRootNode(mnemonic, passwork, rootPath);
      // User functions
      let bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns2';
      let secureNode = swap.generateSecureDepositNode(secureRoot, bnbAddress);

      assert.equal(swap.validateSecureDepositNode(secureRoot, secureNode), true, 'Fail correctness');
    });

    it(`Invalid deposit node`, function () {
      // Private config
      let mnemonic = swap.generateMnemonic();;
      let passwork = swap.generateMnemonic();; // We can use mnemonic as random passwords
      // Public config
      let organization = 'Kambria';
      let network = '4';
      let rootPath = swap.generateRootPath(network, organization);
      let secureRoot = swap.generateSecureRootNode(mnemonic, passwork, rootPath);
      // User functions
      let bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns2';
      let secureNode = swap.generateSecureDepositNode(secureRoot, bnbAddress);
      secureNode.bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns3'; // Try to incorrect the deposit node

      assert.equal(swap.validateSecureDepositNode(secureRoot, secureNode), false, 'Fail soundness');
    });
  });

  describe('Test generateSecureDepositNode() and generateDepositNode()', function () {
    it(`Compare addresses`, function () {
      // Private config
      let mnemonic = swap.generateMnemonic();
      let passwork = swap.generateMnemonic(); // We can use mnemonic as random passwords
      // Public config
      let organization = 'Kambria';
      let network = '4';
      let rootPath = swap.generateRootPath(network, organization);
      let secureRoot = swap.generateSecureRootNode(mnemonic, passwork, rootPath);
      // User functions
      let bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns2';
      let secureNode = swap.generateSecureDepositNode(secureRoot, bnbAddress);
      let secureAddress = secureNode.ethAddress;
      // Test
      let unsecureRoot = swap.generateRootNode(mnemonic, passwork, rootPath);
      let unsecureNode = swap.generateDepositNode(unsecureRoot, bnbAddress);
      let unsecureAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(unsecureNode.publicKey, true));

      assert.equal(secureAddress, unsecureAddress, 'Not deterministic generation');
    });
  });

});