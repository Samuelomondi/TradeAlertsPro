
"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { MarketDataSeries } from "@/services/market-data"
import { useTheme } from "next-themes"

type MarketChartProps = {
  data: MarketDataSeries[]
}

export default function MarketChart({ data }: MarketChartProps) {
  const { resolvedTheme } = useTheme()
  
  const chartConfig = React.useMemo(() => {
    const isDark = resolvedTheme === 'dark'
    return ({
        price: {
          label: "Price",
          color: isDark ? "hsl(var(--chart-1))" : "hsl(var(--primary))",
        },
        ema20: {
          label: "EMA 20",
          color: isDark ? "hsl(var(--chart-4))" : "hsl(var(--chart-4))",
        },
        ema50: {
          label: "EMA 50",
          color: isDark ? "hsl(var(--chart-2))" : "hsl(var(--chart-2))",
        },
    })
  }, [resolvedTheme]);

  const formattedData = data.map(d => ({
    ...d,
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })).reverse() // Reverse to show oldest data first

  return (
    <ChartContainer config={chartConfig} className="w-full h-64">
      <LineChart
        accessibilityLayer
        data={formattedData}
        margin={{
          left: -20,
          right: 12,
          top: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={8}
          fontSize={12}
        />
        <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={['dataMin - (dataMin * 0.002)', 'dataMax + (dataMax * 0.002)']}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(5) : ''}
            fontSize={12}
        />
        <Tooltip
          cursor={true}
          content={<ChartTooltipContent indicator="line" />}
        />
         <Legend content={<ChartLegendContent />} />
        <Line
          dataKey="price"
          type="natural"
          stroke={chartConfig.price.color}
          strokeWidth={2}
          dot={false}
          name="Price"
        />
        <Line
          dataKey="ema20"
          type="natural"
          stroke={chartConfig.ema20.color}
          strokeWidth={2}
          connectNulls
          dot={false}
          name="EMA 20"
        />
         <Line
          dataKey="ema50"
          type="natural"
          stroke={chartConfig.ema50.color}
          strokeWidth={2}
          connectNulls
          dot={false}
          name="EMA 50"
        />
      </LineChart>
    </ChartContainer>
  )
}

