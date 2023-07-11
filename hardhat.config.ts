const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString("utf-8");
const infuraKey = fs.readFileSync(".infura").toString("utf-8");

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");

const config: HardhatUserConfig = {
  etherscan: {
    apiKey: {
      goerli: 'VTDGX92SAV8QGEFX4BFVNAN6VMDAVV2TA1'
    }
  },
  networks: {
    goerli: {
        url: "https://goerli.infura.io/v3/"+infuraKey,
        accounts: [privateKey],
        gas: 8000000,
    },
    mumbai: {
        url: "https://polygon-mumbai.infura.io/v3/"+infuraKey,
        accounts: [privateKey],
        timeout: 1000000,
        gas: 8000000,
        gasPrice: 8000000000
    },
  },
  solidity: {
      compilers: [
        {
          version: "0.8.18",
          settings: {
            optimizer: {
              enabled: true,
              runs: 10000,
            },
          },
        }
      ],
    },
  mocha: {
    reporter: "JSON"
  }
};

export default config;
