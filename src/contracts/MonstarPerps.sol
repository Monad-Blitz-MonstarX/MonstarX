// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./XIndexOracle.sol";

/**
 * @title MonstarPerps
 * @notice 메인 엔진 & 볼트 컨트랙트
 * LP 유동성 공급 및 트레이더 포지션 거래 기능 제공
 */
contract MonstarPerps {
    IXIndexOracle public immutable indexOracle;
    
    // Owner 주소
    address public owner;
    
    // LP 관련 상태 변수
    uint256 public totalLiquidity;
    mapping(address => uint256) public lpBalances;
    
    // 포지션 구조체
    struct Position {
        uint256 id;
        address trader;
        string influencerId;
        bool isLong;
        uint256 entryPrice;
        uint256 collateral; // 증거금 (mon 단위)
        bool isOpen;
        uint256 timestamp;
        uint256 lastFundingTime; // 마지막 펀딩피 지불 시간
    }
    
    // 펀딩피 설정
    uint256 public constant FUNDING_RATE_BPS = 1; // 0.01% per hour (1 bps)
    uint256 public constant FUNDING_INTERVAL = 3600; // 1 hour in seconds
    uint256 public constant LIQUIDATION_THRESHOLD_BPS = 8000; // 80% 손실 시 청산
    
    // 포지션 관리
    mapping(uint256 => Position) public positions;
    uint256 public nextPositionId;
    
    // 수수료 설정 (기본 단위: basis points, 10000 = 100%)
    uint256 public constant LP_FEE_BPS = 10; // 0.1% = 10 bps
    uint256 public constant INFLUENCER_FEE_BPS = 20; // 0.2% = 20 bps
    uint256 public constant BASIS_POINTS = 10000;
    
    // 인플루언서 주소 매핑 (인플루언서 ID => 주소)
    mapping(string => address) public influencerAddresses;
    
    // 이벤트
    event LiquidityAdded(address indexed lp, uint256 amount);
    event LiquidityRemoved(address indexed lp, uint256 amount);
    event PositionOpened(
        uint256 indexed positionId,
        address indexed trader,
        string influencerId,
        bool isLong,
        uint256 entryPrice,
        uint256 collateral
    );
    event PositionClosed(
        uint256 indexed positionId,
        address indexed trader,
        uint256 pnl,
        uint256 finalAmount
    );
    event PositionLiquidated(
        uint256 indexed positionId,
        address indexed trader,
        uint256 loss,
        uint256 remainingCollateral
    );
    event FundingPaid(
        uint256 indexed positionId,
        address indexed trader,
        int256 fundingAmount
    );
    event InfluencerAddressSet(string indexed influencerId, address indexed influencerAddress);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event FundsTransferred(address indexed from, address indexed to, uint256 amount);
    
    /**
     * @dev 소유자만 호출 가능한 수정자
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "MonstarPerps: caller is not the owner");
        _;
    }
    
    /**
     * @dev XIndexOracle 컨트랙트 주소로 초기화
     * @param _oracleAddress XIndexOracle 컨트랙트 주소
     * @param _owner Vault owner 주소 (0x4d651981bda1f248d955337c11c0b4c090020312)
     */
    constructor(address _oracleAddress, address _owner) {
        require(_oracleAddress != address(0), "MonstarPerps: oracle address cannot be zero");
        require(_owner != address(0), "MonstarPerps: owner address cannot be zero");
        
        indexOracle = IXIndexOracle(_oracleAddress);
        owner = _owner;
        nextPositionId = 1;
        
        emit OwnershipTransferred(address(0), _owner);
    }
    
    /**
     * @notice receive 함수로 자동 유동성 추가
     * @dev 컨트랙트에 직접 ETH를 보내면 자동으로 유동성으로 추가됨
     */
    receive() external payable {
        addLiquidity();
    }
    
    /**
     * @dev 인플루언서 주소 설정 (컨트랙트 소유자만 호출 가능)
     */
    function setInfluencerAddress(string memory _influencerId, address _influencerAddress) public onlyOwner {
        influencerAddresses[_influencerId] = _influencerAddress;
        emit InfluencerAddressSet(_influencerId, _influencerAddress);
    }
    
    /**
     * @notice Owner가 컨트랙트의 MON을 인출
     * @param _to 인출할 주소
     * @param _amount 인출할 금액 (wei 단위)
     */
    function withdraw(address payable _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), "MonstarPerps: cannot withdraw to zero address");
        require(_amount > 0, "MonstarPerps: amount must be greater than 0");
        require(address(this).balance >= _amount, "MonstarPerps: insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "MonstarPerps: transfer failed");
        
        emit FundsWithdrawn(_to, _amount);
    }
    
    /**
     * @notice Owner가 컨트랙트의 MON을 특정 주소로 전송
     * @param _to 전송할 주소
     * @param _amount 전송할 금액 (wei 단위)
     */
    function transfer(address payable _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), "MonstarPerps: cannot transfer to zero address");
        require(_amount > 0, "MonstarPerps: amount must be greater than 0");
        require(address(this).balance >= _amount, "MonstarPerps: insufficient contract balance");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "MonstarPerps: transfer failed");
        
        emit FundsTransferred(address(this), _to, _amount);
    }
    
    /**
     * @notice Owner 변경
     * @param _newOwner 새로운 owner 주소
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "MonstarPerps: new owner is the zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
    
    /**
     * @notice LP가 볼트에 mon을 예치
     */
    function addLiquidity() public payable {
        require(msg.value > 0, "MonstarPerps: amount must be greater than 0");
        
        lpBalances[msg.sender] += msg.value;
        totalLiquidity += msg.value;
        
        emit LiquidityAdded(msg.sender, msg.value);
    }
    
    /**
     * @notice LP가 예치했던 mon을 인출
     * @param _amount 인출할 금액
     */
    function removeLiquidity(uint256 _amount) public {
        require(_amount > 0, "MonstarPerps: amount must be greater than 0");
        require(
            lpBalances[msg.sender] >= _amount,
            "MonstarPerps: insufficient balance"
        );
        require(
            address(this).balance >= _amount,
            "MonstarPerps: insufficient contract balance"
        );
        
        lpBalances[msg.sender] -= _amount;
        totalLiquidity -= _amount;
        
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "MonstarPerps: transfer failed");
        
        emit LiquidityRemoved(msg.sender, _amount);
    }
    
    /**
     * @notice PnL 계산 내부 함수
     * @param position 포지션 정보
     * @param currentPrice 현재 가격
     * @return PnL (양수면 수익, 음수면 손실)
     */
    function _calculatePnl(
        Position memory position,
        uint256 currentPrice
    ) internal pure returns (int256) {
        int256 delta = int256(currentPrice) - int256(position.entryPrice);
        
        // 숏 포지션인 경우 delta 부호 반전
        if (!position.isLong) {
            delta = -delta;
        }
        
        // PnL = (가격 변화율) * 증거금
        return (delta * int256(position.collateral)) / int256(position.entryPrice);
    }
    
    /**
     * @notice 트레이더가 롱/숏 포지션을 오픈
     * @param _influencerId 인플루언서 ID
     * @param _isLong true면 롱, false면 숏
     */
    function openPosition(string memory _influencerId, bool _isLong) public payable {
        require(msg.value > 0, "MonstarPerps: collateral must be greater than 0");
        
        // 인플루언서 자신은 베팅 불가
        address influencerAddr = influencerAddresses[_influencerId];
        require(
            influencerAddr == address(0) || msg.sender != influencerAddr,
            "MonstarPerps: influencer cannot bet on themselves"
        );
        
        // 현재 가격 조회
        uint256 currentPrice = indexOracle.getPrice(_influencerId);
        require(currentPrice > 0, "MonstarPerps: price not available");
        
        // 포지션 생성
        Position memory newPosition = Position({
            id: nextPositionId,
            trader: msg.sender,
            influencerId: _influencerId,
            isLong: _isLong,
            entryPrice: currentPrice,
            collateral: msg.value,
            isOpen: true,
            timestamp: block.timestamp,
            lastFundingTime: block.timestamp
        });
        
        positions[nextPositionId] = newPosition;
        
        // 증거금을 볼트에 추가
        totalLiquidity += msg.value;
        
        emit PositionOpened(
            nextPositionId,
            msg.sender,
            _influencerId,
            _isLong,
            currentPrice,
            msg.value
        );
        
        nextPositionId++;
    }
    
    /**
     * @notice 포지션을 종료하고 수익/손실 정산
     * @param _positionId 포지션 ID
     */
    function closePosition(uint256 _positionId) public {
        Position storage position = positions[_positionId];
        
        require(position.isOpen, "MonstarPerps: position already closed");
        require(position.trader == msg.sender, "MonstarPerps: not your position");
        
        // 현재 가격 조회
        uint256 currentPrice = indexOracle.getPrice(position.influencerId);
        require(currentPrice > 0, "MonstarPerps: price not available");
        
        // PnL 계산 (간단한 내부 함수 사용)
        int256 signedPnl = _calculatePnl(position, currentPrice);
        
        // 수수료 계산
        uint256 lpFee = (position.collateral * LP_FEE_BPS) / BASIS_POINTS;
        uint256 influencerFee = (position.collateral * INFLUENCER_FEE_BPS) / BASIS_POINTS;
        uint256 totalFee = lpFee + influencerFee;
        
        // PnL 적용 후 금액 계산 (수수료 제외)
        uint256 amountAfterPnl;
        if (signedPnl >= 0) {
            // 수익인 경우
            amountAfterPnl = position.collateral + uint256(signedPnl);
        } else {
            // 손실인 경우
            uint256 loss = uint256(-signedPnl);
            if (loss >= position.collateral) {
                amountAfterPnl = 0; // 전액 손실
            } else {
                amountAfterPnl = position.collateral - loss;
            }
        }
        
        // 최종 지급액 = PnL 적용 후 금액 - 수수료
        uint256 finalAmount = amountAfterPnl >= totalFee ? amountAfterPnl - totalFee : 0;
        
        // 포지션 종료
        position.isOpen = false;
        
        // 수수료 분배
        // LP 수수료는 totalLiquidity에 남겨두어 LP들에게 분배 (이미 totalLiquidity에 포함됨)
        // 인플루언서 수수료는 해당 인플루언서 주소로 전송
        address influencerAddr = influencerAddresses[position.influencerId];
        if (influencerAddr != address(0) && influencerFee > 0) {
            (bool success, ) = payable(influencerAddr).call{value: influencerFee}("");
            if (!success) {
                // 전송 실패 시 볼트에 남김
                totalLiquidity += influencerFee;
            }
        } else if (influencerFee > 0) {
            // 인플루언서 주소가 없으면 볼트에 남김
            totalLiquidity += influencerFee;
        }
        
        // 볼트에서 최종 지급액 차감
        require(
            totalLiquidity >= finalAmount,
            "MonstarPerps: insufficient liquidity"
        );
        totalLiquidity -= finalAmount;
        
        // 트레이더에게 최종 지급액 전송
        if (finalAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: finalAmount}("");
            require(success, "MonstarPerps: transfer failed");
        }
        
        emit PositionClosed(_positionId, msg.sender, signedPnl >= 0 ? uint256(signedPnl) : 0, finalAmount);
    }
    
    /**
     * @notice 컨트랙트 잔액 조회
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice LP 잔액 조회
     */
    function getLpBalance(address _lp) public view returns (uint256) {
        return lpBalances[_lp];
    }
    
    /**
     * @notice 포지션 정보 조회
     */
    function getPosition(uint256 _positionId) public view returns (Position memory) {
        return positions[_positionId];
    }
    
    /**
     * @notice 펀딩피 계산 및 지불
     * @param _positionId 포지션 ID
     * @return fundingAmount 펀딩피 금액 (양수면 받음, 음수면 지불)
     */
    function payFunding(uint256 _positionId) public returns (int256) {
        Position storage position = positions[_positionId];
        require(position.isOpen, "MonstarPerps: position not open");
        
        // 펀딩피 간격 확인
        uint256 timeSinceLastFunding = block.timestamp - position.lastFundingTime;
        if (timeSinceLastFunding < FUNDING_INTERVAL) {
            return 0; // 아직 펀딩피 지불 시간이 아님
        }
        
        // 롱/숏 비율 계산 (간단화: 롱이 많으면 롱이 숏에게 지불)
        // 실제로는 전체 롱/숏 비율을 계산해야 하지만, 여기서는 단순화
        uint256 fundingPeriods = timeSinceLastFunding / FUNDING_INTERVAL;
        
        // 펀딩피 계산 (롱이 숏에게 지불하는 구조)
        int256 fundingAmount;
        if (position.isLong) {
            // 롱 포지션: 펀딩피 지불 (음수)
            fundingAmount = -int256((position.collateral * FUNDING_RATE_BPS * fundingPeriods) / BASIS_POINTS);
        } else {
            // 숏 포지션: 펀딩피 수령 (양수)
            fundingAmount = int256((position.collateral * FUNDING_RATE_BPS * fundingPeriods) / BASIS_POINTS);
        }
        
        // 펀딩피 적용
        if (fundingAmount < 0) {
            // 롱이 지불: 증거금에서 차감
            uint256 payment = uint256(-fundingAmount);
            if (payment >= position.collateral) {
                // 증거금 부족 시 청산
                _liquidatePosition(_positionId);
                return fundingAmount;
            }
            position.collateral -= payment;
            totalLiquidity += payment; // LP에게 분배
        } else {
            // 숏이 수령: 증거금에 추가
            uint256 receipt = uint256(fundingAmount);
            require(totalLiquidity >= receipt, "MonstarPerps: insufficient liquidity for funding");
            position.collateral += receipt;
            totalLiquidity -= receipt;
        }
        
        position.lastFundingTime = block.timestamp;
        emit FundingPaid(_positionId, position.trader, fundingAmount);
        
        return fundingAmount;
    }
    
    /**
     * @notice 청산 가능 여부 확인
     * @param _positionId 포지션 ID
     * @return isLiquidatable 청산 가능 여부
     * @return currentPnL 현재 PnL
     */
    function checkLiquidation(uint256 _positionId) public view returns (bool isLiquidatable, int256 currentPnL) {
        Position memory position = positions[_positionId];
        if (!position.isOpen) {
            return (false, 0);
        }
        
        uint256 currentPrice = indexOracle.getPrice(position.influencerId);
        if (currentPrice == 0) {
            return (false, 0);
        }
        
        currentPnL = _calculatePnl(position, currentPrice);
        
        // 손실률 계산
        if (currentPnL < 0) {
            uint256 loss = uint256(-currentPnL);
            uint256 lossPercentage = (loss * BASIS_POINTS) / position.collateral;
            isLiquidatable = lossPercentage >= LIQUIDATION_THRESHOLD_BPS;
        } else {
            isLiquidatable = false;
        }
        
        return (isLiquidatable, currentPnL);
    }
    
    /**
     * @notice 포지션 청산 (내부 함수)
     * @param _positionId 포지션 ID
     */
    function _liquidatePosition(uint256 _positionId) internal {
        Position storage position = positions[_positionId];
        require(position.isOpen, "MonstarPerps: position already closed");
        
        uint256 currentPrice = indexOracle.getPrice(position.influencerId);
        require(currentPrice > 0, "MonstarPerps: price not available");
        
        int256 signedPnl = _calculatePnl(position, currentPrice);
        uint256 loss = signedPnl < 0 ? uint256(-signedPnl) : 0;
        
        // 청산 시 남은 증거금 (20% 또는 0)
        uint256 remainingCollateral = loss >= position.collateral 
            ? 0 
            : position.collateral - loss;
        
        // 포지션 종료
        position.isOpen = false;
        
        // 볼트에서 차감
        if (remainingCollateral > 0) {
            require(totalLiquidity >= remainingCollateral, "MonstarPerps: insufficient liquidity");
            totalLiquidity -= remainingCollateral;
            (bool success, ) = payable(position.trader).call{value: remainingCollateral}("");
            require(success, "MonstarPerps: transfer failed");
        }
        
        emit PositionLiquidated(_positionId, position.trader, loss, remainingCollateral);
    }
    
    /**
     * @notice 포지션 청산 (외부 호출)
     * @param _positionId 포지션 ID
     */
    function liquidatePosition(uint256 _positionId) external {
        (bool isLiquidatable, ) = checkLiquidation(_positionId);
        require(isLiquidatable, "MonstarPerps: position not liquidatable");
        _liquidatePosition(_positionId);
    }
}

/**
 * @notice XIndexOracle 인터페이스
 */
interface IXIndexOracle {
    function getPrice(string memory _influencerId) external view returns (uint256);
}

