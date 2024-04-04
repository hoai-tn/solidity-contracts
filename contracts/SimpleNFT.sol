//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;


import "./ERC721.sol";
contract SimpleNFT is ERC721, ERC721Metadata {
    string public name;
    string public symbol;

    mapping(uint256 tokenID => string) private _tokenURIs;
    uint256 public tokenCount;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    // return URI token ID load img, info for tokenID
    function tokenURI(uint256 _tokenID) public view returns (string memory) {
        require(ownerOf(_tokenID) != address(0), "Token ID does not exist");
        return _tokenURIs[_tokenID];
    }

    function mint(string memory _tokenURI) public {
        tokenCount += 1;
        balances[msg.sender] += 1;
        owners[tokenCount] = msg.sender;
        _tokenURIs[tokenCount] = _tokenURI;

        emit Transfer(address(0), msg.sender, tokenCount);
    }
    function supportInterface(
        bytes4 interfaceID
    ) public pure override returns (bool) {
        return interfaceID == 0x80ac58cd || interfaceID == 0x5b5e139f;
    }
}
