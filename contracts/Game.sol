// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Erc20_reward.sol";

contract Game is IERC721Receiver {
    address public immutable owner;

    ERC721 public immutable itemNft;
    Erc20_reward public immutable rewardToken;

    uint256 public constant CLAIM_REWARD = 10 ether;
    uint256 public constant STAKE_PERIOD = 24 hours;

    mapping(uint256 => address) public originalOwner;
    mapping(uint256 => uint256) public claimedTime;

    constructor(ERC721 itemNft_, Erc20_reward rewardToken_) {
        owner = msg.sender;
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
