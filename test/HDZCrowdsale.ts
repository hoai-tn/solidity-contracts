import { HDZ, HDZCrowdsale, USDT } from "../typechain-types";
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
  wallet: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
  crowdsale: HDZCrowdsale;
  token: HDZ;
  usdt: USDT;
};

describe("HDZ Crowsale contract", function () {
  async function deployTokenFixture(): Promise<FixtureResult> {
    // Get the Signers here.
    const [owner, wallet, alice, bob, carol]: SignerWithAddress[] =
      await ethers.getSigners();
    let crowdsale: HDZCrowdsale;
    let token: HDZ;
    let usdt: USDT;
    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.

    const Token = await ethers.getContractFactory("CTC");
    token = await Token.deploy(owner.address);

    const USDT = await ethers.getContractFactory("USDT");
    usdt = await USDT.deploy(owner.address);

    const Crowdsale = await ethers.getContractFactory("CTCPresale");
    crowdsale = await Crowdsale.deploy(owner.address, 4000, 1, wallet, token);

    await crowdsale.waitForDeployment();
    await token.waitForDeployment();
    // Fixtures can return anything you consider useful for your tests
    return {
      owner,
      wallet,
      alice,
      bob,
      carol,
      crowdsale,
      token,
      usdt,
    };
  }
  // Happy path
  it("Should buy token by ETH", async () => {
    const { crowdsale, wallet, token, alice }: FixtureResult =
      await loadFixture(deployTokenFixture);
    const initTokenAmount = parseEther(2000000);
    const etherBuyToken = parseEther(5);
    const tokenAmountETH = await crowdsale.getTokenAmountETH(etherBuyToken);

    const walletBalanceBeforeAliceBuy = await ethers.provider.getBalance(
      wallet.address
    );
    // transfer token to crowdsale to alice buy
    await token.transfer(crowdsale.getAddress(), initTokenAmount);
    // alice buy token by ETH
    await expect(
      await crowdsale.connect(alice).buyTokenByETH({ value: etherBuyToken })
    )
      .to.emit(crowdsale, "BuyTokenByETH")
      .withArgs(alice.address, tokenAmountETH);

    const walletBalanceAfterAliceBuy = await ethers.provider.getBalance(
      wallet.address
    );

    // expect alice should received token after buy
    expect(await token.balanceOf(alice.address)).to.equal(tokenAmountETH);
    // check wallet received ETH after alice buy
    expect(walletBalanceAfterAliceBuy).to.equal(
      walletBalanceBeforeAliceBuy + etherBuyToken
    );
    // check crowdsale should transfer token to alice after alice buy
    expect(await token.balanceOf(crowdsale.getAddress())).to.equal(
      initTokenAmount - tokenAmountETH
    );
  });
  it("Should buy token by USDT", async () => {
    const { crowdsale, wallet, token, usdt, alice }: FixtureResult =
      await loadFixture(deployTokenFixture);

    const initTokenAmount = parseEther(2000000);
    const usdtBuyToken = parseEther(1000);
    const tokenAmountUSDT = await crowdsale.getTokenAmountUSDT(usdtBuyToken);
    const usdtWalletBeforeAliceBuy = await usdt.balanceOf(wallet.address);

    // transfer token to crowdsale to alice buy
    await token.transfer(crowdsale.getAddress(), initTokenAmount);
    // transfer usdt to alice to buy token
    await usdt.transfer(alice.address, parseEther(10000));
    await usdt.connect(alice).approve(crowdsale.getAddress(), parseEther(1000));
    // set usdt token to crowdsale
    await crowdsale.setUSDTToken(usdt);
    // buy token by USDT and check emit event
    await expect(await crowdsale.connect(alice).buyTokenByUSDT(usdtBuyToken))
      .to.emit(crowdsale, "BuyTokenByUSDT")
      .withArgs(alice.address, usdtBuyToken);
    const usdtWalletAfterAliceBuy = await usdt.balanceOf(wallet.address);

    // expect alice should received token after buy
    expect(await token.balanceOf(alice.address)).to.equal(tokenAmountUSDT);
    // check wallet received ETH after alice buy
    expect(usdtWalletAfterAliceBuy).to.equal(
      usdtWalletBeforeAliceBuy + usdtBuyToken
    );
    // check crowdsale should transfer token to alice after alice buy
    expect(await token.balanceOf(crowdsale.getAddress())).to.equal(
      initTokenAmount - tokenAmountUSDT
    );
  });
  //Unhappy path
  it("Should not buy token by ETH, Amount is zero", async () => {
    const { crowdsale, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    await expect(
      crowdsale.connect(alice).buyTokenByETH({ value: 0 })
    ).to.be.revertedWith("Amount is zero");
  });

  it("Should not buy token by ETH, Insufficient account balance", async () => {
    const { crowdsale, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    await expect(
      crowdsale.connect(alice).buyTokenByETH({ value: 10 })
    ).to.be.revertedWith("Insufficient account balance");
  });

  it("Should not buy token by USDT, Amount is zero", async () => {
    const { crowdsale, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );

    await expect(
      crowdsale.connect(alice).buyTokenByUSDT(parseEther(0))
    ).to.be.revertedWith("Amount is zero");
  });

  it("Should not buy token by USDT, Insufficient account balance", async () => {
    const { crowdsale, usdt, alice }: FixtureResult = await loadFixture(
      deployTokenFixture
    );
    // transfer usdt to alice to buy token
    await usdt.transfer(alice.address, parseEther(10000));
    await usdt.connect(alice).approve(crowdsale.getAddress(), parseEther(1000));

    await expect(
      crowdsale.connect(alice).buyTokenByUSDT(parseEther(100))
    ).to.be.revertedWith("Insufficient account balance");
  });
});
