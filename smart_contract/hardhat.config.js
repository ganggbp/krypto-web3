require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;

module.exports = {
  solidity: '0.8.9',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/xP1y8ZsM0N5EyY9FJt8RFFM9qqT-_YDr',
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};
