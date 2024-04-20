// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IStaking {
    function stake(uint256 amount) external;

    function unStake(uint256 amount) external;

    function claimReward(uint256 amount) external returns (uint256);

    function calculateReward(address stakerAddress) external returns (uint256);
}

contract StakingTrial is IStaking {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;

    struct Staker {
        uint256 totalStaked;
        uint256 reward;
        uint256 lastStakedTime;
    }

    mapping(address => Staker) public stakers;
    uint256 constant rewardRate = 100;
    uint256 public constant stakingDuration = 3 minutes;

    constructor(IERC20 token) {
        stakingToken = token;
    }

    function stake(uint256 amount) external {
        require(
            stakingToken.balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        Staker storage staker = stakers[msg.sender];

        staker.reward = staker.reward;
        staker.totalStaked = staker.totalStaked + amount;
        staker.lastStakedTime = block.timestamp;
    }

    function unStake(uint256 amount) external {}

    function calculateReward(
        address stakerAddress
    ) public view returns (uint256) {
        Staker storage staker = stakers[stakerAddress];
        uint256 stakingTimeElapsed = block.timestamp - staker.lastStakedTime;

        return
            staker.totalStaked *
            (stakingTimeElapsed / stakingDuration) *
            rewardRate;
    }

    function claimReward() public view returns (uint256) {
        Staker storage staker = stakers[stakerAddress];
        uint256 reward = calculateReward(staker.totalStaked);

        
    }
}
