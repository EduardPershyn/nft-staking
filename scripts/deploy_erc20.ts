import { ethers, upgrades } from "hardhat";

async function main() {
    const Erc20_reward = await ethers.getContractFactory("Erc20_reward");
    console.log("Deploying Erc20_reward...");
    const contract = await upgrades.deployProxy(Erc20_reward, {
        initializer: "initialize",
    });
    await contract.deployed();
    console.log("Erc20_reward deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});