// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Erc721_staking is ERC721  {

    uint256 public tokenSupply;

    uint256 public constant PRICE = 1 ether;

    constructor() ERC721("staking token", "STK") {

    }

    function mint() external payable {
        require(msg.value == PRICE, "Erc721_staking: msg ethers value is not correct");

        _mint(msg.sender, tokenSupply);
        tokenSupply += 1;
    }
}