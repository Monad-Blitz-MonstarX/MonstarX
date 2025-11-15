import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { YapDataPoint } from '../types'

interface YapChartProps {
  data: YapDataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as YapDataPoint
    const isPositive = data.changePercentage >= 0
    
    return (
      <div className="bg-dark-card border border-monad-purple-500/50 rounded-xl p-4 shadow-xl">
        <p className="text-monad-purple-400 font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 text-sm">Yap 개수</span>
            <span className="text-white font-bold">{data.yapCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 text-sm">전날 대비</span>
            <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{data.changePercentage.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 text-sm">변화량</span>
            <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{data.changeFromPrevious}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  const isPositive = payload.changePercentage >= 0
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={isPositive ? '#10b981' : '#ef4444'}
      stroke="#fff"
      strokeWidth={2}
      className="hover:r-6 transition-all"
    />
  )
}

export default function YapChart({ data }: YapChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      date: new Date(point.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      fullDate: point.date,
      changePercentage: point.changePercentage, // 전날 대비 % 변화
      yapCount: point.yapCount,
      changeFromPrevious: point.changeFromPrevious,
    }))
  }, [data])

  // 최대/최소 변화율 계산 (0을 중심으로 대칭, 더 넓은 범위로 설정)
  const maxChange = Math.max(...chartData.map(d => Math.abs(d.changePercentage)))
  // ±15% 범위로 고정하여 그래프를 안쪽으로 모이게 함
  const domain = [-15, 15]

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5c" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#9ca3af' }}
            interval={Math.floor(data.length / 6)} // 30일 중 약 6개만 표시
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#9ca3af' }}
            domain={domain}
            label={{ value: '전날 대비 변화율 (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: '12px' } }}
          />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" strokeWidth={1.5} />
          <Tooltip content={<CustomTooltip />} />
          {/* 전체 선 연결 (양수/음수 모두 포함) */}
          <Line
            type="monotone"
            dataKey="changePercentage"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2.5 }}
            connectNulls={true}
          />
          {/* 각 점 표시 (양수는 초록색, 음수는 빨간색) */}
          <Line
            type="monotone"
            dataKey="changePercentage"
            stroke="none"
            strokeWidth={0}
            dot={<CustomDot />}
            activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2.5 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
