import { UserTradingStats, YapperTradingStats, MarketAnalytics, Position, Trade } from '../types'

// 개인 투자 성향 더미 데이터
export const mockUserStats: UserTradingStats = {
  totalTrades: 47,
  winRate: 63.8,
  totalPnL: 1254.30, // 현실적인 금액
  averageLeverage: 3.2,
  longShortRatio: 0.68, // 68% 롱
  favoriteYappers: [
    { yapperId: '1', yapperName: 'Haseeb', tradeCount: 12, totalPnL: 452.30 },
    { yapperId: '2', yapperName: 'Simon', tradeCount: 8, totalPnL: 234.50 },
    { yapperId: '3', yapperName: 'DonAlt', tradeCount: 7, totalPnL: 189.20 },
    { yapperId: '4', yapperName: 'Arthur', tradeCount: 6, totalPnL: 156.70 },
    { yapperId: '5', yapperName: 'Mikko', tradeCount: 5, totalPnL: 123.40 },
  ],
  tradingHistory: [
    { date: '11/09', trades: 3, pnl: 12.00 },
    { date: '11/10', trades: 5, pnl: -8.00 },
    { date: '11/11', trades: 4, pnl: 21.00 },
    { date: '11/12', trades: 6, pnl: 34.00 },
    { date: '11/13', trades: 7, pnl: 18.00 },
    { date: '11/14', trades: 5, pnl: -5.00 },
    { date: '11/15', trades: 4, pnl: 23.00 },
  ],
}

// 야퍼별 트레이딩 성향 더미 데이터
export const mockYapperStats: YapperTradingStats[] = [
  {
    yapperId: '1',
    yapperName: 'Haseeb',
    totalTraders: 1245,
    longShortRatio: 0.72, // 72% 롱
    averageLeverage: 4.2,
    totalVolume: 12500000,
    popularity: 95,
    traderSentiment: 'bullish',
  },
  {
    yapperId: '2',
    yapperName: 'Simon',
    totalTraders: 856,
    longShortRatio: 0.65,
    averageLeverage: 3.8,
    totalVolume: 8900000,
    popularity: 88,
    traderSentiment: 'bullish',
  },
  {
    yapperId: '3',
    yapperName: 'DonAlt',
    totalTraders: 2341,
    longShortRatio: 0.45, // 45% 롱 (숏 선호)
    averageLeverage: 5.1,
    totalVolume: 18700000,
    popularity: 92,
    traderSentiment: 'bearish',
  },
  {
    yapperId: '4',
    yapperName: 'Arthur',
    totalTraders: 1123,
    longShortRatio: 0.58,
    averageLeverage: 3.5,
    totalVolume: 9800000,
    popularity: 85,
    traderSentiment: 'neutral',
  },
  {
    yapperId: '5',
    yapperName: 'Mikko',
    totalTraders: 678,
    longShortRatio: 0.68,
    averageLeverage: 4.0,
    totalVolume: 5600000,
    popularity: 78,
    traderSentiment: 'bullish',
  },
]

// 시장 분석 더미 데이터
export const mockMarketAnalytics: MarketAnalytics = {
  totalVolume: 125000000,
  totalTraders: 15420,
  overallLongShortRatio: 0.62, // 62% 롱
  topYappers: [
    { yapperId: '1', yapperName: 'Haseeb', volume: 12500000, traderCount: 1245 },
    { yapperId: '3', yapperName: 'DonAlt', volume: 18700000, traderCount: 2341 },
    { yapperId: '2', yapperName: 'Simon', volume: 8900000, traderCount: 856 },
    { yapperId: '4', yapperName: 'Arthur', volume: 9800000, traderCount: 1123 },
    { yapperId: '5', yapperName: 'Mikko', volume: 5600000, traderCount: 678 },
  ],
  volumeTrend: [
    { date: '11/09', volume: 8500000 },
    { date: '11/10', volume: 9200000 },
    { date: '11/11', volume: 11000000 },
    { date: '11/12', volume: 13500000 },
    { date: '11/13', volume: 12800000 },
    { date: '11/14', volume: 9800000 },
    { date: '11/15', volume: 15200000 },
  ],
}

