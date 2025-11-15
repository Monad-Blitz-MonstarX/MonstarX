# Monstar X - Social-Fi Trading Platform

인플루언서의 영향력을 거래할 수 있는 소셜 파이(Social-Fi) 플랫폼입니다.

## 기능

- **리더보드**: 상위 야퍼(Yapper)들의 리스트와 Yap 개수 확인
- **Yap 차트**: 30일간의 Yap 개수 변화율 시각화 (전날 대비 %)
- **롱/숏 거래**: 특정 인플루언서의 미래 Yap 개수에 베팅
- **Vault 시스템**: 각 인플루언서마다 독립적인 Vault (초기 유동성: 60 MON)

## 기술 스택

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts (차트)
- React Router
- Lucide React (아이콘)
- Ethers.js (지갑 연결)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── components/       # 재사용 가능한 컴포넌트
│   ├── Layout.tsx
│   ├── YapperCard.tsx
│   └── YapChart.tsx
├── pages/           # 페이지 컴포넌트
│   ├── LeaderboardPage.tsx
│   ├── YapperDetailPage.tsx
│   └── MyWalletPage.tsx
├── contexts/        # Context API
│   └── WalletContext.tsx
├── data/           # 데이터 및 API 관련
│   ├── mockData.ts      # 더미 데이터 및 API 연동 공간
│   └── analyticsData.ts # 포지션 및 거래 히스토리 데이터
├── types/           # TypeScript 타입 정의
│   └── index.ts
├── config/          # 설정 파일
│   └── monad.ts     # Monad Testnet 설정 및 MON 가격
├── utils/           # 유틸리티 함수
│   └── vault.ts     # Vault 관련 유틸리티
├── App.tsx
├── main.tsx
└── index.css
```

## 주요 기능 설명

### 1. 리더보드 API 연동

**파일**: `src/data/mockData.ts`

```typescript
// TODO: 실제 API 연동 시 이 함수를 사용
export async function fetchYappersFromAPI(): Promise<Yapper[]> {
  // API 연동 코드를 여기에 작성하세요
  // 예: const response = await fetch('YOUR_API_ENDPOINT')
  // return await response.json()
  return mockYappers
}
```

### 2. Yap 데이터 API 연동

**파일**: `src/data/mockData.ts`

```typescript
// 30일 Yap 개수 차트 데이터 생성 함수 (전날 대비 % 변화)
export function generateMockYapData(yapperId: string, baseYapCount: number): YapDataPoint[] {
  // TODO: 실제 Kaito API에서 Yap 데이터를 가져와서 전날 대비 % 변화를 계산하세요
  // 예:
  // const yapData = await fetchYapDataFromKaito(yapperId)
  // return calculateChangePercentage(yapData)
}
```

### 3. 포지션 생성 및 Vault 연동

**파일**: `src/pages/YapperDetailPage.tsx`

```typescript
const handlePlaceTrade = () => {
  // TODO: 실제 트랜잭션 처리
  // 1. 사용자가 MON 토큰을 Vault에 예치
  // 2. 레버리지에 따라 포지션 크기 계산 (예: 5 MON x 3 = 15 MON 포지션)
  // 3. Vault에서 자동으로 같은 가격으로 반대 포지션 생성
  // 4. 포지션을 My Wallet에 추가
}
```

**파일**: `src/utils/vault.ts`

```typescript
// 각 인플루언서 Vault의 초기 유동성: 60 MON
export const getVaultLiquidity = (yapperId: string): number => {
  // TODO: 실제 Vault 컨트랙트에서 유동성 조회
  return VAULT_INITIAL_LIQUIDITY // 60 MON
}
```

### 4. MON 토큰 가격

**파일**: `src/config/monad.ts`

```typescript
// MON 토큰 가격: $0.045 USDC (Premarket 가격)
export const MON_PRICE_USDC = 0.045
```

## Vault 시스템

각 인플루언서마다 독립적인 Vault가 생성되며:

- **초기 유동성**: 각 Vault마다 60개 MON 토큰
- **Long 포지션**: 사용자가 MON 토큰을 예치하고 레버리지 배수만큼 포지션 생성
  - 예: 5 MON 예치 + 3x 레버리지 = 15 MON 포지션
- **Short 포지션**: Vault에서 자동으로 같은 가격으로 반대 포지션 생성
- **포지션 관리**: 
  - 활성 포지션은 My Wallet의 "활성 포지션"에 표시
  - 마감된 포지션은 "거래 히스토리"로 이동

## 네트워크 설정

- **체인**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Block Explorer**: https://testnet.monadscan.com

## 개발 체크리스트

- [ ] 리더보드 API 연동 (`src/data/mockData.ts`)
- [ ] Kaito API에서 Yap 데이터 가져오기 (`src/data/mockData.ts`)
- [ ] Vault 컨트랙트 배포 및 연동 (`src/utils/vault.ts`)
- [ ] 포지션 생성 트랜잭션 처리 (`src/pages/YapperDetailPage.tsx`)
- [ ] 포지션 마감 트랜잭션 처리 (`src/utils/vault.ts`)
- [ ] 실시간 포지션 업데이트

## 참고사항

- 현재는 Monad Testnet Token (MON)을 보유하고 있다는 가정 하에 개발되었습니다.
- 실제 자산 교환(Swap) 기능은 메인넷 출시 시 구현 예정입니다.
- MON 토큰 가격은 Premarket 가격인 $0.045 USDC로 고정되어 있습니다.
