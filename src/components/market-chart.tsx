
"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { MarketDataSeries } from "@/services/market-data"
import { useTheme } from "next-themes"

type MarketChartProps = {
  data: MarketDataSeries
}

export default function MarketChart({ data }: MarketChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const chartConfig = {
    price: {
      label: "Price",
      color: isDark ? "hsl(var(--chart-1))" : "hsl(var(--primary))",
    },
    ema20: {
      label: "EMA 20",
      color: isDark ? "hsl(var(--chart-2))" : "hsl(var(--chart-4))",
    },
    ema50: {
      label: "EMA 50",
      color: isDark ? "hsl(var(--chart-5))" : "hsl(var(--chart-2))",
    },
  }

  const formattedData = data.map(d => ({
    ...d,
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }))

  const domain = [
    Math.min(...data.map(d => d.price)) * 0.995,
    Math.max(...data.map(d => d.price)) * 1.005,
  ]

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <AreaChart
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
            domain={domain}
            tickFormatter={(value) => value.toFixed(4)}
            fontSize={12}
        />
        <Tooltip
          cursor={true}
          content={<ChartTooltipContent indicator="line" />}
        />
        <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.price.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartConfig.price.color} stopOpacity={0.1} />
            </linearGradient>
        </defs>
        <Area
          dataKey="price"
          type="natural"
          fill="url(#fillPrice)"
          stroke={chartConfig.price.color}
          stackId="a"
        />
        <Area
          dataKey="ema20"
          type="natural"
          fillOpacity={0}
          stroke={chartConfig.ema20.color}
          strokeWidth={2}
        />
         <Area
          dataKey="ema50"
          type="natural"
          fillOpacity={0}
          stroke={chartConfig.ema50.color}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
