import { ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
  await Config.initConfig();
  const network = hardhatArguments.network ? hardhatArguments.network : "dev";
  const [deployer] = await ethers.getSigners();
  console.log("deploy from address: ", deployer.address);

  // const HDZ = await ethers.getContractFactory("HDZ");
  // const hdz = await HDZ.deploy(deployer.address);
  // const hdzAddress = await hdz.getAddress();
  // console.log("HDZ address: ", hdzAddress);
  // Config.setConfig(network + ".HDZ", hdzAddress);

  // const Vault = await ethers.getContractFactory("Vault");
  // const vault = await Vault.deploy(deployer.address);
  // const vaultAddress = await vault.getAddress();
  // console.log("Vault address: ", vaultAddress);
  // Config.setConfig(network + ".Vault", vaultAddress);

  const USDT = await ethers.getContractFactory("USDT");
  const usdt = await USDT.deploy(deployer.address);
  const usdtAddress = await usdt.getAddress();
  console.log("USDT address: ", usdtAddress);
  Config.setConfig(network + ".USDT", usdtAddress);

  const HDZCrowdsale = await ethers.getContractFactory("HDZCrowdsale");
  const hdzCrowdsale = await HDZCrowdsale.deploy(
    deployer.address,
    4000,
    1,
    "0xD7b410228a27Cb885f2da9971c2c875B0757a905",
    "0x3b85520B19e94DB3Fd32e8717C3A50308dd3063a"
  );
  const hdzCrowdsaleAddress = await hdzCrowdsale.getAddress();
  console.log("HDZCrowdsale address: ", hdzCrowdsaleAddress);
  Config.setConfig(network + ".HDZCrowdsale", hdzCrowdsaleAddress);

  await Config.updateConfig();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
