import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { mockYappers, mockYapHistory } from '../data/mockData'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

type TimeFilter = '24H' | '48H' | '7D' | '30D' | '3M' | '6M' | '12M' | 'All'

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24H')

  const filteredYappers = useMemo(() => {
    return mockYappers.filter((yapper) =>
      yapper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      yapper.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // 트리맵 크기 계산 (Total Yaps 기반)
  const getCardSize = (totalYaps: number, maxYaps: number) => {
    const minSize = 200
    const maxSize = 400
    const ratio = totalYaps / maxYaps
    return minSize + (maxSize - minSize) * ratio
  }

  const maxTotalYaps = Math.max(...filteredYappers.map(y => y.totalYaps))

  return (
    <div className="h-full bg-dark-bg">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-monad-purple-200 to-white bg-clip-text text-transparent">
            Yapper Leaderboard
          </h1>
          <p className="text-gray-300">
            Discover top influencers and trade their influence
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search yappers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-card/60 border border-dark-border/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-monad-purple-500/60 focus:ring-2 focus:ring-monad-purple-500/20 backdrop-blur-sm"
            />
          </div>

          {/* Time Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['24H', '48H', '7D', '30D', '3M', '6M', '12M', 'All'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${timeFilter === filter
                  ? 'bg-monad-purple-500/40 text-white border border-monad-purple-500/60 shadow-md shadow-monad-purple-500/20'
                  : 'bg-dark-card/60 text-gray-300 hover:text-white hover:bg-dark-card/80 border border-dark-border/50'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Map Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredYappers.map((yapper) => {
            // 24h Change 계산: mockYapHistory에서 전날과 오늘의 dailyYaps를 비교 (개수로 표시)
            const yapHistory = mockYapHistory[yapper.id] || []
            let yapChange24h = 0

            if (yapHistory.length >= 2) {
              // 최근 2일의 데이터 (오늘, 어제)
              const todayData = yapHistory[yapHistory.length - 1]
              const yesterdayData = yapHistory[yapHistory.length - 2]

              // 전날 대비 변화량 계산 (개수)
              yapChange24h = todayData.dailyYaps - yesterdayData.dailyYaps
            } else if (yapHistory.length === 1) {
              // 데이터가 1일만 있으면 yaps_l24h를 그대로 사용
              yapChange24h = yapper.yaps_l24h || 0
            } else {
              // 데이터가 없으면 yaps_l24h를 그대로 사용
              yapChange24h = yapper.yaps_l24h || 0
            }

            const isPositive = yapChange24h >= 0
            const cardSize = getCardSize(yapper.totalYaps, maxTotalYaps)

            return (
              <Link
                key={yapper.id}
                to={`/yapper/${yapper.id}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-surface/80 border border-dark-border/50 hover:border-monad-purple-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-monad-purple-500/20 backdrop-blur-sm"
                style={{ minHeight: `${cardSize}px` }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-monad-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Rank Badge */}
                <div className="absolute top-4 left-4">
                  {yapper.rank <= 3 ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-monad-purple-500/30 to-monad-purple-700/30 border border-monad-purple-500/50 flex items-center justify-center shadow-lg shadow-monad-purple-500/20">
                      <span className="text-xl">
                        {yapper.rank === 1 ? '🥇' : yapper.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-dark-surface/80 border border-dark-border/50 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-300">#{yapper.rank}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="relative p-6 h-full flex flex-col justify-between">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={yapper.avatar}
                        alt={yapper.name}
                        className="w-16 h-16 rounded-2xl border-2 border-dark-border/50 group-hover:border-monad-purple-500/60 transition-colors shadow-lg"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-card ${isPositive ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate">{yapper.name}</h3>
                      <p className="text-gray-400 text-sm truncate">@{yapper.username}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">Total Yaps</span>
                      <div className="flex items-center gap-1.5">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-bold text-white text-lg">{yapper.totalYaps.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">24h Change</span>
                      <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{yapChange24h.toLocaleString()} Yap
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dark-border/30">
                      <span className="text-gray-400 text-xs">Followers</span>
                      <span className="text-gray-300 text-sm font-medium">
                        {(yapper.followers / 1000).toFixed(1)}K
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">Smart %</span>
                      <span className="text-monad-purple-400 text-sm font-semibold">
                        {yapper.smartPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-monad-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Data updates every hour. Rounded to the nearest whole number.
        </div>
      </div>
    </div>
  )
}
