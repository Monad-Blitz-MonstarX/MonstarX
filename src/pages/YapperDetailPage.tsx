import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockYappers, generateMockYapData } from '../data/mockData'
import { Yapper, YapDataPoint, Position } from '../types'
import YapChart from '../components/YapChart'
import { ArrowLeft, TrendingUp, TrendingDown, Info } from 'lucide-react'

export default function YapperDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [yapper, setYapper] = useState<Yapper | null>(null)
  const [yapData, setYapData] = useState<YapDataPoint[]>([])
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long')
  const [tradeAmount, setTradeAmount] = useState('')
  const [leverage, setLeverage] = useState(1)
  const [balance] = useState(1542660.06)
  const [positions] = useState<Position[]>([])

  useEffect(() => {
    // TODO: 실제 API 연동 시 이 부분을 수정하세요
    // const fetchYapper = async () => {
    //   const data = await fetchYapperFromAPI(id!)
    //   setYapper(data)
    // }
    // fetchYapper()

    const foundYapper = mockYappers.find((y) => y.id === id)
    if (foundYapper) {
      setYapper(foundYapper)
      // Yap 변동 데이터 생성
      const yapData = generateMockYapData(foundYapper.id, foundYapper.totalYaps)
      setYapData(yapData)
    }
  }, [id])

  if (!yapper) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Yapper not found</div>
      </div>
    )
  }

  const handlePlaceTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return

    // TODO: 실제 트랜잭션 처리 로직을 여기에 작성하세요
    // 예: await placeTradeOnMonad({
    //   yapperId: yapper.id,
    //   type: tradeType,
    //   amount: parseFloat(tradeAmount),
    //   leverage,
    // })

    alert(`Trade placed: ${tradeType.toUpperCase()} ${tradeAmount} USDC with ${leverage}x leverage`)
    setTradeAmount('')
  }

  const entryPrice = yapper.xIndex
  const liquidationPrice = tradeType === 'long'
    ? entryPrice * (1 - 0.8 / leverage)
    : entryPrice * (1 + 0.8 / leverage)

  return (
    <div className="h-full bg-dark-bg overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leaderboard</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Yapper Info */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={yapper.avatar}
                  alt={yapper.name}
                  className="w-16 h-16 rounded-full border-2 border-monad-purple-500/50"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">{yapper.name}</h1>
                    <span className="text-gray-400">@{yapper.username}</span>
                    <div className={`w-3 h-3 rounded-full ${yapper.xIndexChange24h >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>Rank #{yapper.rank}</span>
                    <span>•</span>
                    <span>{yapper.followers.toLocaleString()} followers</span>
                    <span>•</span>
                    <span>{yapper.smartPercentage.toFixed(2)}% smart</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Trades</div>
                  <div className="text-lg font-semibold text-white">${(yapper.totalYaps * 10000).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Volume</div>
                  <div className="text-lg font-semibold text-white">${(yapper.totalYaps * 50000).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Funding / Cooldown</div>
                  <div className="text-lg font-semibold text-white">0.3000%</div>
                  <div className="text-xs text-gray-500">00:31:34</div>
                </div>
              </div>
            </div>

            {/* Yap 변동 Chart */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white">Yap 변동</h2>
                    {yapData.length > 0 && (() => {
                      const latest = yapData[yapData.length - 1]
                      const isPositive = latest.changeFromPrevious >= 0
                      return (
                        <div className="flex items-center gap-2">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{latest.changeFromPrevious.toLocaleString()} Yap (전날 대비)
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">
                    전날 대비 변화량 (최근 30일)
                  </div>
                </div>
              </div>

              <div className="h-64">
                <YapChart data={yapData} />
              </div>

              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>0을 기준으로 전날 대비 변화량을 표시합니다 (양수: 증가, 음수: 감소)</span>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {yapper.name} is a prominent crypto influencer with {yapper.followers.toLocaleString()} followers
                and a smart follower rate of {yapper.smartPercentage.toFixed(2)}%. Known for insightful analysis
                and engaging content in the crypto space.
              </p>
            </div>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="space-y-6">
            {/* Trade Panel */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTradeType('long')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${tradeType === 'long'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-dark-surface text-gray-400 border border-dark-border hover:border-gray-600'
                    }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Long
                </button>
                <button
                  onClick={() => setTradeType('short')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${tradeType === 'short'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-dark-surface text-gray-400 border border-dark-border hover:border-gray-600'
                    }`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Short
                </button>
              </div>

              {/* Market Section */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Balance</span>
                    <span className="text-sm text-white font-semibold">${balance.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="w-full pl-4 pr-16 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-monad-purple-500 focus:ring-1 focus:ring-monad-purple-500"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">nUSDC</span>
                  </div>
                </div>

                {/* Leverage Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Leverage</span>
                    <span className="text-sm text-white font-semibold">{leverage}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-monad-purple-500"
                    />
                    <button
                      onClick={() => setLeverage(1)}
                      className="px-3 py-1 bg-dark-surface border border-dark-border rounded text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      1x
                    </button>
                  </div>
                </div>

                {/* Trade Info */}
                <div className="space-y-2 pt-4 border-t border-dark-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Size • Entry Price</span>
                    <span className="text-white">
                      ${tradeAmount || '0'} at {entryPrice.toFixed(2)} M
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Liquidated at</span>
                    <span className="text-white">{liquidationPrice.toFixed(2)} M</span>
                  </div>
                </div>

                {/* Place Trade Button */}
                <button
                  onClick={handlePlaceTrade}
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                  className={`w-full py-4 rounded-lg font-semibold transition-all ${tradeType === 'long'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Place Trade
                </button>
              </div>
            </div>

            {/* Positions */}
            {positions.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Positions</h3>
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.id} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{yapper.name} {position.type.toUpperCase()}</span>
                        <span className={`font-semibold ${position.currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {position.currentPnL >= 0 ? '+' : ''}${position.currentPnL.toFixed(2)} ({position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>Leverage: {position.leverage}X</div>
                        <div>Position Size: ${position.size.toLocaleString()}</div>
                        <div>Entry Price: {position.entryPrice.toFixed(2)} M</div>
                        <div>Liquidation Price: {position.liquidationPrice.toFixed(2)} M</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
              <p className="text-gray-400 text-sm">
                You are ranked 635th in {yapper.name}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

