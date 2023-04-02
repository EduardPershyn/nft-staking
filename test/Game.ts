import { time } from "@nomicfoundation/hardhat-network-helpers";

const { assert, expect, use } = require('chai')
const { ethers } = require('hardhat')

use(require('chai-as-promised'))

describe('Staking Game', function () {
    let erc20_reward: Contract;
    let erc721_staking: Contract;
    let game: Contract;

    before(async () => {
        const accounts = await ethers.getSigners();

        const erc20_rewardFactory = await ethers.getContractFactory("Erc20_reward");
        erc20_reward = await erc20_rewardFactory.deploy();
        await erc20_reward.deployed()

        const erc721_stakingFactory = await ethers.getContractFactory("Erc721_staking");
        erc721_staking = await erc721_stakingFactory.deploy();
        await erc721_staking.deployed()

         const gameFactory = await ethers.getContractFactory("Game");
         game = await gameFactory.deploy(erc721_staking.address, erc20_reward.address);
         await game.deployed()

        let tx = await erc20_reward.connect(accounts[0]).setGameManager(game.address);
        await tx.wait();
    });

    it('Stake and claim reward', async () => {
        const accounts = await hre.ethers.getSigners();
        const accAddress = await accounts[1].getAddress();
        let tokenId = 0;

        await erc721_staking.connect(accounts[1]).mint({value: ethers.utils.parseEther("1")});
        let address = await erc721_staking.connect(accounts[1]).ownerOf(tokenId)
        //console.log(address);
        expect(address).to.be.equal(await accounts[1].getAddress());

        await erc721_staking.connect(accounts[1])["safeTransferFrom(address,address,uint256)"](accAddress, game.address, tokenId);

        let balance = await erc20_reward.balanceOf(accAddress)
        console.log(balance);
        expect(balance).to.be.equal(0);

        await time.increase(129600); //36 hours
        await game.connect(accounts[1]).claimReward(0);

        balance = await erc20_reward.balanceOf(accAddress)
        console.log(balance);
        expect(balance).to.be.equal(ethers.utils.parseEther("10"));

        await time.increase(43200); //12 hours
        await game.connect(accounts[1]).claimReward(0);

        balance = await erc20_reward.balanceOf(accAddress)
        console.log(balance);
        expect(balance).to.be.equal(ethers.utils.parseEther("20"));
    })
})