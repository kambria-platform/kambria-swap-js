var BN = require('bn.js');
var HDKey = require('hdkey');
var ethUtil = require('ethereumjs-util');

var Util = function () { }

Util.unpadHex = function (hex) {
  if (!hex) return null;
  if (Buffer.isBuffer(hex)) hex = hex.toString('hex');
  if (typeof hex !== 'string') return null;

  var pattern = /(^0x)/gi;
  if (pattern.test(hex)) {
    return hex.replace('0x', '');
  } else {
    return hex;
  }
}

Util.stringToPath = function (organization) {
  let int = new BN(ethUtil.keccak256(organization)).toString(10).split('');
  return Util.intToPath(int);
}

Util.intToPath = function (int) {
  let organizationPath = '';
  while (int.length) {
    let re = '';
    for (let i = 0; i < 8; i++) {
      let item = int.shift();
      if (!item) item = '0';
      re = re + item;
    }
    organizationPath = organizationPath + '/' + re;
  }
  return organizationPath;
}

Util.addDPath = function (dpath, index) {
  if (!dpath || typeof dpath !== 'string') return null;
  dpath = dpath.trim();
  index = index || 0;
  index = index.toString();
  index = index.trim();

  let nake = function (s) {
    let _s = s.split('');
    while (_s[0] === 'm') _s.shift();
    while (_s[0] === '/') _s.shift();
    while (_s[_s.length - 1] === '/') _s.pop();
    s = _s.join('');
    return s;
  }

  if (!nake(dpath)) return 'm/' + nake(index);
  if (!nake(index)) return 'm/' + nake(dpath);
  return 'm/' + nake(dpath) + '/' + nake(index);
}

Util.deriveChild = function (publicKey, chainCode, dpath) {
  if (!Buffer.isBuffer(publicKey))
    publicKey = Buffer.from(Util.unpadHex(publicKey), 'hex');
  if (!Buffer.isBuffer(chainCode))
    chainCode = Buffer.from(Util.unpadHex(chainCode), 'hex');

  let hdKey = new HDKey();
  hdKey.publicKey = publicKey;
  hdKey.chainCode = chainCode;
  let child = hdKey.derive(Util.addDPath('m/', dpath));
  return child;
}

module.exports = Util;