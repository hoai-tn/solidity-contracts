// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract HDZCrowdsale is Ownable {
    using SafeERC20 for IERC20;
    address payable public _wallet;

    uint256 public ETH_rate;
    uint256 public USDT_rate;

    IERC20 public token;
    IERC20 public usdtToken;

    event BuyTokenByETH(address buyer, uint256 amount);
    event BuyTokenByUSDT(address buyer, uint256 amount);
    event SetUSDTToken(IERC20 tokenAddress);
    event SetETHRate(uint256 newRate);
    event SetUSDTRate(uint256 newRate);

    constructor(
        address initOwner,
        uint256 eth_rate,
        uint256 usdt_rate,
        address payable wallet,
        IERC20 icotoken
    ) Ownable(initOwner) {
        ETH_rate = eth_rate;
        USDT_rate = usdt_rate;
        _wallet = wallet;
        token = icotoken;
    }

    function setUSDTToken(IERC20 _token) public onlyOwner {
        usdtToken = _token;
        emit SetUSDTToken(_token);
    }

    function setETHRate(uint256 new_rate) public onlyOwner {
        ETH_rate = new_rate;
        emit SetETHRate(new_rate);
    }

    function setUSDTRate(uint256 new_rate) public onlyOwner {
        USDT_rate = new_rate;
        emit SetUSDTRate(new_rate);
    }

    function buyTokenByETH() external payable {
        uint256 ethAmount = msg.value;
        uint256 amount = getTokenAmountETH(ethAmount);

        require(amount > 0, "Amount is zero");
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient account balance"
        );

        payable(_wallet).transfer(ethAmount);
        SafeERC20.safeTransfer(token, msg.sender, amount);

        emit BuyTokenByETH(msg.sender, amount);
    }

    function byTokenByUSDT(uint256 USDTAmount) external {
        uint256 amount = getTokenAmountUSDT(USDTAmount);
        
        require(amount > 0, "Amount is zero");
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient account balance"
        );

        SafeERC20.safeTransferFrom(usdtToken, msg.sender, _wallet, USDTAmount);
        SafeERC20.safeTransfer(token, msg.sender, amount);

        emit BuyTokenByUSDT(msg.sender, amount);
    }

    function getTokenAmountUSDT(
        uint256 _usdtAmount
    ) public view returns (uint256) {
        return _usdtAmount * USDT_rate;
    }

    function getTokenAmountETH(
        uint256 _ethAmount
    ) public view returns (uint256) {
        return _ethAmount * ETH_rate;
    }
}
