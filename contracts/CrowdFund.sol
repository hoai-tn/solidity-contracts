// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowFund {
    event Launch(
        uint256 id,
        address indexed creator,
        uint256 goal,
        uint256 startAt,
        uint256 endAt
    );
    event Cancel(uint256 id);
    event Pledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Unpledge(uint256 indexed id, address indexed caller, uint256 amount);
    event Claim(uint256 id);
    event Refund(uint256 id, address indexed caller, uint256 amount);

    struct Campaign {
        address creator;
        string title;
        string description;
        string image;
        uint256 goal;
        // Total amount pledged
        uint256 pledged;
        uint256 startAt;
        uint256 endAt;
        // True if goal was reached and creator has claimed the tokens.
        bool claimed;
    }

    IERC20 public immutable token;
    uint256 public count;
    uint256 constant maxCampaignTime = 90 days;

    mapping(uint256 => Campaign) public campaigns;
    // Mapping from campaign id => pledger => amount pledged
    mapping(uint256 => mapping(address => uint256)) public pledgedAmount;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function launch(
        string memory _title,
        string memory _description,
        string memory _image,
        uint256 _goal,
        uint256 _startAt,
        uint256 _endAt
    ) external {
        require(_startAt < _endAt, "StartAt should less than EndAt");
        require(
            _startAt >= block.timestamp,
            "StartAt should greater than or equal block timestamp"
        );
        require(
            _endAt <= block.timestamp + maxCampaignTime,
            "EndAte should greater than max duration"
        );

        count += 1;
        campaigns[count] = Campaign({
            creator: msg.sender,
            title: _title,
            description: _description,
            image: _image,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    function cancel(uint256 _campaign) external {
        Campaign memory campaign = campaigns[_campaign];

        require(campaign.creator == msg.sender, "Msg sender is not creator");
        // if campaign started, user can't cancel
        require(block.timestamp < campaign.startAt, "Campaign stared");
        delete campaigns[_campaign];

        emit Cancel(_campaign);
    }

    function pledge(uint256 _campaign, uint256 _amount) external {
        Campaign memory campaign = campaigns[_campaign];

        require(block.timestamp > campaign.startAt, "Campaign is not started");
        require(block.timestamp >= campaign.endAt, "Campaign ended");

        campaign.pledged += _amount;
        pledgedAmount[_campaign][msg.sender] += _amount;

        token.transferFrom(msg.sender, address(this), _amount);

        emit Pledge(_campaign, msg.sender, _amount);
    }

    function unPledge(uint256 _campaign, uint256 _amount) external {
        Campaign memory campaign = campaigns[_campaign];
        require(campaign.endAt >= block.timestamp, "Campaign ended");

        campaign.pledged -= _amount;
        pledgedAmount[_campaign][msg.sender] -= _amount;

        token.transfer(msg.sender, _amount);

        emit Unpledge(_campaign, msg.sender, _amount);
    }

    function claim(uint256 _campaign) external {
        Campaign memory campaign = campaigns[_campaign];
        require(campaign.creator == msg.sender, "Msg sender is not creator");
        require(campaign.endAt > block.timestamp, "Campaign is not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;
        token.transfer(msg.sender, campaign.pledged);

        emit Claim(_campaign);
    }

    function refund(uint256 _campaign) external {
        Campaign memory campaign = campaigns[_campaign];
        require(campaign.endAt > block.timestamp, "Campaign is not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint256 amount = pledgedAmount[_campaign][msg.sender];
        pledgedAmount[_campaign][msg.sender] = 0;
        token.transfer(msg.sender, amount);

        emit Refund(_campaign, msg.sender, amount);
    }
}
