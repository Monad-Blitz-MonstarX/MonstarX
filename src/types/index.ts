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
}

export interface XIndexDataPoint {
  timestamp: number
  value: number
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
  type: 'long' | 'short'
  size: number
  entryPrice: number
  timestamp: number
}

