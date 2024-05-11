import { DOGX, EnglishAuction } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

function parseEther(amount: Number) {
  return ethers.parseEther(amount.toString());
}

type FixtureResult = {
  owner: SignerWithAddress;
  seller: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
  nft: DOGX;
  auction: EnglishAuction;
};

describe("English Auction Contract", function () {
  async function deployTokenFixture(): Promise<FixtureResult> {
    // Get the Signers here.
    const [owner, seller, bob, carol]: SignerWithAddress[] =
      await ethers.getSigners();
    let nft: DOGX;
    let auction: EnglishAuction;
    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.

    const NFT = await ethers.getContractFactory("DOGX");
    nft = await NFT.deploy(owner.address);

    const Auction = await ethers.getContractFactory("EnglishAuction");
    auction = await Auction.connect(seller).deploy(
      await nft.getAddress(),
      1,
      parseEther(1)
    );

    await nft.waitForDeployment();
    await auction.waitForDeployment();
    // Fixtures can return anything you consider useful for your tests
    return {
      owner,
      seller,
      bob,
      carol,
      nft,
      auction,
    };
  }
  //   Happy path
  it("Should start auction", async () => {
    const { nft, auction, owner, seller, bob, carol } =
      await deployTokenFixture();

    await startAuction({ nft, auction, owner, seller });
    expect(await auction.started()).true;
    // await token.connect(seller).transferFrom(owner.address, bob.address, 1);
  });
  it("Should bid auction", async () => {
    const { nft, auction, owner, seller, bob, carol } =
      await deployTokenFixture();
    let highBid: BigInt;
    await startAuction({ nft, auction, owner, seller });

    const bodBid = parseEther(2);
    const carolBid = parseEther(3);

    await auction.connect(bob).bid({ value: bodBid });
    highBid = await auction.highestBid();
    expect(highBid).eql(bodBid);

    await auction.connect(carol).bid({ value: carolBid });
    highBid = await auction.highestBid();
    expect(highBid).eql(carolBid);
  });

  it("Should withdraw redundant bid", async () => {
    const { nft, auction, owner, seller, bob, carol } =
      await deployTokenFixture();

    await startAuction({ nft, auction, owner, seller });

    await auction.connect(bob).bid({ value: parseEther(3) });
    await auction.connect(carol).bid({ value: parseEther(4) });
    await auction.connect(bob).bid({ value: parseEther(5) });

    const balanceOfBobBeforeWithdraw = await ethers.provider.getBalance(
      bob.address
    );
    await auction.connect(bob).withdraw();
    const balanceOfBobAfterWithdraw = await ethers.provider.getBalance(
      bob.address
    );

    expect(parseInt(ethers.formatEther(balanceOfBobBeforeWithdraw))).to.equal(
      parseInt(ethers.formatEther(balanceOfBobAfterWithdraw - parseEther(3)))
    );
  });

  it("Should end auction", async () => {
    const { nft, auction, owner, seller, bob, carol } =
      await deployTokenFixture();

    await startAuction({ nft, auction, owner, seller });

    await auction.connect(bob).bid({ value: parseEther(3) });
    await auction.connect(carol).bid({ value: parseEther(4) });
    await auction.connect(bob).bid({ value: parseEther(5) });

    const balanceOfSellerBeforeEnd = await ethers.provider.getBalance(
      seller.address
    );
    // increase timestamp to end auction
    await ethers.provider.send("evm_increaseTime", [86400 * 7]); // Set the block time to the specified timestamp
    await ethers.provider.send("evm_mine");

    await auction.end();
    const balanceOfSellerAfterEnd = await ethers.provider.getBalance(
      seller.address
    );
    const ownerOfNft = await nft.ownerOf(1);

    expect(ownerOfNft).eq(bob.address);
    expect(parseInt(ethers.formatEther(balanceOfSellerAfterEnd))).to.equal(
      parseInt(ethers.formatEther(balanceOfSellerBeforeEnd + parseEther(5)))
    );
  });
});

const startAuction = async ({
  nft,
  auction,
  owner,
  seller,
}: {
  nft: DOGX;
  auction: EnglishAuction;
  owner: SignerWithAddress;
  seller: SignerWithAddress;
}) => {
  await nft.connect(owner).mint(seller.address, "NFT_1");

  await nft.connect(seller).approve(await auction.getAddress(), 1);

  await auction.connect(seller).start();
  const ownerOfNft = await nft.ownerOf(1);

  expect(await auction.getAddress()).eq(ownerOfNft);
};
