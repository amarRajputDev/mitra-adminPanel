import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Loader2 } from "lucide-react"

// ---------- Types ----------
type KV = Record<string, unknown>
type Row = { [k: string]: any }

type AnalysisResponse = {
  totalTenders: number | string
  active: number | string
  inactive: number | string
  avgPerDept: number | string
  tendersByMinistry: Array<{ ministry: string; total: number | string }>
  tendersByState: Array<{ state: string; total: number | string }>
  tendersByCategory: Array<{ category: string; total: number | string }>
  tendersLast7Days: Array<{ date: string; total: number | string }>
}

// ---------- Helpers (safe parsing) ----------
const num = (v: unknown, def = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}
const arr = <T extends Row>(v: unknown, def: T[] = []): T[] => (Array.isArray(v) ? (v as T[]) : def)

// ---------- Sample Fallback ----------
const SAMPLE: AnalysisResponse = {
  totalTenders: 31245,
  active: 24567,
  inactive: 6688,
  avgPerDept: 421.5,
  tendersByMinistry: [
    { ministry: "Railways", total: 5678 },
    { ministry: "Defence", total: 4231 },
    { ministry: "Rural Development", total: 3500 },
    { ministry: "Health", total: 2999 },
    { ministry: "Education", total: 1890 },
  ],
  tendersByState: [
    { state: "Maharashtra", total: 3124 },
    { state: "Uttar Pradesh", total: 2901 },
    { state: "Gujarat", total: 2488 },
    { state: "Tamil Nadu", total: 2010 },
    { state: "Karnataka", total: 1888 },
  ],
  tendersByCategory: [
    { category: "Construction", total: 1450 },
    { category: "Electrical", total: 1342 },
    { category: "IT Services", total: 1200 },
    { category: "Medical Equipment", total: 1080 },
    { category: "Consultancy", total: 950 },
  ],
  tendersLast7Days: [
    { date: "2025-10-23", total: 55 },
    { date: "2025-10-24", total: 73 },
    { date: "2025-10-25", total: 62 },
    { date: "2025-10-26", total: 89 },
    { date: "2025-10-27", total: 95 },
    { date: "2025-10-28", total: 80 },
    { date: "2025-10-29", total: 104 },
  ],
}

// Recharts colors (theme-agnostic)
const COLORS = ["#3b82f6", "#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#f97316"]

export default function AdvancedAnalysis() {
  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get<AnalysisResponse>("http://localhost:3001/api/admin/advanced-analysis", {
          timeout: 8000,
        })
        if (!mounted) return
        // Basic normalization to guard types
        const d = res.data || ({} as KV)
        setData({
          totalTenders: num((d as KV).totalTenders),
          active: num((d as KV).active),
          inactive: num((d as KV).inactive),
          avgPerDept: num((d as KV).avgPerDept),
          tendersByMinistry: arr((d as KV).tendersByMinistry).map((r) => ({
            ministry: String(r.ministry ?? "-"),
            total: num(r.total),
          })),
          tendersByState: arr((d as KV).tendersByState).map((r) => ({
            state: String(r.state ?? "-"),
            total: num(r.total),
          })),
          tendersByCategory: arr((d as KV).tendersByCategory).map((r) => ({
            category: String(r.category ?? "-"),
            total: num(r.total),
          })),
          tendersLast7Days: arr((d as KV).tendersLast7Days).map((r) => ({
            date: String(r.date ?? "-"),
            total: num(r.total),
          })),
        })
      } catch (e: any) {
        // Fallback to sample data on any error
        if (!mounted) return
        setError(e?.message || "Failed to load analysis, showing sample data.")
        setData(SAMPLE)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        <Loader2 className="animate-spin mr-2" />
        Loading insights...
      </div>
    )
  }

  if (!data) return null

  // Safely parsed primitives
  const total = num(data.totalTenders)
  const active = num(data.active)
  const inactive = num(data.inactive)
  const avgPerDept = num(data.avgPerDept)

  // Safely parsed arrays
  const byMinistry = arr(data.tendersByMinistry)
  const byState = arr(data.tendersByState)
  const byCategory = arr(data.tendersByCategory)
  const last7 = arr(data.tendersLast7Days)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Advanced Tender Analysis</h1>
        {error && <p className="text-xs text-muted-foreground mt-1">Note: {error}</p>}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tenders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tenders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-500">{active}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inactive Tenders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-500">{inactive}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg / Department</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-blue-500">
            {avgPerDept.toFixed ? avgPerDept.toFixed(1) : num(avgPerDept).toFixed(1)}
          </CardContent>
        </Card>
      </div>

      {/* Tenders by Ministry */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Tenders by Ministry</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byMinistry}>
              <XAxis dataKey="ministry" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="total" nameKey="category" label>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top States */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Top States by Tenders</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byState}>
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Last 7 Days */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Tenders Created (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
