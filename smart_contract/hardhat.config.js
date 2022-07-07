require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.alchemyapi.io/v2/xxxxxxxx', // Alchemy API Key
      accounts: [`xxxxxxxxxxxxxxxxxxxxxxxx`] // Use your private key to deploy it
    }
  }
}