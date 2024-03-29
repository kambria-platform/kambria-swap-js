var assert = require('assert');
var Crypto = require('../dist/crypto');

const params = require('./params');
const { password } = params;


describe('Crypto library', function () {

  describe('Test encrypt() and decrypt', function () {
    it(`Should be a valid process`, function () {


      let cipherObj = Crypto.encrypt(JSON.stringify(params), password);
      let plaintext = JSON.parse(Crypto.decrypt(cipherObj, password));

      assert.deepStrictEqual(params, plaintext, 'Fail correctness');
    });

    it(`Should be an invalid process`, function () {


      let cipherObj = Crypto.encrypt(JSON.stringify(params), password);
      let plaintext = Crypto.decrypt(cipherObj, 'wrong@password');

      assert.deepStrictEqual(plaintext instanceof Error, true, 'Fail correctness');
    });

  });
});