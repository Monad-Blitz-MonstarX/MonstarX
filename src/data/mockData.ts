import { Yapper, XIndexDataPoint, YapDataPoint, KaitoAPIResponse, TwitterAPIResponse } from '../types'

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
    yaps_l24h: 25, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 0, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 12, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 0, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 20, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 0, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 4, // 지난 24시간 동안 얻은 Yap 수
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
    yaps_l24h: 0, // 지난 24시간 동안 얻은 Yap 수
  },
]

// 각 yapper별 일별 Yap 데이터 생성 헬퍼 함수
function generateYapHistoryForYapper(totalYaps: number): YapDataPoint[] {
  const data: YapDataPoint[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 30)

  // 평균 일일 Yap 계산 (totalYaps를 30일로 나눔)
  const avgDailyYaps = totalYaps / 30
  let previousDailyYaps = 0

  for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    const timestamp = date.getTime()

    let dailyYaps: number
    if (previousDailyYaps === 0) {
      // 첫날: 평균값 주변에서 시작
      dailyYaps = Math.max(1, Math.floor(avgDailyYaps * (0.8 + Math.random() * 0.4)))
    } else {
      // 전날 대비 변화율 (-30% ~ +50%)
      const changeRate = (Math.random() - 0.3) * 0.8
      dailyYaps = Math.max(1, Math.floor(previousDailyYaps * (1 + changeRate)))
    }

    const changeFromPrevious = previousDailyYaps === 0 ? 0 : dailyYaps - previousDailyYaps
    const changePercentage = previousDailyYaps === 0
      ? 0
      : (changeFromPrevious / previousDailyYaps) * 100

    data.push({
      date: dateStr,
      timestamp,
      dailyYaps,
      changeFromPrevious,
      changePercentage: Math.round(changePercentage * 100) / 100,
    })

    previousDailyYaps = dailyYaps
  }

  return data
}

