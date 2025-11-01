// pages/admin/PlansPage.tsx
import { useEffect, useMemo, useState } from "react";
import { usePlansStore } from "../../store/plans.z";
import { Search, Layers, Circle, Package, Filter, Clock } from "lucide-react";
// ⬇️ use shadcn/ui Select instead of raw Radix
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddPlanButton } from "../../components/plans/AddPlan";
import { EditPlanDialog } from "@/components/plans/PlanEditDialog";
import { PlanDetailsDialog } from "@/components/plans/PlanDetailsDialog";

const Badge = ({ children, color = "slate" }: { children: any; color?: "green" | "red" | "slate" }) => {
  const map: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[color]}`}>{children}</span>;
};

const Card = ({ children }: { children: any }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">{children}</div>
);

export default function PlansPage() {
  const { items, loading, error, fetchPlans, search, setSearch, filterStatus, setFilterStatus } = usePlansStore();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [p, setP] = useState<any>(null);

  // initial load
  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search → backend
  const [debouncedQ, setDebouncedQ] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // re-fetch when filter or debounced search changes
  useEffect(() => {
    fetchPlans({ status: filterStatus, q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, debouncedQ]);

  // stats from server items (no client-side filter)
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((x) => x.status === "active").length;
    const inactive = total - active;
    const avgPrice = total ? Math.round(items.reduce((s, it) => s + Number(it.price || 0), 0) / total) : 0;
    return { total, active, inactive, avgPrice };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Subscription Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage pricing plans and features</p>
        </div>
        <AddPlanButton onCreated={() => fetchPlans({ status: filterStatus, q: debouncedQ })} />
      </div>

      {/* Toolbar */}
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // optional instant fetch on Enter:
              onKeyDown={(e) => e.key === "Enter" && fetchPlans({ status: filterStatus, q: (e.target as HTMLInputElement).value })}
              placeholder="Search plans…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200">Status</span>

              {/* ✅ shadcn/ui Select */}
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as "all" | "active" | "inactive")}
              >
                <SelectTrigger className="ml-2 w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Total Plans</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Circle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-xl font-semibold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Circle className="h-5 w-5 rotate-180 text-rose-400" />
            <div>
              <p className="text-xs text-slate-500">Inactive</p>
              <p className="text-xl font-semibold">{stats.inactive}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Average Price</p>
              <p className="text-xl font-semibold">₹{stats.avgPrice.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-3 font-medium">Plan</th>
                <th className="py-3 font-medium">Price</th>
                <th className="py-3 font-medium">Duration</th>
                <th className="py-3 font-medium">Tender Limit</th>
                <th className="py-3 font-medium">Coverage</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Created</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading plans…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No plans found.
                  </td>
                </tr>
              )}
              {!loading && !error && items.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.code}</span>
                    </div>
                  </td>
                  <td className="py-3">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {p.duration_days} days
                    </div>
                  </td>
                  <td className="py-3">{p.tender_limit ?? "—"}</td>
                  <td className="py-3">{p.is_all_india ? "All India" : (p.state_limit ? `${p.state_limit} states` : "Custom")}</td>
                  <td className="py-3">{p.status === "active" ? <Badge color="green">active</Badge> : <Badge color="red">inactive</Badge>}</td>
                  <td className="py-3">{p.created_at_ist ? String(p.created_at_ist).slice(0, 10) : "—"}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border px-2 py-1 text-xs"
                        onClick={() => { setP(p); setViewOpen(true); }}
                      >
                        View
                      </button>
                      <button
                        className="rounded-lg border px-2 py-1 text-xs"
                        onClick={() => { setP(p); setEditOpen(true); }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <PlanDetailsDialog planId={p?.id} open={viewOpen} onOpenChange={setViewOpen} />
          <EditPlanDialog plan={p} open={editOpen} onOpenChange={setEditOpen} onSaved={() => fetchPlans({ status: filterStatus, q: debouncedQ })} />
        </div>
      </Card>
    </div>
  );
}
