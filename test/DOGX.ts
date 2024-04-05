import { DOGX } from "../typechain-types";
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
  token: DOGX;
};

describe("DOGX Contract", function () {
  async function deployTokenFixture(): Promise<FixtureResult> {
    // Get the Signers here.
    const [owner, alice, bob, carol]: SignerWithAddress[] =
      await ethers.getSigners();
    let token: DOGX;
    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.

    const Token = await ethers.getContractFactory("DOGX");
    token = await Token.deploy(owner.address);
    // token = await Token.deploy(owner.address);

    await token.waitForDeployment();
    // Fixtures can return anything you consider useful for your tests
    return {
      owner,
      alice,
      bob,
      carol,
      token,
    };
  }
  //   Happy path
  it("Should transfer NFT by Operator", async () => {
    const { token, owner, alice, bob, carol } = await deployTokenFixture();

    await token.connect(owner).mint(owner.address, "URI_1");
    await token.connect(owner).setApprovalForAll(alice.address, true);
    await token.isApprovedForAll(owner.address, alice.address);
    await token.connect(alice).approve(owner.address, 1);
    // await token.connect(alice).transferFrom(owner.address, bob.address, 1);

    await token
      .connect(alice)
      ["safeTransferFrom(address,address,uint256)"](
        owner.address,
        bob.address,
        1
      );

    const ownerOf = await token.ownerOf(1);

    expect(ownerOf).to.equal(bob.address);
  });

  // Unhappy path

  it("Should not transfer NFT, invalid receiver", async () => {
    const { token, owner, alice, bob, carol } = await deployTokenFixture();

    await token.connect(owner).mint(owner.address, "URI_1");
    await token.connect(owner).approve(owner.address, 1);

    await expect(
      token.connect(alice).transferFrom(owner.address, ethers.ZeroAddress, 1)
    ).to.be.revertedWithCustomError(token, "ERC721InvalidReceiver");
  });
});
