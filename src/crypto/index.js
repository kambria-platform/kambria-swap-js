var cryptoJS = {
  SHA256: require("crypto-js/sha256"),
  AES: require('crypto-js/aes'),
  PBKDF2: require('crypto-js/pbkdf2'),
  enc: { Utf8: require('crypto-js/enc-utf8') },
  lib: { WordArray: require('crypto-js/lib-typedarrays') }
}

var Crypto = function () { }

Crypto.constructPassword = function (password, salt) {
  if (!password || !salt) return null;
  let passphrase = cryptoJS.PBKDF2(password, salt, { keySize: 512 / 32, iterations: 1000 });
  return passphrase.toString();
}

Crypto.hash = function (...params) {
  params = params.map(item => item.toString());
  let string = params.join();
  return cryptoJS.SHA256(string).toString();
}

Crypto.encrypt = function (plaintext, password) {
  if (!plaintext || typeof plaintext !== 'string') return new Error('Plaintext must be string');
  if (!password || typeof password !== 'string') return new Error('Password must be string');

  let salt = cryptoJS.lib.WordArray.random(128 / 8).toString();
  let passphrase = Crypto.constructPassword(password, salt);
  if (!passphrase) return new Error('Cannot contruct password');

  let ciphertext = cryptoJS.AES.encrypt(plaintext, passphrase).toString();
  let hash = Crypto.hash(ciphertext, salt);
  return { salt, ciphertext, hash }
}

Crypto.validate = function (cipherObj) {
  let { salt, ciphertext, hash } = cipherObj;
  if (!salt || !ciphertext || !hash) return false;
  let witness = Crypto.hash(ciphertext, salt);
  return witness === hash;
}

Crypto.decrypt = function (cipherObj, password) {
  let { salt, ciphertext, hash } = cipherObj;
  if (!salt || !ciphertext || !hash) return new Error('Invalid params');
  if (!Crypto.validate(cipherObj)) return new Error('Invalid signature');
  let passphrase = Crypto.constructPassword(password, salt);
  let plaintext = cryptoJS.AES.decrypt(ciphertext, passphrase);
  if (!plaintext) return new Error('Cannot decrypt ciphertext');
  try {
    plaintext = plaintext.toString(cryptoJS.enc.Utf8);
  } catch (er) {
    return new Error('Invalid password');
  }
  return plaintext;
}

module.exports = Crypto;