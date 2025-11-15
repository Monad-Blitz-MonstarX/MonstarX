import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { UserTradingStats, YapperTradingStats, MarketAnalytics } from '../types'
import { mockUserStats, mockYapperStats, mockMarketAnalytics } from '../data/analyticsData'
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react'

type TabType = 'personal' | 'market'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  const userStats = mockUserStats
  const yapperStats = mockYapperStats
  const marketAnalytics = mockMarketAnalytics

  const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="h-full bg-dark-bg overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">
            개인 투자 성향과 시장 트렌드를 분석하세요
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'personal'
                ? 'bg-monad-purple-500 text-white'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            개인 분석
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'market'
                ? 'bg-monad-purple-500 text-white'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            시장 분석
          </button>
        </div>

        {/* Personal Analytics */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">총 거래 수</span>
                  <Target className="w-5 h-5 text-monad-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{userStats.totalTrades}</div>
              </div>
              
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">승률</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">{userStats.winRate.toFixed(1)}%</div>
              </div>
              
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">총 손익</span>
                  <DollarSign className="w-5 h-5 text-monad-purple-400" />
                </div>
                <div className={`text-2xl font-bold ${userStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${userStats.totalPnL >= 0 ? '+' : ''}{userStats.totalPnL.toLocaleString(2)}
                </div>
              </div>
              
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">평균 레버리지</span>
                  <Users className="w-5 h-5 text-monad-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{userStats.averageLeverage.toFixed(1)}x</div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 롱/숏 비율 */}
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">롱/숏 비율</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '롱', value: userStats.longShortRatio * 100 },
                        { name: '숏', value: (1 - userStats.longShortRatio) * 100 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 선호 야퍼 */}
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">선호 야퍼 Top 5</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userStats.favoriteYappers.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252533" />
                    <XAxis dataKey="yapperName" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a24',
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="tradeCount" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 거래 히스토리 */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">거래 히스토리</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userStats.tradingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252533" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line type="monotone" dataKey="trades" stroke="#8b5cf6" strokeWidth={2} name="거래 수" />
                  <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} name="손익" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Market Analytics */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">전체 거래량</span>
                  <DollarSign className="w-5 h-5 text-monad-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">${marketAnalytics.totalVolume.toLocaleString()}</div>
              </div>
              
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">전체 트레이더</span>
                  <Users className="w-5 h-5 text-monad-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{marketAnalytics.totalTraders.toLocaleString()}</div>
              </div>
              
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">전체 롱/숏 비율</span>
                  {marketAnalytics.overallLongShortRatio > 0.5 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="text-2xl font-bold text-white">
                  {(marketAnalytics.overallLongShortRatio * 100).toFixed(1)}% 롱
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 인기 야퍼 */}
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">인기 야퍼 Top 5</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketAnalytics.topYappers.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252533" />
                    <XAxis dataKey="yapperName" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a24',
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="volume" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 야퍼별 트레이딩 성향 */}
              <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">야퍼별 트레이딩 성향</h3>
                <div className="space-y-4">
                  {yapperStats.slice(0, 5).map((stat, index) => (
                    <div key={stat.yapperId} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{stat.yapperName}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          stat.traderSentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                          stat.traderSentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {stat.traderSentiment === 'bullish' ? '강세' : stat.traderSentiment === 'bearish' ? '약세' : '중립'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>롱 {(stat.longShortRatio * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>평균 레버리지 {stat.averageLeverage.toFixed(1)}x</span>
                        <span>•</span>
                        <span>{stat.totalTraders}명 거래</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 거래량 트렌드 */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">거래량 트렌드</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketAnalytics.volumeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252533" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

