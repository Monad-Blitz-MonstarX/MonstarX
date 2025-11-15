import { useState, useMemo } from 'react'
import { mockYappers, fetchYappersFromAPI } from '../data/mockData'
import { Yapper } from '../types'
import YapperCard from '../components/YapperCard'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type SortField = 'rank' | 'xIndex' | 'xIndexChange24h' | 'followers' | 'smartPercentage'
type SortDirection = 'asc' | 'desc'
type TimeFilter = '24H' | '48H' | '7D' | '30D' | '3M' | '6M' | '12M' | 'All'

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24H')

  // TODO: 실제 API 연동 시 이 부분을 수정하세요
  // const [yappers, setYappers] = useState<Yapper[]>([])
  // useEffect(() => {
  //   fetchYappersFromAPI().then(setYappers)
  // }, [])
  const yappers = mockYappers

  const filteredAndSortedYappers = useMemo(() => {
    let filtered = yappers.filter((yapper) =>
      yapper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      yapper.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'rank':
          aValue = a.rank
          bValue = b.rank
          break
        case 'xIndex':
          aValue = a.xIndex
          bValue = b.xIndex
          break
        case 'xIndexChange24h':
          aValue = a.xIndexChange24h
          bValue = b.xIndexChange24h
          break
        case 'followers':
          aValue = a.followers
          bValue = b.followers
          break
        case 'smartPercentage':
          aValue = a.smartPercentage
          bValue = b.smartPercentage
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return filtered
  }, [yappers, searchQuery, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <Minus className="w-3 h-3 text-gray-600" />
    }
    return sortDirection === 'asc' ? (
      <TrendingUp className="w-3 h-3 text-monad-purple-400" />
    ) : (
      <TrendingDown className="w-3 h-3 text-monad-purple-400" />
    )
  }

  return (
    <div className="h-full bg-dark-bg">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Yapper Leaderboard</h1>
          <p className="text-gray-400">
            Discover top influencers and trade their influence. Select a yapper to start trading.
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
              className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-monad-purple-500 focus:ring-1 focus:ring-monad-purple-500"
            />
          </div>

          {/* Time Filter */}
          <div className="flex gap-2">
            {(['24H', '48H', '7D', '30D', '3M', '6M', '12M', 'All'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === filter
                    ? 'bg-monad-purple-500 text-white'
                    : 'bg-dark-card text-gray-400 hover:text-white hover:bg-dark-card/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-gray-400 border-b border-dark-border">
            <div className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('rank')}>
              Rank <SortIcon field="rank" />
            </div>
            <div className="col-span-4 flex items-center">Name</div>
            <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('followers')}>
              Followers <SortIcon field="followers" />
            </div>
            <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('smartPercentage')}>
              Smart % <SortIcon field="smartPercentage" />
            </div>
            <div className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => handleSort('xIndex')}>
              X Index <SortIcon field="xIndex" />
            </div>
          </div>

          {/* Yapper List */}
          <div className="divide-y divide-dark-border">
            {filteredAndSortedYappers.map((yapper) => (
              <YapperCard key={yapper.id} yapper={yapper} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Data updates every hour. Rounded to the nearest whole number.
        </div>
      </div>
    </div>
  )
}