// 각 yapper별 일별 Yap 데이터 (30일치)
// mockYappers의 각 yapper에 맞게 데이터 생성
export const mockYapHistory: Record<string, YapDataPoint[]> = {
  '1': generateYapHistoryForYapper(512), // Haseeb
  '2': generateYapHistoryForYapper(353), // Simon
  '3': generateYapHistoryForYapper(335), // DonAlt
  '4': generateYapHistoryForYapper(296), // Arthur
  '5': generateYapHistoryForYapper(259), // Mikko Ohtamaa
  '6': generateYapHistoryForYapper(242), // joseph.eth
  '7': generateYapHistoryForYapper(196), // Derivatives Monke
  '8': generateYapHistoryForYapper(177), // Santiago R Santos
}
export function generateMockXIndexData(_yapperId: string, baseValue: number): XIndexDataPoint[] {
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

// Kaito API에서 단일 yapper 데이터 가져오기
export async function fetchYapperFromKaitoAPI(username: string): Promise<KaitoAPIResponse> {
  try {
    const response = await fetch(`https://api.kaito.ai/api/v1/yaps?username=${username}`)
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`)
    }
    const data: KaitoAPIResponse = await response.json()
    return data
  } catch (error) {
    console.error(`Kaito API 요청 실패 (username: ${username}):`, error)
    throw error
  }
}

// Twitter API에서 사용자 데이터 가져오기
// TODO: 실제 Twitter API 엔드포인트와 인증 방식에 맞게 수정하세요
export async function fetchUserFromTwitterAPI(username: string): Promise<TwitterAPIResponse | null> {
  try {
    // TODO: 실제 Twitter API 엔드포인트로 변경
    // 예: const response = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
    //   headers: {
    //     'Authorization': `Bearer ${TWITTER_API_TOKEN}`
    //   }
    // })

    // 현재는 mock 데이터 반환 (실제 API 연동 시 위 주석 해제)
    console.warn(`Twitter API 연동 필요: ${username}`)
    return null
  } catch (error) {
    console.error(`Twitter API 요청 실패 (username: ${username}):`, error)
    return null
  }
}

// Kaito API와 Twitter API 응답을 결합하여 Yapper 타입으로 변환
function transformAPIsToYapper(
  kaitoResponse: KaitoAPIResponse,
  twitterResponse: TwitterAPIResponse | null,
  rank: number,
  id: string
): Yapper {
  // 24시간 전 대비 변화율 계산 (yaps_l24h가 0이면 변화 없음)
  const yaps24hAgo = kaitoResponse.yaps_all - kaitoResponse.yaps_l24h
  const yapsChange24h = yaps24hAgo > 0
    ? ((kaitoResponse.yaps_l24h / yaps24hAgo) * 100)
    : 0

  return {
    id: id,
    name: twitterResponse?.name || kaitoResponse.username,
    username: kaitoResponse.username,
    avatar: twitterResponse?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kaitoResponse.username}`,
    rank: rank,
    totalYaps: kaitoResponse.yaps_all,
    earnedYaps: kaitoResponse.yaps_all, // Kaito API에서는 earned/referral 구분이 없으므로 모두 earned로 처리
    referralYaps: 0, // Kaito API에서 제공하지 않음
    smartFollowers: twitterResponse?.smart_followers || 0, // Twitter API에서 가져와야 함
    followers: twitterResponse?.followers_count || 0, // Twitter API에서 가져와야 함
    smartPercentage: twitterResponse?.followers_count && twitterResponse?.smart_followers
      ? (twitterResponse.smart_followers / twitterResponse.followers_count) * 100
      : 0,
    xIndex: 0, // TODO: X Index 계산 로직 필요
    xIndexChange24h: yapsChange24h,
    yaps_l24h: kaitoResponse.yaps_l24h, // 지난 24시간 동안 얻은 Yap 수
  }
}

// 실제 API 연동 시 이 함수를 사용
export async function fetchYappersFromAPI(usernames?: string[]): Promise<Yapper[]> {
  // usernames가 제공되지 않으면 mock 데이터 사용
  if (!usernames || usernames.length === 0) {
    console.warn('usernames가 제공되지 않아 mock 데이터를 반환합니다.')
    return mockYappers
  }

  try {
    // 모든 username에 대해 병렬로 Kaito API와 Twitter API 호출
    const apiPromises = usernames.map(async (username, index) => {
      try {
        // Kaito API와 Twitter API를 병렬로 호출
        const [kaitoResponse, twitterResponse] = await Promise.all([
          fetchYapperFromKaitoAPI(username),
          fetchUserFromTwitterAPI(username),
        ])

        return transformAPIsToYapper(
          kaitoResponse,
          twitterResponse,
          index + 1,
          kaitoResponse.user_id || String(index + 1)
        )
      } catch (error) {
        console.error(`Failed to fetch data for ${username}:`, error)
        // 에러 발생 시 null 반환
        return null
      }
    })

    const results = await Promise.all(apiPromises)

    // null 값 제거 및 유효한 데이터만 반환
    const validYappers = results.filter((yapper): yapper is Yapper => yapper !== null)

    // yaps_all 기준으로 내림차순 정렬 후 rank 재정렬
    const sortedYappers = validYappers.sort((a, b) => b.totalYaps - a.totalYaps)

    return sortedYappers.map((yapper, index) => ({
      ...yapper,
      rank: index + 1,
    }))
  } catch (error) {
    console.error('API 연동 중 오류 발생:', error)
    // 에러 발생 시 mock 데이터 반환
    return mockYappers
  }
}


// Kaito API에서 Yap 일별 데이터 가져오기
export async function fetchYapDataFromKaitoAPI(username: string, startDate?: string, endDate?: string): Promise<YapDataPoint[]> {
  try {
    // 날짜 파라미터가 없으면 현재 날짜 기준 30일 전부터 오늘까지로 설정
    let finalStartDate = startDate
    let finalEndDate = endDate

    if (!finalStartDate || !finalEndDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      finalStartDate = finalStartDate || thirtyDaysAgo.toISOString().split('T')[0]
      finalEndDate = finalEndDate || today.toISOString().split('T')[0]
    }

    // 날짜 파라미터 추가
    const dateParams = `&start_date=${finalStartDate}&end_date=${finalEndDate}`
    const response = await fetch(`https://api.kaito.ai/api/v1/yaps?username=${username}${dateParams}`)

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`)
    }

    const data = await response.json()

    // TODO: 실제 API 응답 구조에 맞게 변환하세요
    // 예시: API 응답이 일별 Yap 데이터 배열을 반환한다고 가정
    if (Array.isArray(data)) {
      return data.map((item: any, index: number) => {
        const prevItem = index > 0 ? data[index - 1] : null
        const changeFromPrevious = prevItem ? item.dailyYaps - prevItem.dailyYaps : 0
        const changePercentage = prevItem && prevItem.dailyYaps > 0
          ? (changeFromPrevious / prevItem.dailyYaps) * 100
          : 0

        return {
          date: item.date || new Date(item.timestamp).toISOString().split('T')[0],
          timestamp: item.timestamp || new Date(item.date).getTime(),
          dailyYaps: item.dailyYaps || item.yaps || 0,
          changeFromPrevious,
          changePercentage: Math.round(changePercentage * 100) / 100,
        }
      })
    }

    // 단일 객체인 경우 처리
    return []
  } catch (error) {
    console.error(`Kaito API Yap 데이터 요청 실패 (username: ${username}):`, error)
    throw error
  }
}

// 일별 Yap 데이터 생성 함수
// mockYapHistory에 데이터가 있으면 반환, 없으면 빈 배열 반환
// TODO: 실제 API 연동 시 fetchYapDataFromKaitoAPI를 사용하세요
export function generateMockYapData(yapperId: string, _baseTotalYaps: number): YapDataPoint[] {
  // mockYapHistory에서 해당 yapper의 데이터를 찾아서 반환
  if (mockYapHistory[yapperId] && mockYapHistory[yapperId].length > 0) {
    return mockYapHistory[yapperId]
  }

  // 데이터가 없으면 빈 배열 반환 (또는 기존 로직으로 생성)
  return []
}

