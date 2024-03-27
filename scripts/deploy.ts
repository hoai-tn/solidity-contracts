import { ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
  await Config.initConfig();
  const network = hardhatArguments.network ? hardhatArguments.network : "dev";
  const [deployer] = await ethers.getSigners();
  console.log("deploy from address: ", deployer.address);

  const HDZ = await ethers.getContractFactory("HDZ");
  const hdz = await HDZ.deploy(deployer.address);
  const hdzAddress = await hdz.getAddress();
  console.log("HDZ address: ", hdzAddress);
  Config.setConfig(network + ".HDZ", hdzAddress);

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(deployer.address);
  const vaultAddress = await vault.getAddress();
  console.log("Vault address: ", vaultAddress);
  Config.setConfig(network + ".Vault", vaultAddress);

  await Config.updateConfig();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
