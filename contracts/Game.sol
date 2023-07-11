// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "./Erc20_reward.sol";
import "./Erc721_staking.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Game is Initializable, IERC721Receiver {
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    address public immutable owner;

    Erc721_staking public itemNft;
    Erc20_reward public rewardToken;

    uint256 public constant CLAIM_REWARD = 10 ether;
    uint256 public constant STAKE_PERIOD = 24 hours;

    mapping(uint256 => address) public originalOwner;
    mapping(uint256 => uint256) public claimedTime;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        owner = msg.sender;
    }

    function initialize(Erc721_staking itemNft_, Erc20_reward rewardToken_) external initializer {
        itemNft = itemNft_;
        rewardToken = rewardToken_;
    }

    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        require(msg.sender == address(itemNft), "Game: we expected other nft");

        originalOwner[tokenId] = from;
        claimedTime[tokenId] = block.timestamp;

        return IERC721Receiver.onERC721Received.selector;
    }

    function withdrawNft(uint256 tokenId) external {
        require(
            msg.sender == originalOwner[tokenId],
            "Game: Only original owner can withdraw"
        );

        originalOwner[tokenId] = address(0);
        itemNft.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function claimReward(uint256 tokenId) external {
        require(
            msg.sender == originalOwner[tokenId],
            "Game: Only original owner can claim reward"
        );

        uint256 timePassed = block.timestamp - claimedTime[tokenId];
        uint256 rewardToClaim = (timePassed / STAKE_PERIOD) * CLAIM_REWARD;
        if (rewardToClaim > 0) {
            _sendReward(msg.sender, rewardToClaim);

            uint256 unclaimedTime = timePassed % STAKE_PERIOD;
            claimedTime[tokenId] = block.timestamp - unclaimedTime;
        }
    }

    function _sendReward(address to, uint256 amount) internal {
        rewardToken.mint(amount);
        rewardToken.transfer(to, amount);
    }
}
