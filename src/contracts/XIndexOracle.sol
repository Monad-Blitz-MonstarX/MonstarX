// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title XIndexOracle
 * @notice X 지수 가격 정보를 저장하고 업데이트하는 오라클 컨트랙트
 */
contract XIndexOracle {
    address public owner;
    
    // 인플루언서 ID => X 지수 가격 매핑
    mapping(string => uint256) public indexPrices;
    
    // 가격 업데이트 이벤트
    event PriceUpdated(string indexed influencerId, uint256 oldPrice, uint256 newPrice);
    
    // 소유자 변경 이벤트
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    /**
     * @dev 컨트랙트 배포 시 호출자를 owner로 설정
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    /**
     * @dev 소유자만 호출 가능한 수정자
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "XIndexOracle: caller is not the owner");
        _;
    }
    
    /**
     * @notice X 지수 가격을 업데이트 (백엔드 스크립트가 호출)
     * @param _influencerId 인플루언서 ID (예: "vitalik", "monad")
     * @param _newPrice 새로운 X 지수 가격
     */
    function updateIndex(string memory _influencerId, uint256 _newPrice) public onlyOwner {
        uint256 oldPrice = indexPrices[_influencerId];
        indexPrices[_influencerId] = _newPrice;
        emit PriceUpdated(_influencerId, oldPrice, _newPrice);
    }
    
    /**
     * @notice 여러 인플루언서의 가격을 한 번에 업데이트
     * @param _influencerIds 인플루언서 ID 배열
     * @param _newPrices 새로운 가격 배열
     */
    function updateMultipleIndices(
        string[] memory _influencerIds,
        uint256[] memory _newPrices
    ) public onlyOwner {
        require(
            _influencerIds.length == _newPrices.length,
            "XIndexOracle: arrays length mismatch"
        );
        
        for (uint256 i = 0; i < _influencerIds.length; i++) {
            uint256 oldPrice = indexPrices[_influencerIds[i]];
            indexPrices[_influencerIds[i]] = _newPrices[i];
            emit PriceUpdated(_influencerIds[i], oldPrice, _newPrices[i]);
        }
    }
    
    /**
     * @notice 현재 X 지수 가격을 조회
     * @param _influencerId 인플루언서 ID
     * @return 현재 가격
     */
    function getPrice(string memory _influencerId) public view returns (uint256) {
        return indexPrices[_influencerId];
    }
    
    /**
     * @notice 소유자 변경
     * @param _newOwner 새로운 소유자 주소
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "XIndexOracle: new owner is the zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}

