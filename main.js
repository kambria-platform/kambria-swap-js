var ethUtil = require('ethereumjs-util');
var swap = require('./src');

// Private config
let mnemonic = "audit talk shuffle possible wedding arrive scout physical maple above game print";
let passwork = "kambria";

// Public config
let organization = 'Kambria';
let network = '4';
let rootPath = swap.generateRootPath(network, organization);
let root = swap.generateRootNode(mnemonic, passwork, rootPath);
let rootPublicKey = ethUtil.bufferToHex(root.publicKey);
let rootChainCode = ethUtil.bufferToHex(root.chainCode);

// User functions
let bnbAddress = 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns2';
let address = swap.generateDepositAddress(rootPublicKey, rootChainCode, bnbAddress);
// Test
let testChild = swap.generateDepositNode(root, bnbAddress);
let testChildAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(testChild.publicKey, true));

console.log("Root derivation path:", rootPath.concat());
console.log("Root public key:", rootPublicKey);
console.log("Root chain code:", rootChainCode);
console.log("=================");
console.log("BNB Address:", bnbAddress);
console.log("Burning address:", address);
// console.log("=================");
console.log("Test burning address:", testChildAddress);