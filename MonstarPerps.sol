// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./XIndexOracle.sol";

contract MonstarPerps {
    XIndexOracle public immutable indexOracle;
    uint256 public totalLiquidity;
    uint256 public tradingFeeBps = 10; // 0.1%
    uint256 public nextPositionId = 1;

    mapping(address => uint256) public lpBalances;

    struct Position {
        address owner;
        string influencerId;
        bool isLong;
        uint256 entryPrice;
        uint256 collateral;
        bool isOpen;
    }

    mapping(uint256 => Position) public positions;

    event LiquidityAdded(address indexed lp, uint256 amount);
    event LiquidityRemoved(address indexed lp, uint256 amount);
    event PositionOpened(
        uint256 indexed id,
        address indexed owner,
        string influencerId,
        bool isLong,
        uint256 collateral,
        uint256 entryPrice
    );
    event PositionClosed(
        uint256 indexed id,
        address indexed owner,
        int256 pnl,
        uint256 payout
    );

    constructor(address oracle) {
        indexOracle = XIndexOracle(oracle);
    }

    receive() external payable {
        addLiquidity();
    }

    function addLiquidity() public payable {
        require(msg.value > 0, "ZERO");
        lpBalances[msg.sender] += msg.value;
        totalLiquidity += msg.value;
        emit LiquidityAdded(msg.sender, msg.value);
    }

    function removeLiquidity(uint256 amount) external {
        require(lpBalances[msg.sender] >= amount, "INSUFFICIENT");
        lpBalances[msg.sender] -= amount;
        totalLiquidity -= amount;
        payable(msg.sender).transfer(amount);
        emit LiquidityRemoved(msg.sender, amount);
    }

    function openPosition(
        string memory influencerId,
        bool isLong
    ) external payable {
        require(msg.value > 0, "ZERO_COLLATERAL");

        uint256 price = indexOracle.getPrice(influencerId);
        require(price > 0, "NO_PRICE");

        positions[nextPositionId] = Position({
            owner: msg.sender,
            influencerId: influencerId,
            isLong: isLong,
            entryPrice: price,
            collateral: msg.value,
            isOpen: true
        });

        totalLiquidity += msg.value;

        emit PositionOpened(
            nextPositionId,
            msg.sender,
            influencerId,
            isLong,
            msg.value,
            price
        );
        nextPositionId++;
    }

    function closePosition(uint256 positionId) external {
        Position storage position = positions[positionId];
        require(position.isOpen, "CLOSED");
        require(position.owner == msg.sender, "NOT_OWNER");

        uint256 currentPrice = indexOracle.getPrice(position.influencerId);
        require(currentPrice > 0, "NO_PRICE");

        int256 pnl = _calculatePnl(position, currentPrice);
        uint256 fee = (position.collateral * tradingFeeBps) / 10000;
        int256 payout = int256(position.collateral) + pnl - int256(fee);

        if (payout < 0) {
            payout = 0;
        }

        uint256 payoutUint = uint256(payout);

        require(totalLiquidity >= payoutUint, "INSUFFICIENT_POOL");
        totalLiquidity -= payoutUint;

        position.isOpen = false;
        payable(position.owner).transfer(payoutUint);

        emit PositionClosed(positionId, msg.sender, pnl, payoutUint);
    }

    function _calculatePnl(
        Position memory position,
        uint256 currentPrice
    ) internal pure returns (int256) {
        int256 delta = int256(currentPrice) - int256(position.entryPrice);
        if (!position.isLong) {
            delta = -delta;
        }
        // 롱/숏 방향에 따라 단순하게 비교 (증거금 기준)
        return
            (delta * int256(position.collateral)) / int256(position.entryPrice);
    }
}
