// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract XIndexOracle {
    address public owner;
    mapping(string => uint256) public indexPrices;

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function updateIndex(string memory influencerId, uint256 newPrice) external onlyOwner {
        indexPrices[influencerId] = newPrice;
    }

    function getPrice(string memory influencerId) external view returns (uint256) {
        return indexPrices[influencerId];
    }
}