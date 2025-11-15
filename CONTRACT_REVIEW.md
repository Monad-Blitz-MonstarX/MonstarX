# 컨트랙트 코드 점검 보고서

## 1. 질문 답변: 더미데이터 vs 실제 거래

### 현재 구조
- **프론트엔드 (UI)**: 더미 데이터 사용
  - 리더보드: `mockData.ts`의 `mockYappers`
  - 차트: `generateMockYapData()`로 생성된 더미 데이터
  - 목적: UI 개발 및 데모용

- **스마트 컨트랙트 (실제 거래)**: 오라클 가격 기반
  - 포지션 오픈: `XIndexOracle.getPrice()`로 현재 가격 조회
  - 포지션 종료: 오라클의 최신 가격으로 PnL 계산
  - 가격 업데이트: 백엔드 스크립트가 `updateIndex()` 호출

### 결론
✅ **맞습니다!** 
- UI는 더미 데이터로 표시되지만
- 실제 Long/Short 포지션은 **오라클의 실시간 가격 변화**에 따라 PnL이 계속 변화합니다
- 오라클 가격이 업데이트되면 포지션의 수익/손실이 실시간으로 반영됩니다

---

## 2. 컨트랙트 코드 점검

### ✅ 정상 작동하는 부분

1. **기본 구조**
   - ✅ XIndexOracle과 MonstarPerps 분리 (관심사 분리)
   - ✅ immutable 키워드로 가스 최적화
   - ✅ receive() 함수로 편리한 유동성 추가

2. **LP 기능**
   - ✅ `addLiquidity()`: 유동성 추가 정상
   - ✅ `removeLiquidity()`: 유동성 제거 정상
   - ✅ 잔액 검증 로직 정상

3. **포지션 기능**
   - ✅ `openPosition()`: 포지션 오픈 로직 정상
   - ✅ `closePosition()`: PnL 계산 및 정산 정상
   - ✅ 인플루언서 자신 베팅 차단 정상

4. **수수료 구조**
   - ✅ LP 수수료 0.1% 정상
   - ✅ 인플루언서 수수료 0.2% 정상
   - ✅ 수수료 분배 로직 정상

5. **PnL 계산**
   - ✅ `_calculatePnl()` 함수 로직 정확
   - ✅ 롱/숏 방향 처리 정상
   - ✅ 손실 시 전액 손실 처리 정상

### ⚠️ 발견된 문제점

#### 1. **중요: 수수료 분배 로직 버그**
```solidity
// 현재 코드 (문제 있음)
totalLiquidity -= finalAmount;  // 최종 지급액 차감
// ... 수수료 분배 ...
```

**문제**: `finalAmount`에는 이미 수수료가 차감되어 있는데, 수수료를 다시 분배하려고 하면 `totalLiquidity`가 중복 차감될 수 있습니다.

**수정 필요**: 수수료 분배 로직을 `finalAmount` 계산 전에 처리하거나, `totalLiquidity` 조정 로직을 수정해야 합니다.

#### 2. **인플루언서 주소 설정 보안**
```solidity
function setInfluencerAddress(...) public {
    // TODO: 실제 운영 시에는 onlyOwner 수정자 추가 필요
}
```

**문제**: 누구나 인플루언서 주소를 설정할 수 있어 보안 위험

**권장**: `onlyOwner` 수정자 추가 또는 별도의 권한 관리 시스템 필요

#### 3. **가스 최적화: Position 구조체**
```solidity
struct Position {
    uint256 id;        // 중복 (mapping key와 동일)
    uint256 timestamp; // 사용되지 않음
}
```

**권장**: `id`와 `timestamp` 제거하여 가스 절약 가능 (선택사항)

### ✅ 배포 가능 여부

**결론: 배포 가능하지만 수수료 분배 로직 수정 권장**

현재 코드로도 기본 기능은 작동하지만, 수수료 분배 부분에서 `totalLiquidity` 관리가 명확하지 않을 수 있습니다.

---

## 3. 배포 방법

### 방법 1: Hardhat 사용 (권장)

#### 1. Hardhat 설치
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

