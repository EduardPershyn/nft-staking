// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Erc20_reward is ERC20 {

    address private _owner;
    address private _game;

    constructor() ERC20("Reward token", "RWRD") {
        _owner = msg.sender;
    }

    function setGameManager(address game) external  {
        require(msg.sender == _owner, "Erc20_reward: restricted to owner");
        _game = game;
    }

    function mint(uint256 amount) external  {
        require(msg.sender == _game, "Erc20_reward: only game can mint");
        _mint(msg.sender, amount);
    }
}