import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("Staking Game", function () {
  const CLAIM_REWARD = 10; // ether;
  const DEFAULT_STAKE_PERIOD = 24; // hours;

  const DEPLOYER_ID = 0;
  const PLAYER_ID1 = 1;
  const PLAYER_ID2 = 2;

  const tokenId0 = 0;

  let erc20Reward: Contract;
  let erc721Staking: Contract;
  let game: Contract;

  let accounts = null;

  beforeEach(async () => {
    const erc20RewardFactory = await ethers.getContractFactory("Erc20_reward");
    erc20Reward = await erc20RewardFactory.deploy();
    await erc20Reward.deployed();

    const erc721StakingFactory = await ethers.getContractFactory(
      "Erc721_staking"
    );
    erc721Staking = await erc721StakingFactory.deploy();
    await erc721Staking.deployed();

    const gameFactory = await ethers.getContractFactory("Game");
    game = await gameFactory.deploy(erc721Staking.address, erc20Reward.address);
    await game.deployed();

    accounts = await ethers.getSigners();
    const tx = await erc20Reward
      .connect(accounts[DEPLOYER_ID])
      .setGameManager(game.address);
    await tx.wait();
  });

  describe("erc20", function () {
    it("Reject mint for no owner", async () => {
      await expect(
        erc20Reward.connect(accounts[PLAYER_ID1]).mint(1)
      ).to.be.revertedWith("Erc20_reward: only game can mint");
    });

    it("Reject setGameManager for no owner", async () => {
      await expect(
        erc20Reward
          .connect(accounts[PLAYER_ID1])
          .setGameManager(ethers.constants.AddressZero)
      ).to.be.revertedWith("Erc20_reward: restricted to owner");
    });
  });

  describe("erc721", function () {
    it("Reject low fee", async () => {
      await expect(
        erc721Staking
          .connect(accounts[PLAYER_ID1])
          .mint({ value: ethers.utils.parseEther("0.9") })
      ).to.be.revertedWith("Erc721_staking: msg ethers value is not correct");
    });

    it("Owner should be changed", async () => {
      await erc721Staking
        .connect(accounts[PLAYER_ID1])
        .mint({ value: ethers.utils.parseEther("1") });

      const address = await erc721Staking
        .connect(accounts[PLAYER_ID1])
        .ownerOf(tokenId0);
      expect(address).to.be.equal(accounts[PLAYER_ID1].address);
    });

    it("Withdraw test", async () => {
      const balanceBefore = new BigNumber.from(
        await ethers.provider.getBalance(accounts[DEPLOYER_ID].address)
      );

      await erc721Staking
        .connect(accounts[PLAYER_ID1])
        .mint({ value: ethers.utils.parseEther("1") });

      await erc721Staking.withdraw();

      const balanceAfter = new BigNumber.from(
        await ethers.provider.getBalance(accounts[DEPLOYER_ID].address)
      );
      const balanceSub = balanceAfter.sub(balanceBefore);
      expect(balanceSub).to.be.closeTo(
        new BigNumber.from(ethers.utils.parseEther("1")),
        ethers.utils.parseEther("0.0001")
      );
    });
  });

  describe("Game", function () {
    beforeEach(async () => {
      await erc721Staking
        .connect(accounts[PLAYER_ID1])
        .mint({ value: ethers.utils.parseEther("1") });

      await erc721Staking
        .connect(accounts[PLAYER_ID1])
        ["safeTransferFrom(address,address,uint256)"](
          accounts[PLAYER_ID1].address,
          game.address,
          tokenId0
        );
    });

    it("Reject claim for no owner", async () => {
      await expect(
        game.connect(accounts[PLAYER_ID2]).claimReward(tokenId0)
      ).to.be.revertedWith("Game: Only original owner can claim reward");
    });

    it("Withdraw", async () => {
      expect(
        await erc721Staking.connect(accounts[PLAYER_ID1]).ownerOf(tokenId0)
      ).to.be.equal(game.address);

      await game.connect(accounts[PLAYER_ID1]).withdrawNft(tokenId0);

      expect(
        await erc721Staking.connect(accounts[PLAYER_ID1]).ownerOf(tokenId0)
      ).to.be.equal(accounts[PLAYER_ID1].address);
    });

    it("Reject withdraw for no owner", async () => {
      await expect(
        game.connect(accounts[PLAYER_ID2]).withdrawNft(tokenId0)
      ).to.be.revertedWith("Game: Only original owner can withdraw");
    });
  });

  describe("Wrong NFT Stake", function () {
    it("Reject if other NFT staked", async () => {
      const erc721StakingFactory = await ethers.getContractFactory(
        "Erc721_staking"
      );
      const otherErc721 = await erc721StakingFactory.deploy();
      await otherErc721.deployed();

      await otherErc721
        .connect(accounts[PLAYER_ID1])
        .mint({ value: ethers.utils.parseEther("1") });
      await expect(
        otherErc721
          .connect(accounts[PLAYER_ID1])
          ["safeTransferFrom(address,address,uint256)"](
            accounts[PLAYER_ID1].address,
            game.address,
            tokenId0
          )
      ).to.be.revertedWith("Game: we expected other nft");
    });
  });

  describe("Stake and Claim balances", function () {
    async function checkBalance(amount: BigNumber) {
      const balance = await erc20Reward.balanceOf(accounts[PLAYER_ID1].address);
      //console.log(balance);
      expect(balance).to.be.equal(amount);
    }

    it("Balance Checks", async () => {
      await erc721Staking
        .connect(accounts[PLAYER_ID1])
        .mint({ value: ethers.utils.parseEther("1") });

      await erc721Staking
        .connect(accounts[PLAYER_ID1])
        ["safeTransferFrom(address,address,uint256)"](
          accounts[PLAYER_ID1].address,
          game.address,
          tokenId0
        );

      await checkBalance(new BigNumber.from(0));

      await game.connect(accounts[PLAYER_ID1]).claimReward(tokenId0);

      await checkBalance(new BigNumber.from(0));

      await time.increase(
        (DEFAULT_STAKE_PERIOD + DEFAULT_STAKE_PERIOD / 2) * 60 * 60
      ); //36 hours
      await game.connect(accounts[PLAYER_ID1]).claimReward(tokenId0);

      await checkBalance(
        new BigNumber.from(ethers.utils.parseEther(CLAIM_REWARD.toString()))
      );

      await time.increase((DEFAULT_STAKE_PERIOD / 2) * 60 * 60); //12 hours
      await game.connect(accounts[PLAYER_ID1]).claimReward(tokenId0);

      await checkBalance(
        ethers.utils.parseEther((CLAIM_REWARD * 2).toString())
      );
    });
  });
});
