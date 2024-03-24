// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.0;

contract Game {
    enum Level {
        beginer,
        middle,
        addvanced
    }

    struct Player {
        address account;
        string name;
        uint age;
        Level level;
    }
    mapping(address => Player) public players;

    function addPlayer(address account, string memory name, uint age) external {
        players[msg.sender] = Player(account, name, age, Level.addvanced);
    }
}
