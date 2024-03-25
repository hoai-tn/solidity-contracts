// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // when tranfer is fail it will be revert
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "hardhat/console.sol";

contract Vault is Ownable, AccessControlEnumerable {
    IERC20 private token; // create to upgrade new token
    uint256 public maxWithdrawAmount;
    bool public withdrawEnable;
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

    constructor(address initOwnerAddress) Ownable(initOwnerAddress) {
        _grantRole(WITHDRAWER_ROLE, _msgSender());
    }

    function setWithdrawEnable(bool _isEnable) public onlyOwner {
        withdrawEnable = _isEnable;
    }

    function setMaxWithdrawAmount(uint256 _maxAmount) public onlyOwner {
        maxWithdrawAmount = _maxAmount;
    }

    function setToken(IERC20 _token) public onlyOwner {
        token = _token;
    }

    function withdraw(address _to, uint256 _amount) external onlyWithdrawer {
        require(withdrawEnable, "With draw is not enable");
        require(_amount <= maxWithdrawAmount, "Exceed maximum amount");
        token.transfer(_to, _amount);
    }

    function deposit(uint256 _amount) external {
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient account balance"
        );
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), _amount);
    }

    modifier onlyWithdrawer() {
        require(
            owner() == _msgSender() || hasRole(WITHDRAWER_ROLE, _msgSender()),
            "Caller is not a withdrawer"
        );
        _;
    }
}
