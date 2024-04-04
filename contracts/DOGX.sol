//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface IDogx {
    function mint(
        address to,
        string memory tokenURI
    ) external returns (uint256);
}

contract DOGX is ERC721Enumerable, Ownable, AccessControlEnumerable, IDogx {
    uint256 private _tokenIdTracker;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    mapping(uint256 tokenID => string) private _tokenURIs;

    event Mint(address to, string tokenURI, uint256 tokenid);

    constructor(
        address initOwner
    ) ERC721("Baby Boo Dogx", "DOGX") Ownable(initOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(
        address to,
        string memory tokenURI
    ) external override returns (uint256) {
        require(
            owner() == _msgSender() || hasRole(MINTER_ROLE, _msgSender()),
            "Caller is not a minter"
        );
        _tokenIdTracker += 1;
        uint256 token_id = _tokenIdTracker;
        _mint(to, token_id);
        _tokenURIs[token_id] = tokenURI;
        emit Mint(to, tokenURI, token_id);
        return token_id;
    }

    function listTokenIds(
        address owner
    ) external view returns (uint256[] memory tokenIds) {
        uint balance = balanceOf(owner);
        uint256[] memory ids = new uint256[](balance);

        for (uint i = 0; i < balance; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return (ids);
    }

    // return URI token ID load img, info for tokenID
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token ID does not exist");
        return _tokenURIs[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721Enumerable, AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