// 포지션 더미 데이터 (MON 기준)
// size는 USDC 가치로 표시되지만, 실제로는 MON 토큰으로 거래됨
export const mockPositions: Position[] = [
  {
    id: '1',
    yapperId: '1',
    type: 'long',
    size: 22.50, // 500 MON * 0.045 = $22.50 USDC (현실적인 금액)
    entryPrice: 120.5,
    leverage: 3, // 5 MON x 3 = 15 MON 포지션
    liquidationPrice: 101.2,
    currentPnL: 5.63, // 현실적인 손익 ($125 → $5.63)
    pnlPercentage: 25.0,
  },
  {
    id: '2',
    yapperId: '3',
    type: 'short',
    size: 13.50, // 300 MON * 0.045 = $13.50 USDC
    entryPrice: 85.3,
    leverage: 3,
    liquidationPrice: 95.8,
    currentPnL: -0.54, // $12 → $0.54
    pnlPercentage: -4.0,
  },
  {
    id: '3',
    yapperId: '2',
    type: 'long',
    size: 11.25, // 250 MON * 0.045 = $11.25 USDC
    entryPrice: 95.8,
    leverage: 4,
    liquidationPrice: 78.5,
    currentPnL: 1.44, // $32 → $1.44
    pnlPercentage: 12.8,
  },
]

// 거래 히스토리 더미 데이터 (MON 기준)
// size는 USDC 가치로 표시되지만, 실제로는 MON 토큰으로 거래됨
export const mockTradeHistory: Trade[] = [
  {
    id: 't1',
    yapperId: '1',
    yapperName: 'Haseeb',
    type: 'long',
    size: 13.50, // 300 MON * 0.045 = $13.50 USDC
    entryPrice: 115.2,
    exitPrice: 125.8,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    closedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    pnl: 4.14, // $92 → $4.14
    pnlPercentage: 30.7,
    status: 'closed',
  },
  {
    id: 't2',
    yapperId: '2',
    yapperName: 'Simon',
    type: 'long',
    size: 9.00, // 200 MON * 0.045 = $9.00 USDC
    entryPrice: 92.5,
    exitPrice: 98.3,
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    closedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    pnl: 2.79, // $62 → $2.79
    pnlPercentage: 31.0,
    status: 'closed',
  },
  {
    id: 't3',
    yapperId: '4',
    yapperName: 'Arthur',
    type: 'short',
    size: 6.75, // 150 MON * 0.045 = $6.75 USDC
    entryPrice: 78.5,
    exitPrice: 75.2,
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    closedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    pnl: 2.23, // $49.50 → $2.23
    pnlPercentage: 33.0,
    status: 'closed',
  },
  {
    id: 't4',
    yapperId: '3',
    yapperName: 'DonAlt',
    type: 'short',
    size: 11.25, // 250 MON * 0.045 = $11.25 USDC
    entryPrice: 88.2,
    exitPrice: 91.5,
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    closedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    pnl: -3.71, // -$82.50 → -$3.71
    pnlPercentage: -33.0,
    status: 'closed',
  },
  {
    id: 't5',
    yapperId: '5',
    yapperName: 'Mikko',
    type: 'long',
    size: 8.10, // 180 MON * 0.045 = $8.10 USDC
    entryPrice: 62.3,
    exitPrice: 68.9,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    closedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    pnl: 5.35, // $118.80 → $5.35
    pnlPercentage: 66.0,
    status: 'closed',
  },
]

// TODO: 실제 API 연동 시 이 함수들을 사용하세요
export async function fetchUserTradingStats(): Promise<UserTradingStats> {
  // API 연동 코드를 여기에 작성하세요
  return mockUserStats
}

export async function fetchYapperTradingStats(): Promise<YapperTradingStats[]> {
  // API 연동 코드를 여기에 작성하세요
  return mockYapperStats
}

export async function fetchMarketAnalytics(): Promise<MarketAnalytics> {
  // API 연동 코드를 여기에 작성하세요
  return mockMarketAnalytics
}

export async function fetchUserPositions(): Promise<Position[]> {
  // API 연동 코드를 여기에 작성하세요
  return mockPositions
}

