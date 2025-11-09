import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts"
import type { LabelProps } from "recharts"

import type { BookItem } from "../lib/loadData"

type Props = {
  items: BookItem[]
  mode: "category" | "rating"
  setMode: (m: "category" | "rating") => void
}

function tally<T extends string | number>(arr: T[]) {
  const m = new Map<T, number>()
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1)
  return m
}

export default function Chart({ items, mode, setMode }: Props) {
  const data = React.useMemo(() => {
    if (!items || items.length === 0) return []

    if (mode === "category") {
      const withCategory = items.filter((i) => i.category && i.category.trim())
      if (withCategory.length === 0) {
        const ratingTally = tally(items.map((i) => i.rating ?? 0))
        return Array.from({ length: 6 }, (_, r) => ({ name: `${r}★`, count: ratingTally.get(r) || 0 }))
      }
      const m = tally(withCategory.map((i) => i.category))
      const rows = Array.from(m, ([name, count]) => ({ name, count }))
      rows.sort((a, b) => b.count - a.count)
      return rows.slice(0, 12)
    }

    const m = tally(items.map((i) => i.rating ?? 0))
    return Array.from({ length: 6 }, (_, r) => ({ name: `${r}★`, count: m.get(r) || 0 }))
  }, [items, mode])

  const barFill = "var(--brand-light)"
  const gridStroke = "#e5e7eb"
  const axisTick = "#334155"

  const renderBarLabel = (p: LabelProps) => {
    const { x, y, value, textAnchor } = p
    if (typeof value !== "number" || value === 0) return null
    return (
      <text
        x={Number(x)}
        y={Number(y) - 4}
        textAnchor={(textAnchor ?? "middle") as any}
        fontSize={12}
        fill={axisTick}
      >
        {value}
      </text>
    )
  }

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Distribution</h2>
        <div className="inline-flex overflow-hidden rounded-md border border-gray-200 bg-white">
          <button
            className={`px-3 py-1 text-sm transition-colors ${
              mode === "category" ? "bg-gray-100" : "bg-transparent"
            }`}
            onClick={() => setMode("category")}
          >
            By Category
          </button>
          <button
            className={`px-3 py-1 text-sm transition-colors ${
              mode === "rating" ? "bg-gray-100" : "bg-transparent"
            }`}
            onClick={() => setMode("rating")}
          >
            By Rating
          </button>
        </div>
      </div>

      <div className="w-full rounded-lg border border-gray-200 bg-white p-3">
        {data.length === 0 ? (
          <div className="grid h-[260px] place-items-center text-sm text-gray-500">
            No data for current filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid stroke={gridStroke} strokeOpacity={0.35} />
              <XAxis
                dataKey="name"
                tick={{ fill: axisTick, fontSize: 12 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fill: axisTick, fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: `1px solid ${gridStroke}`,
                  color: axisTick,
                }}
                formatter={(v) => [String(v), "count"]}
              />
              <Bar dataKey="count" fill={barFill} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {mode === "category" ? "Top 12 categories by count" : "Counts for ratings 0–5★"}
      </p>
    </div>
  )
}
