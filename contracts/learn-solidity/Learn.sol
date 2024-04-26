// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "hardhat/console.sol";

contract Payale {
    address public owner;
    mapping(address => uint256) balances;

    event Log(address account, uint256 balance);
    
    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] = msg.value;
    }

    function withdraw(address payable to, uint256 amount) external {
        (bool success, ) = to.call{value: amount}("");
         require(success, "Failed to send Ether");
    }

    function balanceOf(address account) external view returns (uint256) {
        return account.balance;
    }
}
