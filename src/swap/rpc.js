const CODE = '55b8fc1234d845ffbea5da26f9ae70f5';

const ETH_RPC = {
  MAINNET: {
    id: 1,
    rpc: 'https://mainnet.infura.io/v3/' + CODE
  },
  ROPSTEN: {
    id: 3,
    rpc: 'https://ropsten.infura.io/v3/' + CODE
  },
  RINKEBY: {
    id: 4,
    rpc: 'https://rinkeby.infura.io/v3/' + CODE
  },
  GOERLI: {
    id: 5,
    rpc: 'https://goerli.infura.io/v3/' + CODE
  },
  KOVAN: {
    id: 42,
    rpc: 'https://kovan.infura.io/v3/' + CODE
  }
}

let getEthRPC = (net) => {
  switch (net) {
    case 1:
      return ETH_RPC.MAINNET.rpc;
    case 3:
      return ETH_RPC.ROPSTEN.rpc;
    case 4:
      return ETH_RPC.RINKEBY.rpc;
    case 5:
      return ETH_RPC.GOERLI.rpc;
    case 42:
      return ETH_RPC.KOVAN.rpc;
    case 'mainnet':
      return ETH_RPC.MAINNET.rpc;
    case 'ropsten':
      return ETH_RPC.ROPSTEN.rpc;
    case 'rinkeby':
      return ETH_RPC.RINKEBY.rpc;
    case 'goerli':
      return ETH_RPC.GOERLI.rpc;
    case 'kovan':
      return ETH_RPC.KOVAN.rpc;
    default:
      return null;
  }
}

const BNB_RPC = {
  MAINNET: {
    id: 'Binance-Chain-Tigris',
    rpc: 'https://dex.binance.org'
  },
  TESTNET: {
    id: 'Binance-Chain-Nile',
    rpc: 'https://testnet-dex.binance.org'
  }
}

let getBnbRPC = (net) => {
  switch (net) {
    case 'Binance-Chain-Tigris':
      return BNB_RPC.MAINNET.rpc;
    case 'Binance-Chain-Nile':
      return BNB_RPC.TESTNET.rpc;
    case 'mainnet':
      return BNB_RPC.MAINNET.rpc;
    case 'testnet':
      return BNB_RPC.TESTNET.rpc;
    default:
      return null;
  }
}

module.exports = { getEthRPC, getBnbRPC };