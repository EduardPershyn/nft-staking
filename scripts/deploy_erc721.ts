import { ethers, upgrades } from "hardhat";

async function main() {
    const Erc721_staking = await ethers.getContractFactory("Erc721_staking");
    console.log("Deploying Erc721_staking...");
    const contract = await upgrades.deployProxy(Erc721_staking, {
        initializer: "initialize",
    });
    await contract.deployed();
    console.log("Erc721_staking deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});