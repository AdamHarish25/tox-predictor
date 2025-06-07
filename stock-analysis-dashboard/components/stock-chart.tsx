"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface StockChartProps {
  data: any[]
  dataKey: string
  predictionKey: string
}

export default function StockChart({ data = [], dataKey, predictionKey }: StockChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true)

    // Filter out any invalid data points
    const validData = data.filter(
      (item) =>
        (item[dataKey] !== null && item[dataKey] !== undefined) ||
        (item[predictionKey] !== null && item[predictionKey] !== undefined),
    )

    setChartData(validData)
  }, [data, dataKey, predictionKey])

  // Calculate domain for Y axis to ensure proper scaling
  const allValues = chartData
    .flatMap((item) => [
      item[dataKey] !== null && item[dataKey] !== undefined ? Number(item[dataKey]) : null,
      item[predictionKey] !== null && item[predictionKey] !== undefined ? Number(item[predictionKey]) : null,
    ])
    .filter((val) => val !== null && val !== undefined && !isNaN(val))

  const minValue = allValues.length > 0 ? Math.min(...allValues) * 0.95 : 0 // 5% padding below
  const maxValue = allValues.length > 0 ? Math.max(...allValues) * 1.05 : 100 // 5% padding above

  // Don't render until client-side
  if (!mounted)
    return <div className="h-[400px] w-full bg-[#2A2B2B] flex items-center justify-center">Loading chart...</div>

  // Show placeholder if no data
  if (chartData.length === 0) {
    return (
      <div className="h-[400px] w-full bg-[#2A2B2B] flex items-center justify-center text-[#2FA5D4]">
        No data available for chart
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2FA5D4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2FA5D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: "#9CA3AF" }} tickLine={{ stroke: "#4B5563" }} />
          <YAxis
            tick={{ fill: "#9CA3AF" }}
            tickLine={{ stroke: "#4B5563" }}
            domain={[minValue, maxValue]}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#2A2B2B",
              borderColor: "#2FA5D4",
              color: "white",
            }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, ""]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#2FA5D4"
            fillOpacity={1}
            fill="url(#colorClose)"
            name="Historical Price"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey={predictionKey}
            stroke="#4ADE80"
            fillOpacity={1}
            fill="url(#colorPrediction)"
            name="Predicted Price"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
