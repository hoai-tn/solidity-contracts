import { HDZ, HDZCrowdsale, StakingTrial, USDT } from "../typechain-types";
import { expect } from "chai";
import { Block } from "ethers";
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
  token: HDZ;
  staking: StakingTrial;
};

describe("Staking contract", function () {
  async function deployTokenFixture(): Promise<FixtureResult> {
    // Get the Signers here.
    const [owner, alice, bob]: SignerWithAddress[] = await ethers.getSigners();
    let staking: StakingTrial;
    let token: HDZ;

    const Token = await ethers.getContractFactory("HDZ");
    token = await Token.deploy(owner.address);
    const tokenAddress = await token.getAddress();

    const Staking = await ethers.getContractFactory("StakingTrial");
    staking = await Staking.deploy(tokenAddress);

    await staking.waitForDeployment();
    await token.waitForDeployment();
    // Fixtures can return anything you consider useful for your tests
    return {
      owner,
      alice,
      bob,
      token,
      staking,
    };
  }
  // Happy path
  it("should allow user to stake tokens", async () => {
    const { owner, staking, token, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    const amountStake = parseEther(100);
    token.transfer(alice.address, parseEther(100));
    await token
      .connect(alice)
      .approve(await staking.getAddress(), parseEther(1000));
    await staking.connect(alice).stake(amountStake);
    const [totalStaked, reward, lastStakedTime] = await staking.stakers(
      alice.address
    );
    expect(totalStaked).equal(amountStake);
  });

  it("should allow user to unStake tokens", async () => {
    const { owner, staking, token, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    const amountStake = parseEther(100);
    const amountUnStake = parseEther(80);
    token.transfer(alice.address, parseEther(100));
    await token
      .connect(alice)
      .approve(await staking.getAddress(), parseEther(1000));
    await staking.connect(alice).stake(amountStake);

    // increase timestamp to unStake
    await ethers.provider.send("evm_increaseTime", [86400 * 180]); // Set the block time to the specified timestamp
    await ethers.provider.send("evm_mine");

    await staking.connect(alice).unStake(amountUnStake);

    // const rewardToken = await staking.calculateReward(alice.address);

    // console.log({
    //   rewardToken: ethers.formatEther(rewardToken),
    //   blockAfter: blockAfter?.timestamp,
    // });

    const [totalStaked, reward, lastStakedTime] = await staking.stakers(
      alice.address
    );
    const parseReward = parseFloat(ethers.formatEther(reward)).toFixed(4);
    const expectReward = (
      (parseFloat(ethers.formatEther(amountStake)) * 180 * 0.05) /
      365
    ).toFixed(4);

    expect(totalStaked).equal(amountStake - amountUnStake);
    expect(parseReward).equal(expectReward);
  });
});
