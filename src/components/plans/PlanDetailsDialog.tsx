import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

/** ---------- helpers ---------- */
const toBool = (v: any) => v === true || v === 1 || v === "1";
const fmtMoney = (v: any, currency = "INR") => {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(n); }
  catch { return `₹${n.toFixed(2)}`; }
};
const fmtDateTime = (v?: string | null) => (v ? new Date(v).toLocaleString() : "—");

function normalizeFeatures(input: unknown): Record<string, any> | null {
  if (input == null) return null;
  if (typeof input === "object") return input as Record<string, any>;
  if (typeof input !== "string") return null;

  const s = input.trim();
  try { return JSON.parse(s); } catch {
    const patched = s.replace(/(:\s*)([A-Za-z][A-Za-z\s\-]+)/g, (_m, g1, g2) => `${g1}"${g2}"`).replace(/'/g, '"');
    try { return JSON.parse(patched); } catch { return null; }
  }
}

function normalizePlan(row: any = {}) {
  return {
    id: row.plan_id ?? row.id ?? null,
    code: row.plan_code ?? row.code ?? null,
    name: row.plan_name ?? row.name ?? "Plan",
    description: row.description ?? null,
    price: row.price ?? null,
    base_price: row.base_price ?? null,
    discount_percent: row.discount_percent ?? null,
    sale_tag: row.sale_tag ?? null,
    currency: row.currency ?? "INR",
    duration_days: row.duration_days ?? null,
    tender_limit: row.tender_limit ?? null,
    state_limit: row.state_limit ?? null,
    is_all_india: toBool(row.is_all_india),
    status: row.plan_status ?? row.status ?? null,
    created_at_ist: row.plan_created_at ?? row.created_at_ist ?? null,

    total_users_enrolled: row.total_users_enrolled ?? null,
    active_users: row.active_users ?? null,
    expired_users: row.expired_users ?? null,
    total_tenders_used: row.total_tenders_used ?? null,
    total_payments: row.total_payments ?? null,
    total_revenue: row.total_revenue ?? null,
    total_failed_amount: row.total_failed_amount ?? null,
    last_plan_expiry: row.last_plan_expiry ?? null,

    raw_features: row.features ?? null,
  };
}

type Plan = ReturnType<typeof normalizePlan>;

export function PlanDetailsDialog({
  planId,
  open,
  onOpenChange,
}: {
  planId?: number | string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Clear old plan immediately when you switch to another id
  useEffect(() => {
    if (!open) return;
    setPlan(null);
    setError(null);
  }, [open, planId]);

 useEffect(() => {
  if (!open || !planId) return;
  const ac = new AbortController();

  (async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      // cache-bust
      const url = `${import.meta.env.VITE_API_URL}/getPlanDetails/${planId}?t=${Date.now()}`;
      const res = await axios.get(url, { signal: ac.signal });

      // 👇 Accept multiple shapes: {plan}, {data:{plan}}, {data}, array, or raw
      const payload =
        res.data?.plan ??
        res.data?.data?.plan ??
        res.data?.data ??
        res.data;

      const raw = Array.isArray(payload) ? payload[0] : payload;

      if (!raw || (typeof raw === "object" && Object.keys(raw).length === 0)) {
        throw new Error("Plan not found");
      }
      console.log("Payment data--->" , payload)

      setPlan(normalizePlan(raw));
         // ← your normalizePlan from earlier answer
    } catch (e: any) {
      if (axios.isCancel?.(e) || e?.name === "CanceledError") return;
      setError(e?.response?.data?.message || e?.message || "Failed to load plan details");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  })();

  return () => ac.abort();
}, [open, planId]);


  const features = useMemo(() => normalizeFeatures(plan?.raw_features), [plan?.raw_features]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* key forces a clean remount when planId changes (extra safety) */}
      <DialogContent key={String(planId ?? "x")} className="max-w-3xl p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {plan?.name ?? "Plan"}
            {!!plan?.status && (
              <Badge variant={plan.status === "active" ? "default" : "secondary"}>{plan.status}</Badge>
            )}
            {!!plan?.sale_tag && <Badge variant="outline">{plan.sale_tag}</Badge>}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
        )}

        {loading && !plan ? (
          <div className="animate-pulse space-y-2 text-sm text-muted-foreground">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-3 w-80 bg-muted rounded" />
            <div className="h-3 w-64 bg-muted rounded" />
            <div className="h-3 w-72 bg-muted rounded" />
          </div>
        ) : (
          plan && (
            <>
              {/* Basics */}
              <section className="space-y-2 text-sm text-muted-foreground">
                <div><strong>ID:</strong> {plan.id ?? "—"}</div>
                <div><strong>Code:</strong> {plan.code ?? "—"}</div>
                <div><strong>Description:</strong> {plan.description ?? "—"}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <div><strong>Price:</strong> {fmtMoney(plan.price, plan.currency)}</div>
                  <div><strong>Base Price:</strong> {plan.base_price != null ? fmtMoney(plan.base_price, plan.currency) : "—"}</div>
                  <div><strong>Discount %:</strong> {plan.discount_percent != null ? Number(plan.discount_percent) : "—"}</div>
                  <div><strong>Currency:</strong> {plan.currency}</div>
                  <div><strong>Duration:</strong> {plan.duration_days != null ? `${plan.duration_days} days` : "—"}</div>
                  <div><strong>Tender Limit:</strong> {plan.tender_limit ?? "—"}</div>
                  <div><strong>State Limit:</strong> {plan.state_limit ?? "—"}</div>
                  <div><strong>All India:</strong> {plan.is_all_india ? "Yes" : "No"}</div>
                  <div><strong>Created At:</strong> {fmtDateTime(plan.created_at_ist)}</div>
                </div>
              </section>

              {/* Aggregates */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Total Users" value={plan.total_users_enrolled ?? 0} />
                <Stat label="Active Users" value={plan.active_users ?? 0} />
                <Stat label="Expired Users" value={plan.expired_users ?? 0} />
                <Stat label="Tenders Used" value={plan.total_tenders_used ?? 0} />
                <Stat label="Payments" value={plan.total_payments ?? 0} />
                <Stat label="Revenue" value={fmtMoney(plan.total_revenue, plan.currency)} />
                <Stat label="Failed Amount" value={fmtMoney(plan.total_failed_amount, plan.currency)} />
                <Stat label="Last Expiry" value={plan.last_plan_expiry ? fmtDateTime(plan.last_plan_expiry) : "—"} />
              </section>

              {/* Features */}
              <section className="text-sm">
                <div className="font-medium">Features</div>
                <div className="bg-muted p-2 rounded-md text-xs mt-1 overflow-x-auto">
                  {features ? (
                    <>
                      <div><span className="font-bold">Max Keywords</span>: {features.max_keywords ?? "—"}</div>
                      <div><span className="font-bold">Max States</span>: {features.max_states ?? "—"}</div>
                      <div><span className="font-bold">Support</span>: {features.support ?? "—"}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </section>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{String(value)}</div>
    </div>
  );
}
