# Monstar X - Social-Fi Trading Platform

인플루언서의 영향력을 거래할 수 있는 소셜 파이(Social-Fi) 플랫폼입니다.

## 기능

- **리더보드**: 상위 야퍼(Yapper)들의 리스트와 X 지수 확인
- **X 지수 차트**: 실시간 인플루언서 영향력 지수 시각화
- **롱/숏 거래**: 특정 인플루언서의 미래 영향력에 베팅

## 기술 스택

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts (차트)
- React Router
- Lucide React (아이콘)

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
│   └── XIndexChart.tsx
├── pages/           # 페이지 컴포넌트
│   ├── LeaderboardPage.tsx
│   └── YapperDetailPage.tsx
├── data/            # 데이터 및 API 관련
│   └── mockData.ts  # 더미 데이터 및 API 연동 공간
├── types/           # TypeScript 타입 정의
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## API 연동 가이드

### 📍 파일 위치 및 작업 공간

모든 API 연동 및 데이터 처리 로직은 다음 파일들에 구현되어 있습니다:

#### 1. 리더보드 야퍼 API 연동

**파일 위치**: `src/data/mockData.ts` (144-150줄)

**함수명**: `fetchYappersFromAPI()`

**작업 공간**:
```typescript
// TODO: 실제 API 연동 시 이 함수를 사용
export async function fetchYappersFromAPI(): Promise<Yapper[]> {
  // ⬇️ 여기에 리더보드 야퍼 API 연동 코드를 작성하세요
  // 예: 
  // const response = await fetch('YOUR_LEADERBOARD_API_ENDPOINT')
  // const data = await response.json()
  // return data.map(item => transformToYapper(item))
  
  return mockYappers
}
```

**사용 위치**: `src/pages/LeaderboardPage.tsx` (17-22줄)

리더보드 페이지에서 API를 사용하려면 주석을 해제하세요:
```typescript
// TODO: 실제 API 연동 시 이 부분을 수정하세요
const [yappers, setYappers] = useState<Yapper[]>([])
useEffect(() => {
  fetchYappersFromAPI().then(setYappers)
}, [])
// const yappers = mockYappers  // ⬅️ 이 줄을 주석 처리
```

#### 2. X 지수 계산 로직

**파일 위치**: `src/data/mockData.ts` (152-160줄)

**함수명**: `calculateXIndex()`

**작업 공간**:
```typescript
// TODO: 실제 X 지수 계산 로직을 여기에 작성
export function calculateXIndex(yapper: Partial<Yapper>): number {
  // ⬇️ 여기에 X 지수 계산 로직을 작성하세요
  // 예시:
  // const engagementRate = (yapper.smartFollowers || 0) / (yapper.followers || 1) * 100
  // const yapsScore = (yapper.totalYaps || 0) * 0.1
  // const kaitoScore = yapper.kaitoScore || 0
  // return engagementRate * 0.4 + yapsScore * 0.3 + kaitoScore * 0.3
  
  return 0
}
```

**사용 위치**: `src/pages/YapperDetailPage.tsx` (165줄 근처)

상세 페이지에서 X 지수를 계산하려면:
```typescript
// TODO: 실제 X 지수 계산 로직을 여기에 통합하세요
// 예: const calculatedIndex = calculateXIndex(yapper)
// setCurrentXIndex(calculatedIndex)
```

#### 3. X (트위터) 관련 API 연동

**새 파일 생성 권장**: `src/data/xApi.ts` 또는 `src/api/xApi.ts`

**작업 공간** (새 파일 생성):
```typescript
// src/data/xApi.ts 또는 src/api/xApi.ts

/**
 * X (트위터) API에서 인플루언서 데이터를 가져오는 함수들
 */

// Kaito API 연동 예시
export async function fetchYapperFromKaito(username: string) {
  // ⬇️ 여기에 Kaito API 연동 코드를 작성하세요
  // const response = await fetch(`KAITO_API_ENDPOINT/${username}`)
  // return await response.json()
}

// X API 연동 예시 (트위터 API v2 등)
export async function fetchXUserData(username: string) {
  // ⬇️ 여기에 X/Twitter API 연동 코드를 작성하세요
  // const response = await fetch(`X_API_ENDPOINT/users/by/username/${username}`)
  // return await response.json()
}

// 실시간 X 지수 데이터 가져오기
export async function fetchXIndexData(yapperId: string, timeframe: string) {
  // ⬇️ 여기에 X 지수 시계열 데이터 API 연동 코드를 작성하세요
  // const response = await fetch(`X_INDEX_API/${yapperId}?timeframe=${timeframe}`)
  // return await response.json()
}
```

**사용 방법**:
- `src/data/mockData.ts`에서 import하여 사용
- `src/pages/YapperDetailPage.tsx`에서 실시간 데이터 업데이트에 활용

#### 4. Monad 트랜잭션 처리

**파일 위치**: `src/pages/YapperDetailPage.tsx` (65-78줄)

**함수명**: `handlePlaceTrade()`

**작업 공간**:
```typescript
const handlePlaceTrade = async () => {
  if (!tradeAmount || parseFloat(tradeAmount) <= 0) return
  
  // ⬇️ 여기에 Monad 체인 트랜잭션 처리 로직을 작성하세요
  // 예:
  // const tx = await monadContract.placeTrade({
  //   yapperId: yapper.id,
  //   type: tradeType,
  //   amount: parseFloat(tradeAmount),
  //   leverage,
  // })
  // await tx.wait()
  
  alert(`Trade placed: ${tradeType.toUpperCase()} ${tradeAmount} USDC with ${leverage}x leverage`)
  setTradeAmount('')
}
```

**새 파일 생성 권장**: `src/utils/monad.ts` 또는 `src/contracts/monad.ts`

스마트 컨트랙트 연동을 위한 별도 파일:
```typescript
// src/utils/monad.ts 또는 src/contracts/monad.ts

/**
 * Monad 체인과의 상호작용을 위한 유틸리티 함수들
 */

export async function placeTradeOnMonad(params: {
  yapperId: string
  type: 'long' | 'short'
  amount: number
  leverage: number
}) {
  // ⬇️ 여기에 Monad 스마트 컨트랙트 호출 코드를 작성하세요
  // 예: ethers.js 또는 viem 사용
}
```

## 작업 체크리스트

- [ ] `src/data/mockData.ts` - `fetchYappersFromAPI()` 함수에 리더보드 API 연동
- [ ] `src/data/mockData.ts` - `calculateXIndex()` 함수에 X 지수 계산 로직 구현
- [ ] `src/data/xApi.ts` (새 파일) - X/Twitter API 연동 함수들 작성
- [ ] `src/utils/monad.ts` (새 파일) - Monad 체인 트랜잭션 처리 함수 작성
- [ ] `src/pages/LeaderboardPage.tsx` - API 연동 활성화 (주석 해제)
- [ ] `src/pages/YapperDetailPage.tsx` - X 지수 계산 로직 통합
- [ ] `src/pages/YapperDetailPage.tsx` - Monad 트랜잭션 처리 연결

## 디자인

- **테마**: 보라색 (Monad 브랜드 컬러)
- **스타일**: 바이낸스 스타일의 깔끔한 UI
- **색상 팔레트**: `monad-purple` (Tailwind 설정 참조)

## 라이선스

MIT

