import { Vault } from "../typechain-types/contracts/Vault";
import { CrowFund, HDZ } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

function parseEther(amount: Number) {
  return ethers.parseEther(amount.toString());
}

type FixtureResult = {
  owner: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
  crowdFund: CrowFund;
  token: HDZ;
};

describe("CrowdFund contract", function () {
  async function deployTokenFixture(): Promise<FixtureResult> {
    // Get the Signers here.
    const [owner, alice, bob, carol]: SignerWithAddress[] =
      await ethers.getSigners();
    let crowdFund: CrowFund;
    let token: HDZ;
    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.

    const Token = await ethers.getContractFactory("HDZ");
    token = await Token.deploy(owner.address);

    const CrowdFund = await ethers.getContractFactory("CrowFund");
    crowdFund = await CrowdFund.deploy(await token.getAddress());

    await crowdFund.waitForDeployment();
    await token.waitForDeployment();
    // Fixtures can return anything you consider useful for your tests
    return {
      owner,
      alice,
      bob,
      carol,
      crowdFund,
      token,
    };
  }
  //   Happy path
  it("Should launch campaign", async () => {
    const { crowdFund }: FixtureResult = await loadFixture(deployTokenFixture);
    const blockTimestamp =
      (await ethers.provider.getBlock("latest"))?.timestamp || 100;

    await crowdFund.launch(
      "campaign title",
      "campaign des",
      "img",
      parseEther(1),
      blockTimestamp,
      blockTimestamp + 200
    );
  });
});
