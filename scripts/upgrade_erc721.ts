import { ethers, upgrades } from "hardhat";

const PROXY = "0x7EE14d5e999Ca8775A2a0F45e170B8336AE7cF24";

async function main() {
    const Erc721_staking_v2 = await ethers.getContractFactory("Erc721_staking_v2");
    console.log("Upgrading Erc721_staking_v2...");
    await upgrades.upgradeProxy(PROXY, Erc721_staking_v2);
    console.log("Erc721_staking_v2 upgraded");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});