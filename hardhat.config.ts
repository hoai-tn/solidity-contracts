import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // bsctest: {
    //   url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
    //   accounts: [process.env.PRIV_KEY as string],
    // },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${
        process.env.INFURA_API_KEY as string
      }`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: process.env.ETHER_API_KEY,
  },
};

export default config;
