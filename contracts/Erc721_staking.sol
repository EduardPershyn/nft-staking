// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Erc721_staking is ERC721 {
    address private immutable deployer;

    uint256 public tokenSupply;
    uint256 public constant PRICE = 1 ether;

    constructor() ERC721("staking token", "STK") {
        deployer = msg.sender;
    }

    function mint() external payable {
        require(
            msg.value == PRICE,
            "Erc721_staking: msg ethers value is not correct"
        );

        _mint(msg.sender, tokenSupply);
        tokenSupply += 1;
    }

    function withdraw() external {
        payable(deployer).transfer(address(this).balance);
    }
}
