# 스마트 컨트랙트 배포 가이드

## 개요

Monstar X 플랫폼은 두 개의 핵심 스마트 컨트랙트로 구성됩니다:

1. **XIndexOracle.sol**: X 지수 가격 정보를 저장하고 업데이트하는 오라클 컨트랙트
2. **MonstarPerps.sol**: LP 유동성 공급 및 트레이더 포지션 거래를 처리하는 메인 컨트랙트

## 배포 순서

### 1. XIndexOracle 배포

```bash
# Hardhat 또는 Foundry를 사용하여 배포
# XIndexOracle.sol을 먼저 배포하고 주소를 기록
```

**배포 후:**
- 컨트랙트 주소를 기록해두세요 (예: `0x...OracleAddress`)
- 이 주소는 MonstarPerps 배포 시 필요합니다.

### 2. MonstarPerps 배포

```bash
# MonstarPerps.sol을 배포할 때 XIndexOracle 주소를 생성자에 전달
# constructor(address _oracleAddress)
```

**배포 후:**
- 컨트랙트 주소를 기록해두세요 (예: `0x...PerpsAddress`)
- 이 주소를 `src/config/monad.ts`의 `INFLUENCER_VAULT_ADDRESS`에 설정하세요.

### 3. 초기 설정

#### 3.1 인플루언서 주소 설정

각 인플루언서의 주소를 MonstarPerps 컨트랙트에 등록해야 합니다:

```solidity
// MonstarPerps 컨트랙트의 setInfluencerAddress 함수 호출
setInfluencerAddress("influencer_id", influencer_address)
```

예시:
```javascript
// ethers.js 사용
const perpsContract = new ethers.Contract(PERPS_ADDRESS, ABI, signer);
await perpsContract.setInfluencerAddress("1", "0x...influencerAddress");
```

#### 3.2 초기 유동성 공급

Vault 주소 (`0x4d651981bda1f248d955337c11c0b4c090020312`)에 30개 MON을 예치합니다:

```javascript
// Private Key로 서명자 생성
const wallet = new ethers.Wallet(VAULT_PRIVATE_KEY, provider);
const perpsContract = new ethers.Contract(VAULT_ADDRESS, ABI, wallet);

// 30 MON 예치
const amount = ethers.parseUnits("30", 18);
await perpsContract.addLiquidity({ value: amount });
```

## 수수료 구조

- **LP 수수료**: 0.1% (거래 금액의 0.1%)
- **인플루언서 수수료**: 0.2% (거래 금액의 0.2%)
- **총 수수료**: 0.3%

## 보안 주의사항

⚠️ **중요**: 
- `VAULT_PRIVATE_KEY`는 실제 운영 환경에서는 **절대 코드에 하드코딩하지 마세요**
- 환경 변수나 보안 키 관리 서비스를 사용하세요
- Private Key가 노출되면 해당 계정의 모든 자산이 위험합니다

## 테스트

배포 후 다음 기능들을 테스트하세요:

1. ✅ LP 유동성 추가/제거
2. ✅ 포지션 오픈 (롱/숏)
3. ✅ 포지션 종료 및 PnL 정산
4. ✅ 인플루언서 자신의 베팅 차단
5. ✅ 수수료 분배 (LP + 인플루언서)

## 컨트랙트 주소 업데이트

배포가 완료되면 `src/config/monad.ts` 파일을 업데이트하세요:

```typescript
export const INFLUENCER_VAULT_ADDRESS = '0x...배포된_주소...'
export const X_INDEX_ORACLE_ADDRESS = '0x...배포된_주소...'
```

