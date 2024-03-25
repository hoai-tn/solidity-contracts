import { Vault } from "../typechain-types/contracts/Vault";
import { HDZ } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as chai from "chai";
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
  vault: Vault;
  token: HDZ;
};

describe("Vault contract", function () {
  async function deployTokenFixture(): Promise<FixtureResult> {
    // Get the Signers here.
    const [owner, alice, bob, carol]: SignerWithAddress[] =
      await ethers.getSigners();
    let vault: Vault;
    let token: HDZ;
    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(owner.address);

    const Token = await ethers.getContractFactory("HDZ");
    token = await Token.deploy(owner.address);
    await vault.setToken(token);

    await vault.waitForDeployment();
    await token.waitForDeployment();
    // Fixtures can return anything you consider useful for your tests
    return {
      owner,
      alice,
      bob,
      carol,
      vault,
      token,
    };
  }
  //   Happy path
  it("Should deposit into the Vault", async () => {
    const { vault, token, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    await token.transfer(alice.address, parseEther(5));
    // alice allow vault transfer all token from alice to vault
    const aliceBalanceBeforeApprove = await token.balanceOf(alice.address);
    await token
      .connect(alice)
      .approve(vault.getAddress(), aliceBalanceBeforeApprove);

    await vault.connect(alice).deposit(parseEther(3));

    const aliceBalance = await token.balanceOf(alice.address);
    const vaultBalance = await token.balanceOf(vault.getAddress());

    expect(aliceBalance).to.equal(parseEther(2));
    expect(vaultBalance).to.equal(parseEther(3));
  });
});
