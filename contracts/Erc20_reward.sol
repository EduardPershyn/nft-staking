// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract Erc20_reward is ERC20Upgradeable {
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    address public immutable _owner;
    address private _game;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _owner = msg.sender;
    }

    function initialize() external initializer{
        __ERC20_init("Reward token", "RWRD");
    }

    function setGameManager(address game) external {
        require(msg.sender == _owner, "Erc20_reward: restricted to owner");
        _game = game;
    }

    function mint(uint256 amount) external {
        require(msg.sender == _game, "Erc20_reward: only game can mint");
        _mint(msg.sender, amount);
    }
}
