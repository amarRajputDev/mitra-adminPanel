import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";



export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setErr(null);
    try {
      const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const res = await axios.get(`${base}/dashboard`);
      setData(res.data);
      console.log(res.data)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const money = (v: any, ccy = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: ccy }).format(Number(v || 0));

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = data?.summary || {};
  const revDaily = data?.trends?.revenue_daily || [];
  const signupDaily = data?.trends?.signups_daily || [];
  const viewsDaily = data?.trends?.views_daily || [];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
       
          <Button onClick={downloadJSON} disabled={!data}>
            <Download className="w-4 h-4 mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      {data && (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <Stat label="Total Users" value={s.total_users} />
            <Stat label="Active Profiles" value={s.active_profiles} />
            <Stat label="New (7d)" value={s.new_users_7d} />
            <Stat label="Active Subscribers" value={s.active_subscribers} />
            <Stat label="Revenue (all time)" value={money(s.total_revenue)} />
            <Stat label="Payments (success)" value={s.successful_payments} />
            <Stat label="Pending Amount" value={money(s.pending_amount)} />
            <Stat label="Tenders Open / Closed" value={`${s.tenders_open} / ${s.tenders_closed}`} />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2">
              <CardHeader><CardTitle>Revenue (last 30 days)</CardTitle></CardHeader>
              <CardContent className="h-64">
                {revDaily.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revDaily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(v) => money(v)} />
                      <Bar dataKey="amount" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>New Users (last 30 days)</CardTitle></CardHeader>
              <CardContent className="h-64">
                {signupDaily.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={signupDaily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SECOND ROW OF CHARTS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-1">
              <CardHeader><CardTitle>Viewed Tenders (last 30 days)</CardTitle></CardHeader>
              <CardContent className="h-64">
                {viewsDaily.length === 0 ? <Empty /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsDaily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top Plans</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable rows={data.top?.plans} cols={["plan_name", "users"]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top Keywords</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable rows={data.top?.keywords} cols={["keyword", "uses"]} />
              </CardContent>
            </Card>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2 pr-4">User</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Gateway</th>
                        <th className="py-2 pr-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.recent?.payments || []).map((p: any) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{p.display_id ?? p.id}</td>
                          <td className="py-2 pr-4">{p.userName} (#{p.user_id})</td>
                          <td className="py-2 pr-4">{money(p.amount, p.currency)}</td>
                          <td className="py-2 pr-4"><Badge variant={p.status === "success" ? "default" : "secondary"}>{p.status}</Badge></td>
                          <td className="py-2 pr-4">{p.gateway}</td>
                          <td className="py-2 pr-4">{p.created_at_ist}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable rows={data.recent?.users} cols={["user_id", "name", "email", "created_at_ist"]} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold truncate" title={String(value)}>{String(value)}</div>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-muted-foreground">No data</div>;
}

function SimpleTable({ rows, cols }: { rows?: any[]; cols: string[] }) {
  if (!rows || rows.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            {cols.map((c) => <th key={c} className="py-2 pr-4 whitespace-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map((c) => (
                <td key={c} className="py-2 pr-4 whitespace-nowrap max-w-[320px] truncate" title={String(r?.[c])}>
                  {String(r?.[c] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
