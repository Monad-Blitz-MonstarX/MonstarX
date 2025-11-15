import { Yapper, XIndexDataPoint } from '../types'

// 더미 야퍼 데이터
export const mockYappers: Yapper[] = [
  {
    id: '1',
    name: 'Haseeb',
    username: 'hosseeb',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Haseeb',
    rank: 1,
    totalYaps: 512,
    earnedYaps: 512,
    referralYaps: 0,
    smartFollowers: 5437,
    followers: 132363,
    smartPercentage: 4.11,
    xIndex: 125.5,
    xIndexChange24h: 5.2,
  },
  {
    id: '2',
    name: 'Simon',
    username: 'simononchain',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Simon',
    rank: 2,
    totalYaps: 353,
    earnedYaps: 353,
    referralYaps: 0,
    smartFollowers: 731,
    followers: 10000,
    smartPercentage: 7.31,
    xIndex: 98.3,
    xIndexChange24h: -2.1,
  },
  {
    id: '3',
    name: 'DonAlt',
    username: 'CryptoDonAlt',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DonAlt',
    rank: 3,
    totalYaps: 335,
    earnedYaps: 334,
    referralYaps: 0,
    smartFollowers: 4435,
    followers: 696122,
    smartPercentage: 0.64,
    xIndex: 87.6,
    xIndexChange24h: 3.8,
  },
  {
    id: '4',
    name: 'Arthur',
    username: 'Arthur_0x',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur',
    rank: 4,
    totalYaps: 296,
    earnedYaps: 296,
    referralYaps: 0,
    smartFollowers: 5888,
    followers: 205760,
    smartPercentage: 2.86,
    xIndex: 76.2,
    xIndexChange24h: -1.5,
  },
  {
    id: '5',
    name: 'Mikko Ohtamaa',
    username: 'moo9000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mikko',
    rank: 5,
    totalYaps: 259,
    earnedYaps: 253,
    referralYaps: 7,
    smartFollowers: 1466,
    followers: 20713,
    smartPercentage: 7.08,
    xIndex: 65.8,
    xIndexChange24h: 8.3,
  },
  {
    id: '6',
    name: 'joseph.eth',
    username: 'josephdelong',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph',
    rank: 6,
    totalYaps: 242,
    earnedYaps: 242,
    referralYaps: 0,
    smartFollowers: 3722,
    followers: 82499,
    smartPercentage: 4.51,
    xIndex: 54.3,
    xIndexChange24h: -0.8,
  },
  {
    id: '7',
    name: 'Derivatives Monke',
    username: 'DerivativeMonke',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Monke',
    rank: 7,
    totalYaps: 196,
    earnedYaps: 196,
    referralYaps: 0,
    smartFollowers: 1007,
    followers: 52020,
    smartPercentage: 1.94,
    xIndex: 43.7,
    xIndexChange24h: 2.4,
  },
  {
    id: '8',
    name: 'Santiago R Santos',
    username: 'santiagoroel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago',
    rank: 8,
    totalYaps: 177,
    earnedYaps: 177,
    referralYaps: 0,
    smartFollowers: 5543,
    followers: 130821,
    smartPercentage: 4.24,
    xIndex: 38.9,
    xIndexChange24h: -3.2,
  },
]

// X 지수 차트 더미 데이터 생성 함수
export function generateMockXIndexData(yapperId: string, baseValue: number): XIndexDataPoint[] {
  const data: XIndexDataPoint[] = []
  const now = Date.now()
  const hours = 24
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000
    // 랜덤 워크로 현실적인 차트 생성
    const randomChange = (Math.random() - 0.5) * 2
    const value = baseValue + randomChange * 5 + Math.sin(i / 3) * 3
    data.push({ timestamp, value: Math.max(0, value) })
  }
  
  return data
}

// TODO: 실제 API 연동 시 이 함수를 사용
export async function fetchYappersFromAPI(): Promise<Yapper[]> {
  // API 연동 코드를 여기에 작성하세요
  // 예: const response = await fetch('YOUR_API_ENDPOINT')
  // return await response.json()
  return mockYappers
}

// TODO: 실제 X 지수 계산 로직을 여기에 작성
export function calculateXIndex(yapper: Partial<Yapper>): number {
  // X 지수 계산 로직을 여기에 작성하세요
  // 예: 
  // const engagementRate = (yapper.smartFollowers || 0) / (yapper.followers || 1) * 100
  // const yapsScore = (yapper.totalYaps || 0) * 0.1
  // return engagementRate + yapsScore
  return 0
}

