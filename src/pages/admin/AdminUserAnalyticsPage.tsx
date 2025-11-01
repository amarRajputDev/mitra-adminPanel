import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Download, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";



/**
 * AdminUserAnalyticsPage
 * - Fetches ONE endpoint: GET /api/admin/users/user/:userId/full
 * - Presents a rich analysis UI
 */
  

export default function AdminUserAnalyticsPage() {
  const { userId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState("/api/admin/users/user");
const fetchData = async () => {
  // Always end loading if userId missing, otherwise spinner can hang
  if (!userId) {
    setLoading(false);
    setError("No userId in route params");
    return;
  }

  setLoading(true);
  setError(null);

  const forceMock = new URLSearchParams(window.location.search).get("mock") === "1";

  try {
  
    // Your current backend path uses "summery". Keep it for now.
    const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const url = `${base}/users/user/${userId}/summery`;

    const res = await axios.get(url, { withCredentials: true });
    // If summary endpoint returns a FLAT shape, you must adapt it.
    // Otherwise, if you already return the FULL shape, just set it directly:
    const payload = res.data;
    // console.log(res.data)

    // If payload isn't the full shape, adapt it minimally so UI renders:
    const isFlatSummary = payload && !payload.profile && !payload.plans;
    setData(
      isFlatSummary
        ? {
            user_id: payload.user_id,
            profile: {
              user_id: payload.user_id,
              name: payload.name,
              email: payload.email,
              mobile: payload.mobile,
              city: payload.city,
              status: payload.profile_status,
              created_at_ist: payload.user_created_at,
            },
            plans: {
              current: {
                plan_name: payload.plan_name,
                plan_code: payload.plan_code,
                user_plan_status: payload.plan_status,
                start_at_ist: payload.plan_start_at,
                end_at_ist: payload.plan_end_at,
                tenders_used: payload.tenders_used,
                tender_limit: payload.tender_limit,
                currency: payload.currency || "INR",
                features: {
                  max_keywords: payload.max_keywords,
                  max_states: payload.max_states,
                  support: payload.support,
                },
              },
              history: [],
            },
            payments: [],
            searches: [],
            keywords: [],
            activities: [],
            viewed_tenders: [],
            interested_tenders: [],
            tender_notifications: [],
            api_logs: [],
            sessions: [],
            devices: [],
            device_tokens: [],
            company: { profile: null, banks: [], contacts: [] },
            notifications: null,
            consents: { terms: [], privacy: [], refund: [] },
          }
        : payload
    );
  } catch (e) {
    console.error("fetchData error", e?.response || e);
    setError(e?.response?.data?.message || e.message || "API failed — using dummy data");
    // **Always** show dummy data on failure:
    
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { 
    console.log(userId)
    fetchData()
   }, [userId, endpoint]);

  const currency = (data as any)?.plans?.current?.currency || "INR";
  const money = (v: any) => (v == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(v)));
  const dt = (v: any) => (v ? new Date(v).toLocaleString() : "—");
  const d = (v: any) => (v ? new Date(v).toLocaleDateString() : "—");

  const planFeatures = useMemo(() => {
    const f = (data as any)?.plans?.current?.features || {};
    return {
      max_keywords: f.max_keywords ?? "—",
      max_states: f.max_states ?? "—",
      support: f.support ?? "—",
    };
  }, [data]);

  const paymentsDaily = useMemo(() => {
    const rows = (data as any)?.payments || [];
    const map = new Map<string, number>();
    rows.forEach((p: any) => {
      const key = (p.created_at_ist || "").slice(0, 10);
      const prev = map.get(key) || 0;
      map.set(key, prev + Number(p.amount || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, amount]) => ({ date, amount }));
  }, [data]);

  const viewsDaily = useMemo(() => {
    const rows = (data as any)?.viewed_tenders || [];
    const map = new Map<string, number>();
    rows.forEach((v: any) => {
      const key = (v.created_at || "").slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, count]) => ({ date, count }));
    }, [data]);
    
    
    const kpi = useMemo(() => {
    const d = (date: any) => {
    if (!date) return "";
    const dt = new Date(date);
    if (isNaN(dt.getTime())) return ""; // invalid date safety
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  };
    // const d = (date) => dayjs(date).format("DD/MM/YYYY");
    const summary = {
      name: (data as any)?.profile?.name || "—",
      email: (data as any)?.profile?.email || "—",
      mobile: (data as any)?.profile?.mobile || "—",
      city: (data as any)?.profile?.city || "—",
      status: (data as any)?.profile?.status || "—",
      created: (data as any)?.profile?.created_at_ist || null,
      plan_name: (data as any)?.plans?.current?.plan_name || "—",
      plan_code: (data as any)?.plans?.current?.plan_code || "—",
      plan_status: (data as any)?.plans?.current?.user_plan_status || (data as any)?.plans?.current?.status || "—",
     period :` ${d((data as any)?.plans?.current?.start_at_ist)} → ${d((data as any)?.plans?.current?.end_at_ist)}`,

      tenders_used: (data as any)?.plans?.current?.tenders_used ?? 0,
      tender_limit:
        (data as any)?.plans?.current?.tender_limit ??
        (data as any)?.plans?.current?.features?.tender_limit ?? "—",
      payments_count: ((data as any)?.payments || []).length,
      last_session: (data as any)?.sessions?.[0]?.last_active || null,
    };
    return summary;
  }, [data]);

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_${(data as any).user_id}_full.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
         

          <Button onClick={downloadJSON} disabled={!data}>
            <Download className="w-4 h-4 mr-2" /> Export JSON
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">User ID: {userId}</div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {data && (
        <>
          {/* OVERVIEW */}
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {kpi.name}
                  <Badge variant="secondary">{kpi.status}</Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {(data as any).user_id} · {kpi.email} · {kpi.mobile} · {kpi.city}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {dt(kpi.created)} · Last Active: {dt(kpi.last_session)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Plan" value={`${kpi.plan_name} (${kpi.plan_code})`} />
                <Stat label="Plan Status" value={kpi.plan_status} />
                <Stat label="Plan Period" value={kpi.period} />
                <Stat label="Used / Limit" value={`${kpi.tenders_used} / ${kpi.tender_limit ?? "—"}`} />
                <Stat label="Payments" value={kpi.payments_count} />
                <Stat label="Max Keywords" value={planFeatures.max_keywords} />
                <Stat label="Max States" value={planFeatures.max_states} />
                <Stat label="Support" value={planFeatures.support} />
              </div>
            </CardContent>
          </Card>

          {/* TABS */}
          <Tabs defaultValue="plan" className="space-y-4">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="plan">Plan & Billing</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="search">Search History</TabsTrigger>
              <TabsTrigger value="sessions">Sessions & Devices</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="consents">Consents</TabsTrigger>
            
            </TabsList>

            {/* PLAN & BILLING */}
            <TabsContent value="plan" className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
               

                <Card>
                  <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {(data as any).plans?.current ? (
                      <>
                        <Row k="Name" v={(data as any).plans.current.plan_name} />
                        <Row k="Code" v={(data as any).plans.current.plan_code} />
                        <Row k="Status" v={(data as any).plans.current.user_plan_status || (data as any).plans.current.status} />
                        <Row k="Start" v={dt((data as any).plans.current.start_at_ist)} />
                        <Row k="End" v={dt((data as any).plans.current.end_at_ist)} />
                        <Row k="Tenders Used" v={(data as any).plans.current.tenders_used} />
                        <Separator />
                        <Row k="Price" v={money((data as any).plans.current.price)} />
                        <Row k="Discount %" v={(data as any).plans.current.discount_percent ?? "—"} />
                        <Row k="Currency" v={(data as any).plans.current.currency || currency} />
                        <Separator />
                        <Row k="Max Keywords" v={planFeatures.max_keywords} />
                        <Row k="Max States" v={planFeatures.max_states} />
                        <Row k="Support" v={planFeatures.support} />
                      </>
                    ) : (
                      <Empty text="No current plan" />
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Plan History</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4">Plan</th>
                          <th className="py-2 pr-4">Code</th>
                          <th className="py-2 pr-4">Start</th>
                          <th className="py-2 pr-4">End</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Features</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data as any).plans?.history?.map((h: any) => (
                          <tr key={h.user_plan_id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{h.plan_name}</td>
                            <td className="py-2 pr-4">{h.plan_code}</td>
                            <td className="py-2 pr-4">{d(h.start_at_ist)}</td>
                            <td className="py-2 pr-4">{d(h.end_at_ist)}</td>
                            <td className="py-2 pr-4"><Badge variant={h.user_plan_status === "active" ? "default" : "secondary"}>{h.user_plan_status}</Badge></td>
                            <td className="py-2 pr-4 text-xs">KW: {h.features?.max_keywords ?? "—"}, ST: {h.features?.max_states ?? "—"}, {h.features?.support || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACTIVITY */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Viewed Tenders (daily)</CardTitle></CardHeader>
                <CardContent className="h-64">
                  {viewsDaily.length === 0 ? (
                    <Empty text="No views yet" />
                  ) : (
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
                <CardHeader><CardTitle>Activity Stream</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {((data as any).activities || []).map((a: any) => (
                      <div key={a.id} className="border rounded-md p-3 text-sm">
                        <div className="font-medium">{a.activity_type}</div>
                        <div className="text-xs text-muted-foreground">{a.created_at_ist}</div>
                        {a.details_json && (
                          <pre className="mt-2 bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(a.details_json, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Interested Tenders</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).interested_tenders} cols={["tender_id", "created_at"]} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Notifications Sent</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).tender_notifications} cols={["tender_id", "sent_at"]} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>API Logs</CardTitle></CardHeader>
                <CardContent>
                  <SimpleTable rows={(data as any).api_logs} cols={["endpoint", "method", "ip_address", "created_at"]} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEARCH HISTORY */}
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Keywords</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-xs">
                  {(((data as any).keywords || []).length === 0) && <Empty text="No keywords" />}
                  {((data as any).keywords || []).map((k: string) => (
                    <Badge key={k} variant="outline">{k}</Badge>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Search History</CardTitle></CardHeader>
                <CardContent>
                  <SimpleTable
                    rows={(data as any).searches}
                    cols={["keyword", "state_name", "city_name", "ministry_name", "dept_name", "category_name", "item_name", "created_at_ist"]}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SESSIONS & DEVICES */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
                <CardContent>
                  <SimpleTable rows={(data as any).sessions} cols={["device_type", "ip_address", "created_at", "last_active", "status"]} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Devices</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).devices} cols={["platform", "model", "os_version", "app_version", "manufacturer", "created_at_ist"]} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Device Tokens</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).device_tokens} cols={["device_id", "fcm_token", "created_at_ist"]} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* COMPANY */}
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
                <CardContent>
                  {(data as any).company?.profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                      {Object.entries((data as any).company.profile).map(([k, v]) => (
                        <Row key={k} k={k} v={String(v)} />
                      ))}
                    </div>
                  ) : (
                    <Empty text="No company profile" />
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Banks</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).company?.banks || []} cols={["bank_name", "branch", "ifsc", "account_no", "account_type", "created_at_ist"]} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).company?.contacts || []} cols={["office_mail", "alt_mail", "phone", "mobile", "whatsapp", "website", "created_at_ist"]} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CONSENTS */}
            <TabsContent value="consents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Terms</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).consents?.terms || []} cols={["version", "title", "created_at_ist"]} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).consents?.privacy || []} cols={["version", "title", "created_at_ist"]} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Refund</CardTitle></CardHeader>
                  <CardContent>
                    <SimpleTable rows={(data as any).consents?.refund || []} cols={["version", "title", "created_at_ist"]} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

         
          </Tabs>
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

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{k}</span>
      <span className="text-sm font-medium truncate" title={String(v)}>{v}</span>
    </div>
  );
}

function Empty({ text = "No data" }: { text?: string }) {
  return <div className="text-sm text-muted-foreground">{text}</div>;
}

function SimpleTable({ rows, cols }: { rows: any[]; cols: string[] }) {
  if (!rows || rows.length === 0) return <Empty text="No data" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            {cols.map((c) => (
              <th key={c} className="py-2 pr-4 whitespace-nowrap">{c}</th>
            ))}
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
