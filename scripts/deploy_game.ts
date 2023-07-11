import { ethers, upgrades } from "hardhat";

async function main() {
    const erc721_addr = "0x7EE14d5e999Ca8775A2a0F45e170B8336AE7cF24";
    const erc20_addr = "0x9947833A83Ed3Db7Bd181832e9B3a7d85F42B527";

    const Game = await ethers.getContractFactory("Game");
    console.log("Deploying Game...");
    const contract = await upgrades.deployProxy(Game, [erc721_addr, erc20_addr], {
        initializer: "initialize",
    });
    await contract.deployed();
    console.log("Game deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});