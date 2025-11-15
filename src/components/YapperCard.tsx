import { Link } from 'react-router-dom'
import { Yapper } from '../types'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface YapperCardProps {
  yapper: Yapper
}

export default function YapperCard({ yapper }: YapperCardProps) {
  const isPositive = yapper.xIndexChange24h >= 0

  return (
    <Link
      to={`/yapper/${yapper.id}`}
      className="block p-4 bg-dark-card hover:bg-dark-card/80 border border-dark-border rounded-lg transition-all hover:border-monad-purple-500/50 hover:shadow-glow-purple group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 text-center">
            {yapper.rank <= 3 ? (
              <span className="text-2xl">
                {yapper.rank === 1 ? '🥇' : yapper.rank === 2 ? '🥈' : '🥉'}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">#{yapper.rank}</span>
            )}
          </div>

          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={yapper.avatar}
              alt={yapper.name}
              className="w-10 h-10 rounded-full border-2 border-dark-border group-hover:border-monad-purple-500/50 transition-colors"
            />
          </div>

          {/* Name & Username */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{yapper.name}</h3>
              <span className="text-gray-400 text-sm truncate">@{yapper.username}</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>{yapper.followers.toLocaleString()} followers</span>
              <span>{yapper.smartPercentage.toFixed(2)}% smart</span>
            </div>
          </div>

          {/* X Index */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className="font-semibold text-white">{yapper.xIndex.toFixed(2)}</span>
            </div>
            <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{yapper.xIndexChange24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

