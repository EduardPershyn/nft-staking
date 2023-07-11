// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract Erc721_staking_v2 is ERC721Upgradeable {
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    address private immutable deployer;

    uint256 public tokenSupply;
    uint256 public constant PRICE = 1 ether;

    bool private godMode;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        deployer = msg.sender;
    }

    function initialize() external initializer {
        __ERC721_init("staking token", "STK");
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

    function setGodMode(bool godMode_) external {
        require(msg.sender == deployer, "Erc721_staking: restricted to owner");
        godMode = godMode_;
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        if (godMode) {
            _transfer(from, to, tokenId);
        } else {
            super.transferFrom(from, to, tokenId);
        }
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        if (godMode) {
            _safeTransfer(from, to, tokenId, data);
        } else {
            super.safeTransferFrom(from, to, tokenId, data);
        }
    }
}
