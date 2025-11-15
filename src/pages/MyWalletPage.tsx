import { useState } from 'react'
import { Position, Trade } from '../types'
import { mockPositions, mockTradeHistory } from '../data/analyticsData'
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react'

export default function MyWalletPage() {
  const [positions] = useState<Position[]>(mockPositions)
  const [tradeHistory] = useState<Trade[]>(mockTradeHistory)
  
  const totalPnL = positions.reduce((sum, pos) => sum + pos.currentPnL, 0)
  const totalPnLPercentage = positions.length > 0 
    ? positions.reduce((sum, pos) => sum + pos.pnlPercentage, 0) / positions.length 
    : 0
  
  const totalValue = positions.reduce((sum, pos) => sum + pos.size, 0)
  const balance = 1542660.06

  return (
    <div className="h-full bg-dark-bg overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">My Wallet</h1>
          <p className="text-gray-400 text-sm">
            포지션을 관리하고 포트폴리오를 확인하세요
          </p>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Balance Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-monad-purple-500/25 via-monad-purple-600/20 to-monad-purple-700/25 border border-monad-purple-500/50 shadow-lg shadow-monad-purple-500/15 p-5 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-monad-purple-500/10 to-transparent"></div>
            <div className="relative">
              <div className="text-gray-300 text-xs mb-1.5 font-medium">총 잔액</div>
              <div className="text-2xl font-bold text-white">${balance.toLocaleString(2)}</div>
            </div>
          </div>

          {/* PnL Card */}
          <div className="relative overflow-hidden rounded-xl bg-dark-card/70 border border-dark-border/50 shadow-md p-5 backdrop-blur-sm hover:border-monad-purple-500/40 transition-all">
            <div className="text-gray-400 text-xs mb-1.5 font-medium">총 손익</div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(2)}
            </div>
            <div className={`text-xs mt-1 ${totalPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
            </div>
          </div>

          {/* Active Positions */}
          <div className="relative overflow-hidden rounded-xl bg-dark-card/70 border border-dark-border/50 shadow-md p-5 backdrop-blur-sm hover:border-monad-purple-500/40 transition-all">
            <div className="text-gray-400 text-xs mb-1.5 font-medium">활성 포지션</div>
            <div className="text-2xl font-bold text-white">{positions.length}</div>
            <div className="text-xs text-gray-400 mt-1">${totalValue.toLocaleString(2)} 가치</div>
          </div>

          {/* Available Balance */}
          <div className="relative overflow-hidden rounded-xl bg-dark-card/70 border border-dark-border/50 shadow-md p-5 backdrop-blur-sm hover:border-green-500/40 transition-all">
            <div className="text-gray-400 text-xs mb-1.5 font-medium">사용 가능</div>
            <div className="text-2xl font-bold text-green-400">
              ${(balance - totalValue).toLocaleString(2)}
            </div>
          </div>
        </div>

        {/* Bottom Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Active Positions */}
          <div className="bg-dark-card/70 backdrop-blur-sm border border-dark-border/50 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-dark-border/50 bg-gradient-to-r from-dark-card/80 to-dark-surface/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-monad-purple-400" />
                <h2 className="text-lg font-bold text-white">활성 포지션</h2>
                <span className="ml-auto px-2 py-0.5 bg-monad-purple-500/20 text-monad-purple-300 text-xs rounded-lg border border-monad-purple-500/30">
                  {positions.length}
                </span>
              </div>
            </div>
            
            {positions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-dark-surface/50 rounded-xl flex items-center justify-center border border-dark-border/30">
                  <AlertTriangle className="w-6 h-6 text-gray-500" />
                </div>
                <div className="text-gray-400 text-sm font-medium">활성 포지션이 없습니다</div>
                <div className="text-xs text-gray-500 mt-1">리더보드에서 거래를 시작하세요</div>
              </div>
            ) : (
              <div className="divide-y divide-dark-border/30">
                {positions.map((position) => {
                  const isLong = position.type === 'long'
                  const isProfit = position.currentPnL >= 0
                  
                  return (
                    <div 
                      key={position.id} 
                      className="group relative p-4 hover:bg-dark-surface/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isLong 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}>
                              {isLong ? 'LONG' : 'SHORT'}
                            </span>
                            <span className="text-white font-semibold text-sm">Yapper #{position.yapperId}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-gray-400 mb-0.5">크기</div>
                              <div className="text-white font-medium">${position.size.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-0.5">진입</div>
                              <div className="text-white font-medium">{position.entryPrice.toFixed(2)} M</div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-0.5">레버리지</div>
                              <div className="text-white font-medium">{position.leverage}x</div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-0.5">청산</div>
                              <div className="text-red-400 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {position.liquidationPrice.toFixed(2)} M
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}${position.currentPnL.toLocaleString(2)}
                          </div>
                          <div className={`text-xs font-semibold mt-0.5 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? <TrendingUp className="inline w-3 h-3 mr-0.5" /> : <TrendingDown className="inline w-3 h-3 mr-0.5" />}
                            {isProfit ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Trade History */}
          <div className="bg-dark-card/70 backdrop-blur-sm border border-dark-border/50 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-dark-border/50 bg-gradient-to-r from-dark-card/80 to-dark-surface/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-monad-purple-400" />
                <h2 className="text-lg font-bold text-white">거래 히스토리</h2>
                <span className="ml-auto px-2 py-0.5 bg-monad-purple-500/20 text-monad-purple-300 text-xs rounded-lg border border-monad-purple-500/30">
                  {tradeHistory.length}
                </span>
              </div>
            </div>
            
            {tradeHistory.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-dark-surface/50 rounded-xl flex items-center justify-center border border-dark-border/30">
                  <CheckCircle2 className="w-6 h-6 text-gray-500" />
                </div>
                <div className="text-gray-400 text-sm font-medium">거래 기록이 없습니다</div>
              </div>
            ) : (
              <div className="divide-y divide-dark-border/30 max-h-[600px] overflow-y-auto scrollbar-hide">
                {tradeHistory.map((trade) => {
                  const isLong = trade.type === 'long'
                  const isProfit = trade.pnl && trade.pnl >= 0
                  
                  return (
                    <div 
                      key={trade.id} 
                      className="group relative p-4 hover:bg-dark-surface/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isLong 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}>
                              {isLong ? 'LONG' : 'SHORT'}
                            </span>
                            <span className="text-white font-semibold text-sm">{trade.yapperName || `Yapper #${trade.yapperId}`}</span>
                            <span className="text-gray-500 text-xs">
                              {new Date(trade.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-gray-400 mb-0.5">크기</div>
                              <div className="text-white font-medium">${trade.size.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-0.5">진입</div>
                              <div className="text-white font-medium">{trade.entryPrice.toFixed(2)} M</div>
                            </div>
                            {trade.exitPrice && (
                              <>
                                <div>
                                  <div className="text-gray-400 mb-0.5">청산</div>
                                  <div className="text-white font-medium">{trade.exitPrice.toFixed(2)} M</div>
                                </div>
                                <div>
                                  <div className="text-gray-400 mb-0.5">보유 기간</div>
                                  <div className="text-white font-medium">
                                    {trade.closedAt ? Math.floor((trade.closedAt - trade.timestamp) / (1000 * 60 * 60)) : 0}h
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {trade.pnl !== undefined && (
                          <div className="text-right ml-4">
                            <div className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                              {isProfit ? '+' : ''}${trade.pnl.toLocaleString(2)}
                            </div>
                            {trade.pnlPercentage !== undefined && (
                              <div className={`text-xs font-semibold mt-0.5 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                {isProfit ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
