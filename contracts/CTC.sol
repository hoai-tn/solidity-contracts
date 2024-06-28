// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CTC is ERC20, ERC20Burnable, Ownable {
    uint private cap = 40_000_000_000 * 10 ** uint256(18);

    constructor(
        address initialOwner
    ) ERC20("Cat Cute", "CTC") Ownable(initialOwner) {
        _mint(initialOwner, cap);
    }
}