#### 2. `hardhat.config.js` 설정
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY] // .env 파일에 저장
    }
  }
};
```

#### 3. 배포 스크립트 작성 (`scripts/deploy.js`)
```javascript
const hre = require("hardhat");

async function main() {
  // 1. XIndexOracle 배포
  const XIndexOracle = await hre.ethers.getContractFactory("XIndexOracle");
  const oracle = await XIndexOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("XIndexOracle deployed to:", oracleAddress);

  // 2. MonstarPerps 배포 (Oracle 주소 전달)
  const MonstarPerps = await hre.ethers.getContractFactory("MonstarPerps");
  const perps = await MonstarPerps.deploy(oracleAddress);
  await perps.waitForDeployment();
  const perpsAddress = await perps.getAddress();
  console.log("MonstarPerps deployed to:", perpsAddress);

  // 3. 초기 가격 설정 (예시)
  // await oracle.updateIndex("1", ethers.parseUnits("125.5", 0));
  // await oracle.updateIndex("2", ethers.parseUnits("98.3", 0));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 4. 배포 실행
```bash
# .env 파일 생성
echo "PRIVATE_KEY=your_private_key_here" > .env

# 배포
npx hardhat run scripts/deploy.js --network monadTestnet
```

### 방법 2: Foundry 사용

#### 1. Foundry 설치
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### 2. 프로젝트 초기화
```bash
forge init --force
```

#### 3. 컨트랙트 복사
```bash
cp src/contracts/*.sol src/
```

#### 4. 배포 스크립트 작성 (`script/Deploy.s.sol`)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {XIndexOracle} from "../src/XIndexOracle.sol";
import {MonstarPerps} from "../src/MonstarPerps.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Oracle 배포
        XIndexOracle oracle = new XIndexOracle();
        
        // 2. Perps 배포
        MonstarPerps perps = new MonstarPerps(address(oracle));
        
        vm.stopBroadcast();
    }
}
```

#### 5. 배포 실행
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url https://testnet-rpc.monad.xyz --broadcast --verify
```

### 방법 3: Remix 사용 (가장 간단)

1. [Remix IDE](https://remix.ethereum.org) 접속
2. 새 파일 생성: `XIndexOracle.sol`, `MonstarPerps.sol`
3. 코드 복사/붙여넣기
4. 컴파일러: Solidity 0.8.20 선택
5. 컴파일
6. 배포 탭에서:
   - Environment: Injected Provider (MetaMask)
   - MetaMask에서 Monad Testnet 연결
   - XIndexOracle 먼저 배포
   - MonstarPerps 배포 (생성자에 Oracle 주소 입력)

---

## 4. 배포 후 필수 작업

### 1. 초기 가격 설정
```javascript
// Oracle 컨트랙트의 owner로
await oracle.updateIndex("1", ethers.parseUnits("125", 0)); // Haseeb
await oracle.updateIndex("2", ethers.parseUnits("98", 0));  // Simon
// ... 각 인플루언서마다
```

### 2. 인플루언서 주소 설정
```javascript
await perps.setInfluencerAddress("1", "0x...influencerAddress");
```

### 3. 초기 유동성 공급
```javascript
// Vault 주소로 30 MON 전송
await perps.addLiquidity({ value: ethers.parseUnits("30", 18) });
```

### 4. 프론트엔드 설정 업데이트
`src/config/monad.ts`에서 배포된 주소로 업데이트:
```typescript
export const INFLUENCER_VAULT_ADDRESS = '0x...배포된_MonstarPerps_주소...'
```

---

## 5. 테스트 체크리스트

배포 후 다음을 테스트하세요:

- [ ] Oracle 가격 업데이트 작동 확인
- [ ] LP 유동성 추가/제거 작동 확인
- [ ] 포지션 오픈 (롱/숏) 작동 확인
- [ ] 포지션 종료 및 PnL 계산 정확성 확인
- [ ] 수수료 분배 정확성 확인
- [ ] 인플루언서 자신 베팅 차단 확인
- [ ] receive() 함수로 자동 유동성 추가 확인

