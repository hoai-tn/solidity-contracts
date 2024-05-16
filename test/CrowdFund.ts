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
      blockTimestamp + 10,
      blockTimestamp + 200
    );

    const campaign = await crowdFund.campaigns(1);

    expect(campaign.title).to.equal("campaign title");
    expect(campaign.description).to.equal("campaign des");
    expect(campaign.image).to.equal("img");
    expect(campaign.goal).to.equal(parseEther(1));
    expect(campaign.startAt).to.equal(blockTimestamp + 10);
    expect(campaign.endAt).to.equal(blockTimestamp + 200);
  });

  it("Should cancel campaign", async function () {
    const { crowdFund }: FixtureResult = await loadFixture(deployTokenFixture);
    const blockTimestamp =
      (await ethers.provider.getBlock("latest"))?.timestamp || 100;
    await crowdFund.launch(
      "campaign title",
      "campaign des",
      "img",
      parseEther(1),
      blockTimestamp + 10,

      blockTimestamp + 200
    );
    await crowdFund.cancel(1);
    const campaign = await crowdFund.campaigns(1);
    expect(campaign.title).to.equal("");
    expect(campaign.description).to.equal("");
    expect(campaign.image).to.equal("");
    expect(campaign.goal).to.equal(0);
    expect(campaign.startAt).to.equal(0);
    expect(campaign.endAt).to.equal(0);
  });

  it("Should pledge to campaign", async function () {
    const { crowdFund, token, owner, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    const amount = parseEther(1);

    // Send tokens to Bob
    await token.connect(owner).transfer(bob.address, amount);
    // Approve the Crowdfund contract to spend Bob's tokens
    await token.connect(bob).approve(await crowdFund.getAddress(), amount);

    const blockTimestamp =
      (await ethers.provider.getBlock("latest"))?.timestamp || 100;

    await crowdFund.launch(
      "campaign title",
      "campaign des",
      "img",
      parseEther(10),
      blockTimestamp + 10,
      blockTimestamp + 200
    );

    // increase timestamp to pledge
    await ethers.provider.send("evm_increaseTime", [20]); // Set the block time to the specified timestamp

    await crowdFund.connect(bob).pledge(1, amount);

    const campaign = await crowdFund.campaigns(1);
    const pledgedAmount = await crowdFund.pledgedAmount(1, bob.address);

    expect(campaign.pledged).to.equal(amount);
    expect(pledgedAmount).to.equal(amount);
  });

  it("Should unpledge to campaign", async function () {
    const { crowdFund, owner, token, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    const amount = parseEther(1);

    // Send tokens to Bob
    await token.connect(owner).transfer(bob.address, amount);
    // Approve the Crowdfund contract to spend Bob's tokens
    await token.connect(bob).approve(await crowdFund.getAddress(), amount);

    const blockTimestamp =
      (await ethers.provider.getBlock("latest"))?.timestamp || 100;
    await crowdFund.launch(
      "campaign title",
      "campaign des",
      "img",
      parseEther(1),
      blockTimestamp + 10,
      blockTimestamp + 300
    );
    // increase timestamp to pledge
    await ethers.provider.send("evm_increaseTime", [20]); // Set the block time to the specified timestamp

    await crowdFund.connect(bob).pledge(1, amount);
    await crowdFund.connect(bob).unPledge(1, amount);
    const campaign = await crowdFund.campaigns(1);
    const pledgedAmount = await crowdFund.pledgedAmount(1, bob.address);

    expect(campaign.pledged).to.equal(0);
    expect(pledgedAmount).to.equal(0);
  });

  it("Should claim campaign", async () => {
    const { crowdFund, owner, token, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    const amount = parseEther(1);

    // Send tokens to Bob
    await token.connect(owner).transfer(bob.address, amount);
    // Approve the Crowdfund contract to spend Bob's tokens
    await token.connect(bob).approve(await crowdFund.getAddress(), amount);

    const blockTimestamp =
      (await ethers.provider.getBlock("latest"))?.timestamp || 100;
    await crowdFund
      .connect(owner)
      .launch(
        "campaign title",
        "campaign des",
        "img",
        parseEther(1),
        blockTimestamp + 10,
        blockTimestamp + 300
      );
    // increase timestamp to pledge
    await ethers.provider.send("evm_increaseTime", [10]); // Set the block time to the specified timestamp

    await crowdFund.connect(bob).pledge(1, amount);
    // increase timestamp to claim
    await ethers.provider.send("evm_increaseTime", [400]); // Set the block time to the specified timestamp

    await crowdFund.connect(owner).claim(1);

    const campaign = await crowdFund.campaigns(1);

    expect(campaign.claimed).true;
  });

  it("should refund successfully", async function () {
    const { crowdFund, owner, token, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    const amount = parseEther(2);

    // Send tokens to Bob
    await token.connect(owner).transfer(bob.address, amount);
    // Approve the Crowdfund contract to spend Bob's tokens
    await token.connect(bob).approve(await crowdFund.getAddress(), amount);

    const blockTimestamp =
      (await ethers.provider.getBlock("latest"))?.timestamp || 100;
    await crowdFund
      .connect(owner)
      .launch(
        "campaign title",
        "campaign des",
        "img",
        amount,
        blockTimestamp + 10,
        blockTimestamp + 300
      );
    // increase timestamp to pledge
    await ethers.provider.send("evm_increaseTime", [10]); // Set the block time to the specified timestamp

    await crowdFund.connect(bob).pledge(1, amount - parseEther(1));
    // increase timestamp to claim
    await ethers.provider.send("evm_increaseTime", [400]); // Set the block time to the specified timestamp

    await crowdFund.connect(bob).refund(1);

    const pledgedAmount = await crowdFund.pledgedAmount(1, bob.address);

    expect(pledgedAmount).to.equal(0);
  });
});
