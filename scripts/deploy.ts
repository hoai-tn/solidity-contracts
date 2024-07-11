import { config, ethers, hardhatArguments } from "hardhat";
import * as Config from "./config";

async function main() {
  await Config.initConfig();
  const network = hardhatArguments.network ? hardhatArguments.network : "dev";
  const [deployer] = await ethers.getSigners();
  console.log("deploy from address: ", deployer.address);

  // const CTC = await ethers.getContractFactory("CTC");
  // const ctc = await CTC.deploy(deployer.address);
  // const ctcAddress = await ctc.getAddress();
  // console.log("ctc address: ", ctcAddress);
  // Config.setConfig(network + ".CTC", ctcAddress);

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

  // const USDT = await ethers.getContractFactory("USDT");
  // const usdt = await USDT.deploy(deployer.address);
  // const usdtAddress = await usdt.getAddress();
  // console.log("USDT address: ", usdtAddress);
  // Config.setConfig(network + ".USDT", usdtAddress);

  // const HDZCrowdsale = await ethers.getContractFactory("CTCPresale");
  // const hdzCrowdsale = await HDZCrowdsale.deploy(
  //   deployer.address,
  //   3000,
  //   1,
  //   "0xD7b410228a27Cb885f2da9971c2c875B0757a905",
  //   "0x3f18BC29773bb0E5129a7FBF1Bb67FCE1ac6B930"
  // );

  // const hdzCrowdsaleAddress = await hdzCrowdsale.getAddress();
  // console.log("HDZCrowdsale address: ", hdzCrowdsaleAddress);
  // Config.setConfig(network + ".CTCPresale", hdzCrowdsaleAddress);

  // const DOGX = await ethers.getContractFactory("DOGX");
  // const dogX = await DOGX.deploy("0x6FeefDD0445Ded0f111BE915f775c8D41C361611");
  // const dogXAddress = await dogX.getAddress();
  // console.log("DOGX address: ", dogXAddress);
  // Config.setConfig(network + ".DOGX", dogXAddress);

  const CrowdFund = await ethers.getContractFactory("CrowdFunding");
  const crowdFund = await CrowdFund.deploy("0x3f18bc29773bb0e5129a7fbf1bb67fce1ac6b930");
  const crowdFundAddress = await crowdFund.getAddress();
  console.log("crowdFund address: ", crowdFundAddress);
  Config.setConfig(network + ".CtcCrowdFunding", crowdFundAddress);

  await Config.updateConfig();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
