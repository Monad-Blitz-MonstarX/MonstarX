export interface Yapper {
  id: string
  name: string
  username: string
  avatar: string
  rank: number
  totalYaps: number
  earnedYaps: number
  referralYaps: number
  smartFollowers: number
  followers: number
  smartPercentage: number
  xIndex: number // X 종합 지수
  xIndexChange24h: number // 24시간 변화율
  yaps_l24h?: number // 지난 24시간 동안 얻은 Yap 수 (Kaito API에서 제공)
}

export interface XIndexDataPoint {
  timestamp: number
  value: number
}

export interface YapDataPoint {
  date: string // YYYY-MM-DD 형식
  timestamp: number
  dailyYaps: number // 해당 날짜에 얻은 Yap 수
  changeFromPrevious: number // 전날 대비 변화량
  changePercentage: number // 전날 대비 변화율 (%)
}

export interface Position {
  id: string
  yapperId: string
  type: 'long' | 'short'
  size: number
  entryPrice: number
  leverage: number
  liquidationPrice: number
  currentPnL: number
  pnlPercentage: number
}

export interface Trade {
  id: string
  yapperId: string
  yapperName?: string
  type: 'long' | 'short'
  size: number
  entryPrice: number
  exitPrice?: number
  timestamp: number
  closedAt?: number
  pnl?: number
  pnlPercentage?: number
  status: 'open' | 'closed'
}

// 분석 관련 타입
export interface UserTradingStats {
  totalTrades: number
  winRate: number
  totalPnL: number
  averageLeverage: number
  longShortRatio: number // 롱 비율 (0-1)
  favoriteYappers: Array<{
    yapperId: string
    yapperName: string
    tradeCount: number
    totalPnL: number
  }>
  tradingHistory: Array<{
    date: string
    trades: number
    pnl: number
  }>
}

export interface YapperTradingStats {
  yapperId: string
  yapperName: string
  totalTraders: number
  longShortRatio: number // 롱 비율 (0-1)
  averageLeverage: number
  totalVolume: number
  popularity: number // 인기도 점수
  traderSentiment: 'bullish' | 'bearish' | 'neutral'
}

export interface MarketAnalytics {
  totalVolume: number
  totalTraders: number
  overallLongShortRatio: number
  topYappers: Array<{
    yapperId: string
    yapperName: string
    volume: number
    traderCount: number
  }>
  volumeTrend: Array<{
    date: string
    volume: number
  }>
}

// Kaito API 응답 타입
export interface KaitoAPIResponse {
  user_id: string
  username: string
  yaps_all: number
  yaps_l24h: number
  yaps_l48h: number
  yaps_l7d: number
  yaps_l30d: number
  yaps_l3m: number
  yaps_l6m: number
  yaps_l12m: number
}

// Twitter API 응답 타입 (예시 - 실제 API 구조에 맞게 수정 필요)
export interface TwitterAPIResponse {
  id?: string
  name?: string
  username: string
  followers_count?: number
  smart_followers?: number
  profile_image_url?: string
  // TODO: 실제 Twitter API 응답 구조에 맞게 필드 추가
}

