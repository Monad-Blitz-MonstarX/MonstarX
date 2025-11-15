import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockYappers, generateMockYapData } from '../data/mockData'
import { Yapper, YapDataPoint, Position } from '../types'
import YapChart from '../components/YapChart'
import { useWallet } from '../contexts/WalletContext'
import { MON_PRICE_USDC, INFLUENCER_VAULT_ADDRESS } from '../config/monad'
import { openPosition, closePosition, getUserActivePositions, getUserClosedPositions } from '../utils/vault'
import { ArrowLeft, TrendingUp, TrendingDown, Info, X, AlertTriangle, Plus } from 'lucide-react'
import { BrowserProvider } from 'ethers'

export default function YapperDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [yapper, setYapper] = useState<Yapper | null>(null)
  const [yapChartData, setYapChartData] = useState<YapDataPoint[]>([])
  const { getMonBalance, signer, address, provider } = useWallet()
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long')
  const [tradeAmount, setTradeAmount] = useState('')
  const [leverage, setLeverage] = useState(1)
  const [balance, setBalance] = useState<string | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [closedPositions, setClosedPositions] = useState<Position[]>([]) // Closed positions for this yapper
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')

  // 실제 잔액 및 포지션 조회
  useEffect(() => {
    const fetchData = async () => {
      // 잔액 조회
      const monBalance = await getMonBalance()
      setBalance(monBalance || '0')
      
      // 포지션 조회 (지갑 연결된 경우)
      if (address && provider && yapper) {
        try {
          const activePositions = await getUserActivePositions(provider as BrowserProvider, address)
          // 현재 yapper의 포지션만 필터링
          const yapperPositions = activePositions.filter((p: any) => p.influencerId === yapper.id)
          setPositions(yapperPositions)
          
          const closedPositions = await getUserClosedPositions(provider as BrowserProvider, address)
          const yapperClosedPositions = closedPositions.filter((p: any) => p.influencerId === yapper.id)
          setClosedPositions(yapperClosedPositions)
        } catch (error) {
          console.error('포지션 조회 실패:', error)
        }
      }
    }
    fetchData()
  }, [getMonBalance, address, provider, yapper])

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
      // 30일 Yap 차트 데이터 생성
      const data = generateMockYapData(foundYapper.id, foundYapper.totalYaps)
      setYapChartData(data)
    }
  }, [id])

  if (!yapper) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Yapper not found</div>
      </div>
    )
  }

  // 현재 Yap 개수와 변화량 (%)
  const currentYapCount = yapChartData.length > 0 ? yapChartData[yapChartData.length - 1].yapCount : yapper.totalYaps
  const yesterdayYapCount = yapChartData.length > 1 ? yapChartData[yapChartData.length - 2].yapCount : yapper.totalYaps
  const yapChangePercentage = yesterdayYapCount > 0 
    ? ((currentYapCount - yesterdayYapCount) / yesterdayYapCount) * 100 
    : 0
  const isPositive = yapChangePercentage >= 0

  const handlePlaceTrade = async () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return
    
    if (!signer) {
      alert('지갑을 연결해주세요!')
      return
    }

    try {
      // Vault 컨트랙트에 포지션 오픈 트랜잭션 전송
      const result = await openPosition(
        signer,
        yapper.id, // 인플루언서 ID
        tradeType === 'long', // true면 롱, false면 숏
        tradeAmount // MON 단위 증거금
      )

      if (result.success) {
        alert(`포지션이 성공적으로 오픈되었습니다!\n포지션 ID: ${result.positionId}\n트랜잭션 해시: ${result.txHash}`)
        setTradeAmount('')
        
        // 포지션 목록 새로고침
        if (address && provider && yapper) {
          try {
            const activePositions = await getUserActivePositions(provider as BrowserProvider, address)
            const yapperPositions = activePositions.filter((p: any) => p.influencerId === yapper.id)
            setPositions(yapperPositions)
          } catch (error) {
            console.error('포지션 새로고침 실패:', error)
          }
        }
      } else {
        alert(`포지션 오픈 실패: ${result.error}`)
      }
    } catch (error: any) {
      console.error('포지션 오픈 오류:', error)
      alert(`포지션 오픈 중 오류가 발생했습니다: ${error.message}`)
    }
  }

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
        // 포지션을 활성 목록에서 제거하고 Closed 목록에 추가
        const closedPosition = positions.find(p => p.id === positionId)
        if (closedPosition) {
          setPositions(positions.filter(p => p.id !== positionId))
          // TODO: 실제로는 컨트랙트에서 종료된 포지션 정보를 가져와서 추가해야 함
          // 현재는 더미로 처리
          setClosedPositions([...closedPositions, closedPosition])
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

  const balanceNum = parseFloat(balance || '0')
  const balanceInUSDC = balanceNum * MON_PRICE_USDC // MON 잔액을 USDC로 변환
  const maxAmount = balanceNum / leverage
  const entryPrice = currentYapCount // Yap 개수를 진입 가격으로 사용
  const liquidationPrice = tradeType === 'long' 
    ? entryPrice * (1 - 0.8 / leverage) 
    : entryPrice * (1 + 0.8 / leverage)

  return (
    <div className="h-full bg-dark-bg overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button with Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leaderboard</span>
          </button>
          {yapper && (
            <>
              <span className="text-gray-500">/</span>
              <span className="text-white font-semibold">{yapper.name}</span>
            </>
          )}
        </div>

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
                    <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}></div>
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
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Yaps</div>
                  <div className="text-lg font-semibold text-white">{yapper.totalYaps}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">24h Change</div>
                  <div className={`text-lg font-semibold ${yapChartData.length > 0 && yapChartData[yapChartData.length - 1].changePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {yapChartData.length > 0 
                      ? `${yapChartData[yapChartData.length - 1].changePercentage >= 0 ? '+' : ''}${yapChartData[yapChartData.length - 1].changePercentage.toFixed(2)}%`
                      : '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Followers</div>
                  <div className="text-lg font-semibold text-white">{(yapper.followers / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Smart %</div>
                  <div className="text-lg font-semibold text-monad-purple-400">{yapper.smartPercentage.toFixed(2)}%</div>
                </div>
              </div>
            </div>

            {/* Yap Chart - 30일 차트 */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white">Yap Count (30 Days)</h2>
                    <div className="flex items-center gap-2">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {currentYapCount.toLocaleString()}
                      </span>
                      <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        ({isPositive ? '+' : ''}{yapChangePercentage.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    전날 대비 변화율
                  </div>
                </div>
              </div>
              
              {/* TODO: 실제 Kaito API에서 Yap 데이터를 가져오세요 */}
              {/* 예: const yapData = await fetchYapDataFromKaito(yapper.username) */}
              
              <div className="h-80">
                <YapChart data={yapChartData} />
              </div>
              
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Data from Kaito API</span>
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
            {/* Positions Panel with Tabs */}
            <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-dark-border">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`flex-1 px-4 py-3 font-semibold text-sm transition-colors relative ${
                    activeTab === 'open'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Open Position
                  {activeTab === 'open' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-monad-purple-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('closed')}
                  className={`flex-1 px-4 py-3 font-semibold text-sm transition-colors relative ${
                    activeTab === 'closed'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Closed Position
                  {activeTab === 'closed' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-monad-purple-500"></div>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'open' ? (
                  <div className="space-y-6">
                    {/* New Position Form */}
                    <div>
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setTradeType('long')}
                          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
                            tradeType === 'long'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                              : 'bg-dark-surface text-gray-400 border border-dark-border hover:border-gray-600'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 inline mr-2" />
                          Long
                        </button>
                        <button
                          onClick={() => setTradeType('short')}
                          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
                            tradeType === 'short'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : 'bg-dark-surface text-gray-400 border border-dark-border hover:border-gray-600'
                          }`}
                        >
                          <TrendingDown className="w-4 h-4 inline mr-2" />
                          Short
                        </button>
                      </div>

                      {/* Balance */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Balance</span>
                          <div className="text-right">
                            <div className="text-sm text-white font-semibold">{balanceNum.toFixed(4)} MON</div>
                            <div className="text-xs text-gray-500">≈ ${balanceInUSDC.toFixed(4)} USDC</div>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0.00"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            className="w-full pl-4 pr-16 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-monad-purple-500 focus:ring-1 focus:ring-monad-purple-500 text-sm"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">MON</span>
                        </div>
                      </div>

                      {/* Leverage */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Leverage</span>
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
                            className="px-2 py-1 bg-dark-surface border border-dark-border rounded text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            1x
                          </button>
                        </div>
                      </div>

                      {/* Trade Info */}
                      <div className="space-y-2 pt-4 border-t border-dark-border mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Size • Entry Price</span>
                          <span className="text-white">
                            {tradeAmount || '0'} MON at {entryPrice.toFixed(2)} Yap
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Liquidated at</span>
                          <span className="text-white">{liquidationPrice.toFixed(2)} Yap</span>
                        </div>
                      </div>

                      {/* Open Position Button */}
                      <button
                        onClick={handlePlaceTrade}
                        disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          tradeType === 'long'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Plus className="w-4 h-4" />
                        Open Position
                      </button>
                    </div>

                    {/* Active Positions List */}
                    {positions.length > 0 && (
                      <div className="pt-6 border-t border-dark-border">
                        <h4 className="text-sm font-semibold text-white mb-3">Active Positions ({positions.length})</h4>
                        <div className="space-y-3">
                          {positions.map((position) => {
                            const isLong = position.type === 'long'
                            const isProfit = position.currentPnL >= 0
                            
                            return (
                              <div 
                                key={position.id} 
                                className="p-3 bg-dark-surface/50 rounded-lg border border-dark-border/50 hover:border-monad-purple-500/40 transition-all duration-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                      isLong 
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                                    }`}>
                                      {isLong ? 'LONG' : 'SHORT'}
                                    </span>
                                    <span className="text-white text-sm font-medium">{yapper.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                      {isProfit ? '+' : ''}${position.currentPnL.toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                      {isProfit ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
                                  <div>
                                    <span className="text-gray-500">크기:</span> ${position.size.toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="text-gray-500">레버리지:</span> {position.leverage}x
                                  </div>
                                  <div>
                                    <span className="text-gray-500">진입:</span> {position.entryPrice.toFixed(2)} Yap
                                  </div>
                                  <div>
                                    <span className="text-gray-500">청산:</span> <span className="text-red-400">{position.liquidationPrice.toFixed(2)} Yap</span>
                                  </div>
                                </div>
                                
                                {/* Close Position Button */}
                                <button
                                  onClick={() => handleClosePosition(position.id)}
                                  disabled={closingPositionId === position.id}
                                  className={`w-full px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                                    isProfit
                                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 hover:border-green-500/60'
                                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 hover:border-red-500/60'
                                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                >
                                  {closingPositionId === position.id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                      종료 중...
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3" />
                                      Close Position
                                    </>
                                  )}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Closed Positions Tab */
                  <div>
                    {closedPositions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-sm mb-1">종료된 포지션이 없습니다</div>
                        <div className="text-gray-500 text-xs">포지션을 종료하면 여기에 표시됩니다</div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
                        {closedPositions.map((position) => {
                          const isLong = position.type === 'long'
                          const isProfit = position.currentPnL >= 0
                          
                          return (
                            <div 
                              key={position.id} 
                              className="p-3 bg-dark-surface/50 rounded-lg border border-dark-border/50 hover:border-monad-purple-500/40 transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    isLong 
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  }`}>
                                    {isLong ? 'LONG' : 'SHORT'}
                                  </span>
                                  <span className="text-white text-sm font-medium">{yapper.name}</span>
                                </div>
                                <div className={`text-sm font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                  {isProfit ? '+' : ''}${position.currentPnL.toFixed(2)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                <div>
                                  <span className="text-gray-500">크기:</span> ${position.size.toLocaleString()}
                                </div>
                                <div>
                                  <span className="text-gray-500">진입:</span> {position.entryPrice.toFixed(2)} Yap
                                </div>
                                <div>
                                  <span className="text-gray-500">레버리지:</span> {position.leverage}x
                                </div>
                                <div>
                                  <span className="text-gray-500">PnL:</span> <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
                                    {isProfit ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
              <p className="text-gray-400 text-sm">
                {/* TODO: 실제 사용자 랭킹 API 연동 */}
                {/* 현재는 더미 데이터입니다. 실제 API에서 사용자의 {yapper.name}에 대한 랭킹을 가져와야 합니다. */}
                You are ranked 635th in {yapper.name}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

