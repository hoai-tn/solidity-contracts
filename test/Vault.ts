import { Vault } from "../typechain-types/contracts/Vault";
import { HDZ } from "../typechain-types";
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
    await token.connect(alice).approve(vault.getAddress(), parseEther(5));

    await vault.connect(alice).deposit(parseEther(3));

    expect(await token.balanceOf(alice.address)).to.equal(parseEther(2));
    expect(await token.balanceOf(vault.getAddress())).to.equal(parseEther(3));
  });

  it("Should withdraw with admin", async () => {
    const { vault, token, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    // admin deposit to vault
    await token.approve(vault.getAddress(), parseEther(20 * 10 ** 6));
    await vault.deposit(parseEther(10 * 10 ** 6));
    // set value to withdraw
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(20 * 10 ** 6));
    // owner withdraw to alice
    await vault.withdraw(alice.address, parseEther(5 * 10 ** 6));
    // expect balanceOf vault and alice after withdrawing
    expect(await token.balanceOf(vault.getAddress())).to.equal(
      parseEther(5 * 10 ** 6)
    );
    expect(await token.balanceOf(alice.address)).to.equal(
      parseEther(5 * 10 ** 6)
    );
  });

  it("Should withdraw with withdrawer", async () => {
    const { vault, token, alice, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    // set WITHDRAW_ROLE for bob
    await vault.grantRole(await vault.WITHDRAWER_ROLE(), bob.address);

    // admin deposit to vault
    await token.approve(vault.getAddress(), parseEther(20 * 10 ** 6));
    await vault.deposit(parseEther(10 * 10 ** 6));

    // set value to withdraw
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(20 * 10 ** 6));

    //bob withdraw to alice
    await vault.connect(bob).withdraw(alice.address, parseEther(10 * 10 ** 6));

    // expect balanceOf vault and alice after withdrawing
    expect(await token.balanceOf(vault.getAddress())).to.equal(0);
    expect(await token.balanceOf(alice.address)).to.equal(
      parseEther(10 * 10 ** 6)
    );
  });

  // Unhappy path
  it("Should not deposit, Insufficient account balance", async () => {
    const { vault, token, alice, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    await token.transfer(alice.address, parseEther(5));
    // alice allow vault transfer all token from alice to vault
    const aliceBalanceBeforeApprove = await token.balanceOf(alice.address);
    await token
      .connect(alice)
      .approve(vault.getAddress(), aliceBalanceBeforeApprove);
    // connect to alice to deposit
    await expect(
      vault.connect(alice).deposit(parseEther(6))
    ).to.be.revertedWith("Insufficient account balance");
  });

  it("Should not withdraw, withdraw is not available", async () => {
    const { vault, token, alice, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    // set WITHDRAW_ROLE for bob
    await vault.grantRole(await vault.WITHDRAWER_ROLE(), bob.address);

    // admin deposit to vault
    await token.approve(vault.getAddress(), parseEther(20 * 10 ** 6));
    await vault.deposit(parseEther(10 * 10 ** 6));
    // disable withdraw
    await vault.setWithdrawEnable(false);
    await vault.setMaxWithdrawAmount(parseEther(20 * 10 ** 6));

    //bob withdraw to alice
    await expect(
      vault.connect(bob).withdraw(alice.address, parseEther(10 * 10 ** 6))
    ).to.revertedWith("Withdraw is not available");
  });

  it("Should not withdraw, Exceed maximum amount", async () => {
    const { vault, token, alice, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    // set WITHDRAW_ROLE for bob
    await vault.grantRole(await vault.WITHDRAWER_ROLE(), bob.address);

    // admin deposit to vault
    await token.approve(vault.getAddress(), parseEther(20 * 10 ** 6));
    await vault.deposit(parseEther(15 * 10 ** 6));
    //set low MaxWithdrawAmount
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(10 * 10 ** 6));

    //bob withdraw to alice with amount more than max amount
    await expect(
      vault.connect(bob).withdraw(alice.address, parseEther(11 * 10 ** 6))
    ).to.revertedWith("Exceed maximum amount");
  });

  it("Should not withdraw, ERC20 Insufficient Balance", async () => {
    const { vault, token, alice, bob }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    // set WITHDRAW_ROLE for bob
    await vault.grantRole(await vault.WITHDRAWER_ROLE(), bob.address);

    // admin deposit to vault
    await token.approve(vault.getAddress(), parseEther(20 * 10 ** 6));
    await vault.deposit(parseEther(10 * 10 ** 6));
    //set value to withdraw
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(15 * 10 ** 6));

    //bob withdraw to alice with amount more than max amount
    await expect(
      vault.connect(bob).withdraw(alice.address, parseEther(15 * 10 ** 6))
    ).to.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });
});
