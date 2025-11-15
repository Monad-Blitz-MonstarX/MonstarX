import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Position, Trade } from '../types'
import { mockPositions, mockTradeHistory } from '../data/analyticsData'
import { mockYappers } from '../data/mockData'
import { useWallet } from '../contexts/WalletContext'
import { MON_PRICE_USDC } from '../config/monad'
import { closePosition, getUserActivePositions, getUserClosedPositions } from '../utils/vault'
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2, Wallet as WalletIcon, Coins, X } from 'lucide-react'
import { BrowserProvider } from 'ethers'

export default function MyWalletPage() {
  const navigate = useNavigate()
  const { address, isConnected, getMonBalance, signer, provider } = useWallet()
  const [positions, setPositions] = useState<Position[]>([])
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])
  const [monBalance, setMonBalance] = useState<string | null>(null)
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 포지션에 인플루언서 정보 추가
  const positionsWithYapper = positions.map(pos => {
    const yapper = mockYappers.find(y => y.id === pos.yapperId || y.id === (pos as any).influencerId)
    return { ...pos, yapper }
  })
  
  const tradeHistoryWithYapper = tradeHistory.map(trade => {
    const yapper = mockYappers.find(y => y.id === trade.yapperId)
    return { ...trade, yapper }
  })
  
  const totalPnL = positions.reduce((sum, pos) => sum + pos.currentPnL, 0)
  const totalPnLPercentage = positions.length > 0 
    ? positions.reduce((sum, pos) => sum + pos.pnlPercentage, 0) / positions.length 
    : 0
  
  const totalValue = positions.reduce((sum, pos) => sum + pos.size, 0)
  const monBalanceNum = parseFloat(monBalance || '0')
  const balanceInUSDC = monBalanceNum * MON_PRICE_USDC

  // 잔액 및 포지션 조회
  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && address && provider) {
        setLoading(true)
        try {
          // 잔액 조회
          const mon = await getMonBalance()
          setMonBalance(mon)
          
          // 활성 포지션 조회
          const activePositions = await getUserActivePositions(provider as BrowserProvider, address)
          setPositions(activePositions)
          
          // 종료된 포지션 조회 (히스토리)
          const closedPositions = await getUserClosedPositions(provider as BrowserProvider, address)
          // Trade 형식으로 변환
          const history: Trade[] = closedPositions.map((pos: any) => ({
            id: pos.id,
            yapperId: pos.influencerId,
            yapperName: `Yapper #${pos.influencerId}`,
            type: pos.type,
            size: pos.size,
            entryPrice: pos.entryPrice,
            exitPrice: pos.entryPrice, // 종료 가격은 실제로는 계산 필요
            pnl: pos.currentPnL,
            pnlPercentage: pos.pnlPercentage,
            timestamp: pos.timestamp,
            closedAt: pos.timestamp,
          }))
          setTradeHistory(history)
        } catch (error) {
          console.error('데이터 조회 실패:', error)
          // 에러 발생 시 더미 데이터 사용
          setPositions(mockPositions)
          setTradeHistory(mockTradeHistory)
        } finally {
          setLoading(false)
        }
      } else {
        // 연결되지 않은 경우 더미 데이터 사용
        setPositions(mockPositions)
        setTradeHistory(mockTradeHistory)
        setLoading(false)
      }
    }
    fetchData()
  }, [isConnected, address, provider, getMonBalance])

  // 포지션 종료 핸들러
  const handleClosePosition = async (positionId: string) => {
    if (!signer) {
      alert('지갑을 연결해주세요!')
      return
    }

    if (!confirm('정말로 이 포지션을 종료하시겠습니까?')) {
      return
    }

    setClosingPositionId(positionId)
    try {
      const result = await closePosition(signer, parseInt(positionId))
      
      if (result.success) {
        // 포지션을 목록에서 제거
        setPositions(positions.filter(p => p.id !== positionId))
        
        // 컨트랙트에서 종료된 포지션 정보를 다시 가져와서 히스토리에 추가
        if (provider && address) {
          const closedPositions = await getUserClosedPositions(provider as BrowserProvider, address)
          const history: Trade[] = closedPositions.map((pos: any) => ({
            id: pos.id,
            yapperId: pos.influencerId,
            yapperName: `Yapper #${pos.influencerId}`,
            type: pos.type,
            size: pos.size,
            entryPrice: pos.entryPrice,
            exitPrice: pos.entryPrice,
            pnl: pos.currentPnL,
            pnlPercentage: pos.pnlPercentage,
            timestamp: pos.timestamp,
            closedAt: pos.timestamp,
          }))
          setTradeHistory(history)
        }
        
        alert('포지션이 성공적으로 종료되었습니다!')
      } else {
        alert(`포지션 종료 실패: ${result.error}`)
      }
    } catch (error: any) {
      console.error('포지션 종료 오류:', error)
      alert(`포지션 종료 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setClosingPositionId(null)
    }
  }

  if (loading) {
    return (
      <div className="h-full bg-dark-bg overflow-y-auto scrollbar-hide flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

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

        {/* Account Info */}
        {isConnected && address && (
          <div className="mb-6 p-4 bg-dark-card/70 border border-dark-border/50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <WalletIcon className="w-5 h-5 text-monad-purple-400" />
              <span className="text-white font-semibold">계좌 정보</span>
            </div>
            <div className="text-sm text-gray-400 font-mono">{address}</div>
          </div>
        )}

        {/* Token Balance */}
        {isConnected && (
          <div className="mb-6">
            <div className="bg-dark-card/70 border border-dark-border/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm font-medium">MON Balance</span>
                </div>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30">
                  Gas Token
                </span>
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <div className="text-3xl font-bold text-white">
                  {monBalanceNum.toFixed(4)} MON
                </div>
                <div className="text-lg text-gray-400">
                  ≈ ${balanceInUSDC.toFixed(4)} USDC
                </div>
              </div>
              <div className="text-xs text-gray-500">Monad Testnet 네이티브 토큰 (가격: $0.045 USDC)</div>
            </div>
          </div>
        )}

        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Balance Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-monad-purple-500/25 via-monad-purple-600/20 to-monad-purple-700/25 border border-monad-purple-500/50 shadow-lg shadow-monad-purple-500/15 p-5 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-monad-purple-500/10 to-transparent"></div>
            <div className="relative">
              <div className="text-gray-300 text-xs mb-1.5 font-medium">총 잔액 (USDC)</div>
              <div className="text-2xl font-bold text-white">${balanceInUSDC.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">{monBalanceNum.toFixed(4)} MON</div>
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
              ${(balanceInUSDC - totalValue).toLocaleString(2)}
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
                {positionsWithYapper.map((position) => {
                  const isLong = position.type === 'long'
                  const isProfit = position.currentPnL >= 0
                  const yapper = (position as any).yapper
                  
                  return (
                    <div 
                      key={position.id} 
                      className="group relative p-4 hover:bg-dark-surface/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {/* 인플루언서 아바타 */}
                            {yapper && (
                              <img 
                                src={yapper.avatar} 
                                alt={yapper.name}
                                className="w-10 h-10 rounded-full border-2 border-monad-purple-500/50 cursor-pointer hover:border-monad-purple-500 transition-colors"
                                onClick={() => navigate(`/yapper/${yapper.id}`)}
                              />
                            )}
                            <div className="flex items-center gap-2 flex-1">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isLong 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                              }`}>
                                {isLong ? 'LONG' : 'SHORT'}
                              </span>
                              {yapper ? (
                                <button
                                  onClick={() => navigate(`/yapper/${yapper.id}`)}
                                  className="text-white font-semibold text-sm hover:text-monad-purple-400 transition-colors flex items-center gap-1"
                                >
                                  {yapper.name}
                                  <span className="text-gray-500 text-xs">#{yapper.id}</span>
                                </button>
                              ) : (
                                <span className="text-white font-semibold text-sm">Yapper #{position.yapperId || (position as any).influencerId}</span>
                              )}
                            </div>
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
                        
                        <div className="text-right ml-4 flex flex-col items-end gap-2">
                          <div>
                            <div className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                              {isProfit ? '+' : ''}${position.currentPnL.toLocaleString(2)}
                            </div>
                            <div className={`text-xs font-semibold mt-0.5 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                              {isProfit ? <TrendingUp className="inline w-3 h-3 mr-0.5" /> : <TrendingDown className="inline w-3 h-3 mr-0.5" />}
                              {isProfit ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                            </div>
                          </div>
                          
                          {/* Close Position Button */}
                          <button
                            onClick={() => handleClosePosition(position.id)}
                            disabled={closingPositionId === position.id}
                            className={`group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                              isProfit
                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 hover:border-green-500/60'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 hover:border-red-500/60'
                            } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
                          >
                            {closingPositionId === position.id ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                종료 중...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <X className="w-4 h-4" />
                                포지션 종료
                              </span>
                            )}
                          </button>
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
                {tradeHistoryWithYapper.map((trade) => {
                  const isLong = trade.type === 'long'
                  const isProfit = trade.pnl && trade.pnl >= 0
                  const yapper = (trade as any).yapper
                  
                  return (
                    <div 
                      key={trade.id} 
                      className="group relative p-4 hover:bg-dark-surface/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {/* 인플루언서 아바타 */}
                            {yapper && (
                              <img 
                                src={yapper.avatar} 
                                alt={yapper.name}
                                className="w-10 h-10 rounded-full border-2 border-monad-purple-500/50 cursor-pointer hover:border-monad-purple-500 transition-colors"
                                onClick={() => navigate(`/yapper/${yapper.id}`)}
                              />
                            )}
                            <div className="flex items-center gap-2 flex-1">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isLong 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                              }`}>
                                {isLong ? 'LONG' : 'SHORT'}
                              </span>
                              {yapper ? (
                                <button
                                  onClick={() => navigate(`/yapper/${yapper.id}`)}
                                  className="text-white font-semibold text-sm hover:text-monad-purple-400 transition-colors flex items-center gap-1"
                                >
                                  {yapper.name}
                                  <span className="text-gray-500 text-xs">#{yapper.id}</span>
                                </button>
                              ) : (
                                <span className="text-white font-semibold text-sm">{trade.yapperName || `Yapper #${trade.yapperId}`}</span>
                              )}
                              <span className="text-gray-500 text-xs">
                                {new Date(trade.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
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
