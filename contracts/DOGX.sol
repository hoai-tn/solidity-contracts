//SPDX-License-Identifier: UNLICENSED
pragma solidity <=0.8.22;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface IDogx {
    function mint(address to, uint256 dogx_type) external returns (uint256);
}

contract DOGX is ERC721Enumerable, Ownable, AccessControlEnumerable, IDogx {
    uint256 private _tokenIdTracker;
    string private _url;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event Mint(address to, uint256 dogx_type, uint256 tokenid);

    constructor(
        address initOwner
    ) ERC721("Baby Boo Dogx", "DOGX") Ownable(initOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender);
    }

    function _baseURI()
        internal
        view
        override
        returns (string memory _newBaseURI)
    {
        return _url;
    }

    function mint(
        address to,
        uint256 dogx_type
    ) external override returns (uint256) {
        require(
            owner() == _msgSender() || hasRole(MINTER_ROLE, _msgSender()),
            "Caller is not a minter"
        );
        _tokenIdTracker += 1;
        uint256 token_id = _tokenIdTracker;
        _mint(to, token_id);
        emit Mint(to, dogx_type, token_id);
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

    function setBaseUrl(string memory _newUrl) public onlyOwner {
        _url = _newUrl;
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
