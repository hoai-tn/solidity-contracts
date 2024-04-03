//SPDX-License-Identifier: UNLICENSED
pragma solidity <=0.8.22;

/* is ERC165 */
interface IERC721 {
    /// @dev This emits when ownership of any NFT changes by any mechanism.
    ///  This event emits when NFTs are created (`from` == 0) and destroyed
    ///  (`to` == 0). Exception: during contract creation, any number of NFTs
    ///  may be created and assigned without emitting Transfer. At the time of
    ///  any transfer, the approved address for that NFT (if any) is reset to none.
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );

    /// @dev This emits when the approved address for an NFT is changed or
    ///  reaffirmed. The zero address indicates there is no approved address.
    ///  When a Transfer event emits, this also indicates that the approved
    ///  address for that NFT (if any) is reset to none.
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );

    /// @dev This emits when an operator is enabled or disabled for an owner.
    ///  The operator can manage all NFTs of the owner.
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );

    /// @notice Count all NFTs assigned to an owner
    /// @dev NFTs assigned to the zero address are considered invalid, and this
    ///  function throws for queries about the zero address.
    /// @param _owner An address for whom to query the balance
    /// @return The number of NFTs owned by `_owner`, possibly zero
    function balanceOf(address _owner) external view returns (uint256);

    /// @notice Find the owner of an NFT
    /// @dev NFTs assigned to zero address are considered invalid, and queries
    ///  about them do throw.
    /// @param _tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT
    function ownerOf(uint256 _tokenId) external view returns (address);

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
    ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
    ///  `onERC721Received` on `_to` and throws if the return value is not
    ///  `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    /// @param data Additional data with no specified format, sent in call to `_to`
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) external payable;

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This works identically to the other function with an extra data parameter,
    ///  except this function just sets data to "".
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable;

    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///  THEY MAY BE PERMANENTLY LOST
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable;

    /// @notice Change or reaffirm the approved address for an NFT
    /// @dev The zero address indicates there is no approved address.
    ///  Throws unless `msg.sender` is the current NFT owner, or an authorized
    ///  operator of the current owner.
    /// @param _approved The new approved NFT controller
    /// @param _tokenId The NFT to approve
    function approve(address _approved, uint256 _tokenId) external payable;

    /// @notice Enable or disable approval for a third party ("operator") to manage
    ///  all of `msg.sender`'s assets
    /// @dev Emits the ApprovalForAll event. The contract MUST allow
    ///  multiple operators per owner.
    /// @param _operator Address to add to the set of authorized operators
    /// @param _approved True if the operator is approved, false to revoke approval
    function setApprovalForAll(address _operator, bool _approved) external;

    /// @notice Get the approved address for a single NFT
    /// @dev Throws if `_tokenId` is not a valid NFT.
    /// @param _tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    function getApproved(uint256 _tokenId) external view returns (address);

    /// @notice Query if an address is an authorized operator for another address
    /// @param _owner The address that owns the NFTs
    /// @param _operator The address that acts on behalf of the owner
    /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
    function isApprovedForAll(
        address _owner,
        address _operator
    ) external view returns (bool);
}

/// @title ERC-721 Non-Fungible Token Standard, optional metadata extension
/// @dev See https://eips.ethereum.org/EIPS/eip-721
///  Note: the ERC-165 identifier for this interface is 0x5b5e139f.
/* is ERC721 */
interface ERC721Metadata {
    /// @notice A descriptive name for a collection of NFTs in this contract
    function name() external view returns (string memory _name);

    /// @notice An abbreviated name for NFTs in this contract
    function symbol() external view returns (string memory _symbol);

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}

contract ERC721 {
    mapping(address => uint256) internal balances;
    mapping(uint256 => address) internal owners;
    mapping(address => mapping(address => bool)) private operatorApprovals; // owner => operator
    mapping(uint256 => address) private tokenApprovals;

    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );

    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "Owner address is zero");

        return balances[_owner];
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        address _owner = owners[_tokenId];
        require(_owner != address(0), "Token ID does not exist");
        return _owner;
    }

    // update an operator for all NFT
    function setApprovalForAll(address _operator, bool _approved) external {
        require(_operator != address(0), "Address is zero");

        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) public view returns (bool) {
        require(_owner != address(0), "owner address is zero");
        require(_operator != address(0), "operator address is zero");
        return operatorApprovals[_owner][_operator];
    }

    // updates an approved address for NFT
    function approve(address _approved, uint256 _tokenId) external payable {
        address _owner = ownerOf(_tokenId);
        require(
            _owner == msg.sender || isApprovedForAll(_owner, msg.sender),
            "sender is not the owner or the approved operator"
        );
        tokenApprovals[_tokenId] = _approved;
        emit Approval(_owner, _approved, _tokenId);
    }

    function getApproved(uint256 _tokenId) public view returns (address) {
        require(ownerOf(_tokenId) != address(0), "Token ID does not exist");
        return tokenApprovals[_tokenId];
    }

    // transfer ownership of a single NFT
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public payable {
        address _owner = ownerOf(_tokenId);

        require(
            msg.sender == _owner ||
                isApprovedForAll(_owner, msg.sender) ||
                msg.sender == getApproved(_tokenId),
            "Msg.sender is not owner or approved for transfer"
        );
        require(_to != address(0), "To Address is the zero address");
        require(_from == getApproved(_tokenId));

        balances[_from] -= 1;
        balances[_to] += 1;
        owners[_tokenId] = _to;

        emit Transfer(_from, _to, _tokenId);
    }

    // if sent NFT to address use transfer from
    // standard transferFrom method
    // sent NFT to smart contract use safeTramsferFrom to check if the receiver smart contract is capable of receiving NFT
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory data
    ) public payable {
        transferFrom(_from, _to, _tokenId);
        require(_checkOnERC721Received(), "Receiver is not implemented");
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    // simple version to check for NFT receivability of a smart contract
    function _checkOnERC721Received() private pure returns (bool) {
        return true;
    }

    // EIP165 proposal: query if a contract implements another interface
    function supportInterface(
        bytes4 interfaceID
    ) public pure virtual returns (bool) {
        return interfaceID == 0x80ac58cd;
    }
}
