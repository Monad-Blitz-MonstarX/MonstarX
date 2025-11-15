import { useMemo } from 'react'
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { YapDataPoint } from '../types'

interface YapChartProps {
    data: YapDataPoint[]
}

export default function YapChart({ data }: YapChartProps) {
    const chartData = useMemo(() => {
        return data.map((point) => ({
            date: point.date,
            displayDate: new Date(point.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            dailyYaps: point.dailyYaps,
            changeFromPrevious: point.changeFromPrevious,
            changePercentage: point.changePercentage,
            positiveChange: point.changeFromPrevious >= 0 ? point.changeFromPrevious : null,
            negativeChange: point.changeFromPrevious < 0 ? point.changeFromPrevious : null,
            positiveArea: point.changeFromPrevious >= 0 ? point.changeFromPrevious : 0,
            negativeArea: point.changeFromPrevious < 0 ? point.changeFromPrevious : 0,
        }))
    }, [data])

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <defs>
                        <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#252533"
                        vertical={false}
                        opacity={0.5}
                    />
                    <XAxis
                        dataKey="displayDate"
                        stroke="#6b7280"
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#9ca3af' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#9ca3af' }}
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => value.toLocaleString()}
                    />
                    <ReferenceLine
                        y={0}
                        stroke="#6b7280"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        opacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a24',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff',
                            padding: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        }}
                        labelStyle={{
                            color: '#e5e7eb',
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '8px',
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === 'changeFromPrevious' || name === 'positiveChange' || name === 'negativeChange') {
                                const isPositive = value >= 0
                                return [
                                    <span
                                        key="value"
                                        style={{
                                            color: isPositive ? '#10b981' : '#ef4444',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {isPositive ? '+' : ''}{value.toLocaleString()} Yap
                                    </span>,
                                    <span key="label" style={{ color: '#9ca3af', fontSize: '12px' }}>
                                        전날 대비 변화량
                                    </span>
                                ]
                            }
                            return [value, name]
                        }}
                        labelFormatter={(label) => (
                            <span style={{ color: '#e5e7eb' }}>📅 {label}</span>
                        )}
                        cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    {/* Positive Area */}
                    <Area
                        type="monotone"
                        dataKey="positiveArea"
                        fill="url(#positiveGradient)"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                    {/* Negative Area */}
                    <Area
                        type="monotone"
                        dataKey="negativeArea"
                        fill="url(#negativeGradient)"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                    {/* Positive Line */}
                    <Line
                        type="monotone"
                        dataKey="positiveChange"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#1a1a24' }}
                        activeDot={{
                            r: 6,
                            fill: '#10b981',
                            stroke: '#1a1a24',
                            strokeWidth: 2,
                        }}
                        connectNulls={false}
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                    {/* Negative Line */}
                    <Line
                        type="monotone"
                        dataKey="negativeChange"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#1a1a24' }}
                        activeDot={{
                            r: 6,
                            fill: '#ef4444',
                            stroke: '#1a1a24',
                            strokeWidth: 2,
                        }}
                        connectNulls={false}
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}

