import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarDays, Eye, Loader2, MapPin } from "lucide-react"

type TenderRow = {
  id: number
  bidNumber: string
  status: "active" | "inactive"
  start_date: string | null
  end_date: string | null
  ministry: string | null
  department: string | null
  primary_location: { state?: string | null; city?: string | null }
  categories: string[]
  items: string[]
  states: string[]
  cities: string[]
  created_at?: string
}

export default function TendersPage() {
  const [data, setData] = useState<TenderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"" | "active" | "inactive">("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)

  const [selected, setSelected] = useState<TenderRow | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const fetchTenders = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:3001/api/admin/tenders", {
        params: { q, status, page, limit },
      })
      console.log(res.data)
      setData(res.data.tenders || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error("Fetch tenders error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTenders()
  }

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tenders</h1>
          <p className="text-sm text-muted-foreground">Search and review tenders from all sources</p>
        </div>
      </div>

      {/* Toolbar */}
      <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by Bid No. / Created by"
          className="w-full sm:w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <Button type="submit">Search</Button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Bid No.</th>
              <th className="px-3 py-2 text-left">Ministry / Dept.</th>
              <th className="px-3 py-2 text-left">Categories</th>
              <th className="px-3 py-2 text-left">Items</th>
              <th className="px-3 py-2 text-left">Locations</th>
              <th className="px-3 py-2 text-left">Window</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : data.length ? (
              data.map((t) => (
                <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{t.bidNumber || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span>{t.ministry || "—"}</span>
                      <span className="text-xs text-muted-foreground">{t.department || "—"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-1">
                      {t.categories?.length ? t.categories.join(", ") : "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="line-clamp-1">
                      {t.items?.length ? t.items.join(", ") : "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {t.states?.length ? `${t.states.length} states` : t.primary_location?.state || "—"}
                      {t.cities?.length ? ` · ${t.cities.length} cities` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      {t.start_date ? new Date(t.start_date).toLocaleDateString() : "—"} –{" "}
                      {t.end_date ? new Date(t.end_date).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(t)
                        setViewOpen(true)
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No tenders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </Button>
          <Button variant="outline" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tender Detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground">Bid Number</div>
                  <div className="font-medium">{selected.bidNumber || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">{selected.status}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ministry</div>
                  <div className="font-medium">{selected.ministry || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Department</div>
                  <div className="font-medium">{selected.department || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Start</div>
                  <div className="font-medium">
                    {selected.start_date ? new Date(selected.start_date).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">End</div>
                  <div className="font-medium">
                    {selected.end_date ? new Date(selected.end_date).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Categories</div>
                <div className="text-foreground">{selected.categories?.join(", ") || "—"}</div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Items</div>
                <div className="text-foreground">{selected.items?.join(", ") || "—"}</div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Locations</div>
                <div className="text-foreground">
                  {selected.states?.length ? `${selected.states.join(", ")}` : (selected.primary_location?.state || "—")}
                  {selected.cities?.length ? ` · Cities: ${selected.cities.join(", ")}` : ""}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
