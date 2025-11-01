// components/payments/PaymentViewDialog.tsx (or .jsx)
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { create } from "domain";

type Props = {
  paymentId?: number | string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function PaymentViewDialog({ paymentId, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const moneyFmt = (amt: any, ccy: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: ccy || "INR" }).format(Number(amt || 0));

  const fetchData = async () => {
    if (!paymentId) return;
    setLoading(true); setErr(null);
    try {
      const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const url = `${base}/getPaymentFull/${paymentId}`;
      const res = await axios.get(url);
      console.log(res.data)
      setPayload(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Failed to load payment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && paymentId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paymentId]);

  const p = payload?.payment;
  const u = payload?.user;
  const hist = payload?.user_payments || [];
  const stats = payload?.stats || {};

  const amountStr = useMemo(() => {
    const ccy = p?.currency || p?.plan_currency || "INR";
    return moneyFmt(p?.amount, ccy);
  }, [p]);

  if (!open) return null;

function calcStatusCounts(
    successful: any[] | number | null | undefined,
    failed: any[] | number | null | undefined,
    created: any[] | number | null | undefined
) {
    const toCount = (v: any[] | number | null | undefined) =>
        Array.isArray(v) ? v.length : typeof v === "number" ? v : 0;

    const success_count = toCount(successful);
    const failed_count = toCount(failed);
    const pending_count = toCount(created);
    const total = success_count + failed_count + pending_count;

    return { success_count, failed_count, pending_count, total };
}

function calculatePaymentStats(payload: any[]) {
  const pending = payload.filter(p => p.status === "created").length;
  const failed = payload.filter(p => p.status === "failed").length;
  const success = payload.filter(p => p.status === "success").length;

  return { pending, failed, success };
}



// Example: derive counts from payload or stats
const statusCounts = calcStatusCounts(payload?.success_payment, payload?.failed, payload?.pending);
  return (
    <Dialog  open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="max-w-4xl border border-red-400  p-6 h-full  overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Payment #{paymentId} {p?.status && <Badge className="ml-2" variant={p.status === "success" ? "default" : "secondary"}>{p.status}</Badge>}
          </DialogTitle>
        </DialogHeader>

        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}

        {!loading && !err && payload && (
          <div className="space-y-6">
            {/* Payment summary */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Payment Details</h4>
                <KV k="Status" v={<Badge variant={p.status === "success" ? "default" : "secondary"}>{p.status}</Badge>} />
                <KV k="Amount" v={amountStr} />
                <KV k="Currency" v={p.currency || p.plan_currency || "INR"} />
                <KV k="Gateway" v={p.gateway} />
                <KV k="Gateway Order ID" v={p.gateway_order_id} />
                <KV k="Gateway Payment ID" v={p.gateway_payment_id || "—"} />
                <KV k="Gateway Signature" v={p.gateway_signature || "—"} />
                <KV k="GST Number" v={p.gst_number || "—"} />
                <KV k="Created At" v={p.created_at_ist || p.created_at} />
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Related Plan</h4>
                <KV k="Plan Name" v={p.plan_name || "—"} />
                <KV k="Plan Code" v={p.plan_code || "—"} />
                <KV k="Plan Currency" v={p.plan_currency || "—"} />
                <KV k="Plan Duration (days)" v={p.plan_duration_days ?? "—"} />
                <Separator />
                <h4 className="font-medium">Payer (User)</h4>
                <KV k="User ID" v={p.user_id} />
                <KV k="Name" v={u?.name || "—"} />
                <KV k="Email" v={u?.email || "—"} />
                <KV k="Mobile" v={u?.mobile || "—"} />
                <KV k="City" v={u?.city || "—"} />
                <KV k="Profile Status" v={u?.status || "—"} />
              </div>
            </section>

            {/* Payment meta JSON */}
            {p?.meta && (
              <section className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Payment Meta</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{JSON.stringify(p.meta, null, 2)}</pre>
              </section>
            )}

            {/* User payment stats */}
            <section className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">User Payment Stats</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Total Payments" value={stats.total_count ?? 0} />
                <Stat label="Success" value={calculatePaymentStats(payload.user_payments).success ?? 0} />
                <Stat label="Failed" value={calculatePaymentStats(payload.user_payments).failed ?? 0} />
                <Stat label="Pending" value={calculatePaymentStats(payload.user_payments).pending ?? 0} />
                <Stat
                  label="Total Revenue"
                  value={moneyFmt(stats.total_revenue || 0, p?.currency || p?.plan_currency || "INR")}
                />
              </div>
            </section>

            {/* User payment history table */}
            <section className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">User Payment History</h4>
              {hist.length === 0 ? (
                <div className="text-sm text-muted-foreground">No payments for this user.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Currency</th>
                        <th className="py-2 pr-4">Gateway</th>
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Payment ID</th>
                        <th className="py-2 pr-4">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hist.map((row: any) => {
                        const isThis = row.id === p.id;
                        return (
                          <tr key={row.id} className={`border-b last:border-0 ${isThis ? "bg-muted/40" : ""}`}>
                            <td className="py-2 pr-4">{row.id}</td>
                            <td className="py-2 pr-4">
                              <Badge variant={row.status === "success" ? "default" : "secondary"}>{row.status}</Badge>
                            </td>
                            <td className="py-2 pr-4">{moneyFmt(row.amount, row.currency || p.currency || "INR")}</td>
                            <td className="py-2 pr-4">{row.currency || "INR"}</td>
                            <td className="py-2 pr-4">{row.gateway}</td>
                            <td className="py-2 pr-4">{row.gateway_order_id}</td>
                            <td className="py-2 pr-4">{row.gateway_payment_id || "—"}</td>
                            <td className="py-2 pr-4">{row.created_at_ist}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function KV({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">{k}</div>
      <div className="font-medium text-right">{typeof v === "string" || typeof v === "number" ? v : v}</div>
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
