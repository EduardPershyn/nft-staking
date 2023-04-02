import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Erc20_reward.sol";

contract Game is IERC721Receiver {

    address public owner;

    ERC721 public itemNft;
    Erc20_reward public rewardToken;

    uint256 public constant CLAIM_REWARD = 10 ether;
    uint256 public constant DEFAULT_STAKE_PERIOD = 24 hours;
    uint256 public stakePeriod = DEFAULT_STAKE_PERIOD;

    mapping(uint256 => address) public originalOwner;
    mapping(uint256 => uint256) public claimedTime;

    constructor(ERC721 itemNft_, Erc20_reward rewardToken_) {
        owner = msg.sender;
        itemNft = itemNft_;
        rewardToken = rewardToken_;
    }

    function setStakePeriod(uint256 period_) external {
        require(msg.sender == owner, "Game: restricted");
        require(period_ > 0, "Game: period should be more than zero");
        stakePeriod = period_;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        require(msg.sender == address(itemNft), "Game: we expected other nft");

        originalOwner[tokenId] = from;
        claimedTime[tokenId] = block.timestamp;

        return IERC721Receiver.onERC721Received.selector;
    }

//    function stakeNFT(uint256 tokenId) external {
//        originalOwner[tokenId] = msg.sender;
//        itemNft.safeTransferFrom(msg.sender, address(this), tokenId);
//    }

    function withdrawNft(uint256 tokenId) external {
        require(msg.sender == originalOwner[tokenId], "Game: Only original owner can withdraw");

        itemNft.safeTransferFrom(address(this), msg.sender, tokenId);
        originalOwner[tokenId] = address(0);
    }

    function claimReward(uint256 tokenId) external {
        require(msg.sender == originalOwner[tokenId], "Game: Only original owner can claim reward");

        uint256 timePassed = block.timestamp - claimedTime[tokenId];
        uint256 rewardToClaim = timePassed / stakePeriod * CLAIM_REWARD;
        if (rewardToClaim > 0) {
            sendReward(msg.sender, rewardToClaim);

            uint256 unclaimedTime = timePassed % stakePeriod;
            claimedTime[tokenId] = block.timestamp - unclaimedTime;
        }
    }

    function sendReward(address to, uint256 amount) internal {
        rewardToken.mint(amount);
        rewardToken.transfer(to, amount);
    }
}