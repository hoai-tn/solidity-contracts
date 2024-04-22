// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

interface IStaking {
    function stake(uint256 amount) external;

    function unStake(uint256 amount) external;

    function claimReward() external;

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
    uint256 constant rewardRate = 5;
    uint256 public constant stakingDuration = 30 days;

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

        staker.reward = calculateReward(msg.sender);
        staker.totalStaked = staker.totalStaked + amount;
        staker.lastStakedTime = block.timestamp;
    }

    function unStake(uint256 amount) external {
        Staker storage staker = stakers[msg.sender];
        require(staker.totalStaked >= amount, "No have enough token");

        staker.reward = staker.reward + calculateReward(msg.sender);
        staker.totalStaked = staker.totalStaked - amount;
        staker.lastStakedTime = block.timestamp;

        stakingToken.safeTransfer(msg.sender, amount);
    }

    function calculateReward(
        address stakerAddress
    ) public view returns (uint256) {
        uint256 year = 365 days;
        Staker storage staker = stakers[stakerAddress];
        uint256 stakingTimeElapsed = block.timestamp - staker.lastStakedTime;
        uint256 remainingRewards = (staker.totalStaked * rewardRate) / 100;
        uint256 stakingTimeRate = (remainingRewards * stakingTimeElapsed) /
            year;

        return stakingTimeRate;
    }

    function claimReward() public {
        Staker storage staker = stakers[msg.sender];
        uint256 reward = staker.reward + calculateReward(msg.sender);
        require(reward > 0, "No reward to claim");

        stakingToken.safeTransfer(msg.sender, reward);

        staker.reward = 0;
        staker.lastStakedTime = block.timestamp;
    }
}
