import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Filter } from "lucide-react";
import { usePaymentsStore } from "@/store/payments.z";
import { PaymentViewDialog } from "@/components/PaymentViewDialog";

export default function Payments() {
  const { fetchPayments, payments, totalRevenue, pendingAmount } = usePaymentsStore();
  const [viewId, setViewId] = useState<number | null>(null);
  const [status, setStatus] = useState<"all" | "success" | "created" | "failed">("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    // initial + whenever status changes, hit backend with ?status=
    fetchPayments({ status, q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const getSuccessfulPayments = () =>
    payments.reduce((total, p: any) => (p.status === "success" ? total + Number(p.amount || 0) : total), 0);

  const getFailedPaymentsCount = () => payments.filter((p: any) => p.status === "failed").length;

  const getStatusVariant = (st: string) => {
    switch (st) {
      case "success": return "default";
      case "created": return "secondary"; // pending
      case "failed":  return "destructive";
      default:        return "secondary";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Track and manage all transactions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">₹{Number(totalRevenue || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">+12.5% from last month</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Successful Payments</CardDescription>
            <CardTitle className="text-3xl">₹{getSuccessfulPayments().toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Success sum</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Amount</CardDescription>
            <CardTitle className="text-3xl">₹{Number(pendingAmount || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Created (awaiting)</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed Payments</CardDescription>
            <CardTitle className="text-3xl">{getFailedPaymentsCount()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Count</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or plan…"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPayments({ status, q })}
              />
            </div>

            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="created">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => fetchPayments({ status, q })}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    {/* show pretty code if provided */}
                    <TableCell className="font-medium">{p.display_id ?? p.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.userName}</p>
                        <p className="text-sm text-muted-foreground">{p.display_user_id ?? p.user_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{p.plan}</TableCell>
                    <TableCell className="font-semibold">₹{Number(p.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setViewId(Number(p.id))}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {viewId != null && (
        <PaymentViewDialog
          paymentId={viewId}
          open={!!viewId}
          onOpenChange={(v) => !v && setViewId(null)}
        />
      )}
    </div>
  );
}
