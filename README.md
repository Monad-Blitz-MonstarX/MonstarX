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

## TODO: API 연동

### 1. 야퍼 리스트 API 연동

`src/data/mockData.ts`의 `fetchYappersFromAPI` 함수를 수정하세요:

```typescript
export async function fetchYappersFromAPI(): Promise<Yapper[]> {
  const response = await fetch('YOUR_API_ENDPOINT')
  return await response.json()
}
```

그리고 `src/pages/LeaderboardPage.tsx`에서 주석 처리된 부분을 활성화하세요.

### 2. X 지수 계산 로직

`src/data/mockData.ts`의 `calculateXIndex` 함수를 구현하세요:

```typescript
export function calculateXIndex(yapper: Partial<Yapper>): number {
  // 여기에 X 지수 계산 로직을 작성하세요
  // 예: 팔로워 대비 반응률, 유의미한 댓글 수, Kaito 점수 등을 조합
  return calculatedIndex
}
```

그리고 `src/pages/YapperDetailPage.tsx`의 TODO 주석 부분에 통합하세요.

### 3. Monad 트랜잭션 처리

`src/pages/YapperDetailPage.tsx`의 `handlePlaceTrade` 함수에 실제 트랜잭션 로직을 추가하세요:

```typescript
const handlePlaceTrade = async () => {
  // Monad 체인에 트랜잭션 전송
  // await placeTradeOnMonad({ ... })
}
```

## 디자인

- **테마**: 보라색 (Monad 브랜드 컬러)
- **스타일**: 바이낸스 스타일의 깔끔한 UI
- **색상 팔레트**: `monad-purple` (Tailwind 설정 참조)

## 라이선스

MIT

