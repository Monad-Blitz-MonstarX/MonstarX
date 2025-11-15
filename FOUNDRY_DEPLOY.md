# Foundry로 Monad Testnet 배포 가이드

## Monad Testnet 정보
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **ChainID**: `10143` (Decimal) / `0x279F` (Hex)

## 배포 전 준비사항

### 1. Foundry 설치 확인
```bash
forge --version
```

만약 설치되어 있지 않다면:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
PRIVATE_KEY=여기에_배포용_프라이빗_키_입력
```

⚠️ **주의**: `.env` 파일은 `.gitignore`에 추가되어 있어야 합니다. 절대 공개 저장소에 커밋하지 마세요!

### 3. 계정에 MON 토큰 확인
배포를 위해서는 배포 계정에 MON (Monad Testnet의 네이티브 토큰)이 있어야 합니다.
- Monad Testnet Faucet에서 테스트 토큰을 받으세요.

## 배포 명령어

### 컨트랙트 빌드
```bash
forge build
```

### Monad Testnet에 배포
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --verify \
  --chain-id 10143 \
  -vvvv
```

또는 환경 변수를 사용하여:
```bash
source .env
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MONAD_TESTNET_RPC \
  --broadcast \
  --verify \
  --chain-id 10143 \
  -vvvv
```

### 배포만 하고 검증은 나중에
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --chain-id 10143 \
  -vvvv
```

## 배포 후 확인

배포가 성공하면 다음과 같은 정보가 출력됩니다:
- XIndexOracle 컨트랙트 주소
- MonstarPerps 컨트랙트 주소

이 주소들을 `src/config/monad.ts` 파일에 업데이트하세요.

## 다음 단계

### 1. 컨트랙트 주소 업데이트
`src/config/monad.ts` 파일을 업데이트:
```typescript
export const INFLUENCER_VAULT_ADDRESS = '0x...배포된_MonstarPerps_주소...'
export const X_INDEX_ORACLE_ADDRESS = '0x...배포된_XIndexOracle_주소...'
```

### 2. 초기 유동성 추가
Foundry console 사용:
```bash
forge script script/AddLiquidity.s.sol:AddLiquidityScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --chain-id 10143
```

또는 cast를 사용하여 직접 호출:
```bash
cast send <MonstarPerps_주소> \
  "addLiquidity()" \
  --value 30ether \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY
```

### 3. 인플루언서 주소 설정
```bash
cast send <MonstarPerps_주소> \
  "setInfluencerAddress(string,address)" \
  "1" "0x인플루언서_주소" \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY
```

### 4. 초기 가격 설정
```bash
cast send <XIndexOracle_주소> \
  "updateIndex(string,uint256)" \
  "1" "125" \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY
```

## 문제 해결

### "insufficient funds" 오류
- 배포 계정에 충분한 MON 토큰이 있는지 확인하세요.

### "nonce too low" 오류
- 네트워크 연결을 확인하고 잠시 후 다시 시도하세요.

### "contract verification failed" 오류
- 컴파일러 버전과 설정이 올바른지 확인하세요.
- `foundry.toml`의 `solc_version`이 컨트랙트와 일치하는지 확인하세요.

## Foundry vs Hardhat

현재 프로젝트에는 Hardhat 설정(`hardhat.config.js`)도 있지만, Foundry를 사용하는 경우:
- `forge` 명령어 사용
- `script/` 디렉토리에 `.s.sol` 스크립트 작성
- `foundry.toml` 설정 파일 사용

두 가지 모두 사용 가능하지만, Foundry를 선호한다면 Foundry로 통일하는 것을 권장합니다.

