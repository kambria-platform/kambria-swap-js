var publicSwapKey = require('./publicSwapKey.4.Kambria.json');

module.exports = {
  organization: 'Kambria',
  network: '4',
  bnbAddress: 'tbnb175ehva8cwvm0ndcf27nh8ylld0lsk8nk87rns2',
  password: 'dummy@password',
  publicSwapKey: publicSwapKey,
  ethOpts: {
    network: 4,
    token: {
      address: '0x9dddff7752e1714c99edf940ae834f0d57d68546',
      decimals: 18
    },
    minimum: 1000
  },
  bnbOpts: {
    network: 'testnet',
    token: {
      denom: 'KATT1-C26',
      decimals: 8
    },
    coinbase: {
      address: 'tbnb1k4qr95fhj6lexsg0e69q2r4rvdy7px043lzwua',
      privKey: '485647f8e0cdbe18865495847e0d0bd8a25b687804344aefb266e2bd369d4d27'
    }
  },
  depositTx: '0xb95c2ed6df25ad811dcef5fb938bff2591ea73eba5e5a20eb5f30a64ae583f9f'
}