import * as React from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Select from "@radix-ui/react-select";
import PolicyFormDialog from "@/components/policies/PoliciesFormDialog";
import PolicyViewDialog from "@/components/policies/PoliciesViewDialog";


type PolicyType = "terms" | "privacy" | "refund";
type Status = "all" | "active" | "draft" | "superseded";

export default function PoliciesPage() {
  const [type, setType] = React.useState<PolicyType>("terms");
  const [status, setStatus] = React.useState<Status>("all");
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState(q);

  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal]   = React.useState(0);
  const [page, setPage]     = React.useState(1);
  const [limit] = React.useState(20);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState<string|null>(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<any>(null);

  React.useEffect(()=>{ const t = setTimeout(()=>setDebouncedQ(q), 350); return ()=>clearTimeout(t); }, [q]);

  const fetchList = React.useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/policies`, {
        params: { type, status, q: debouncedQ, page, limit }
      });
      setItems(res.data.items || []);
      setTotal(Number(res.data.total || 0));
    } catch (e:any) {
      setError(e?.response?.data?.message || e.message || "Failed to load policies");
    } finally {
      setLoading(false);
    }
  }, [type, status, debouncedQ, page, limit]);

  React.useEffect(()=>{ fetchList(); }, [fetchList]);

  const publish = async (row:any) => {
    await axios.patch(`${import.meta.env.VITE_API_URL}/policies/${row.id}/status`, { type, status: 'active' });
    fetchList();
  };
  const markDraft = async (row:any) => {
    await axios.patch(`${import.meta.env.VITE_API_URL}/policies/${row.id}/status`, { type, status: 'draft' });
    fetchList();
  };
  const supersede = async (row:any) => {
    await axios.patch(`${import.meta.env.VITE_API_URL}/policies/${row.id}/status`, { type, status: 'superseded' });
    fetchList();
  };
  const del = async (row:any) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/policies/${row.id}`, { params:{ type } });
    fetchList();
  };

  const StatusBadge = ({ s }: { s: string }) => {
    const map: Record<string,string> = {
      active: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-slate-100 text-slate-700',
      superseded: 'bg-amber-100 text-amber-800',
    };
    return <span className={`px-2 py-0.5 rounded text-xs ${map[s]||'bg-slate-100'}`}>{s}</span>;
  };

  const Toolbar = (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
      <div className="flex items-center gap-2">
        <TabsList className="p-1">
          {(["terms","privacy","refund"] as PolicyType[]).map(t => (
            <TabsTrigger key={t} value={t} onClick={()=>{ setType(t); setPage(1); }}>{t}</TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex gap-2">
        <div className="w-64">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search (version or title)..." />
        </div>
        <div className="inline-flex items-center gap-2 rounded border px-2 py-1">
          <span>Status</span>
          <Select.Root value={status} onValueChange={(v:any)=>{ setStatus(v); setPage(1); }}>
            <Select.Trigger className="px-2 py-1 rounded border">
              <Select.Value />
            </Select.Trigger>
            <Select.Content className="z-50 rounded-md border bg-white p-1 shadow-md">
              {(['all','active','draft','superseded'] as Status[]).map(s=>(
                <Select.Item key={s} value={s} className="px-2 py-1 text-sm cursor-pointer">{s}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <Button onClick={()=>setAddOpen(true)}>Add</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs value={type}>
        {Toolbar}

        <TabsContent value={type}>
          <Card className="p-3">
            {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {error && !loading && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && items.length === 0 && <div className="text-sm text-muted-foreground">No policies found</div>}

            {!loading && !error && items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Version</th>
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Created</th>
                      <th className="py-2 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row)=>(
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="py-2 pr-3">{row.id}</td>
                        <td className="py-2 pr-3">{row.version}</td>
                        <td className="py-2 pr-3">{row.title}</td>
                        <td className="py-2 pr-3"><StatusBadge s={row.status} /></td>
                        <td className="py-2 pr-3">{String(row.created_at_ist).slice(0,19).replace('T',' ')}</td>
                        <td className="py-2 pr-3 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={()=>{ setSelected(row); setViewOpen(true); }}>View</Button>
                          <Button variant="outline" size="sm" onClick={()=>{ setSelected(row); setEditOpen(true); }}>Edit</Button>
                          {row.status !== 'active' && <Button variant="outline" size="sm" onClick={()=>publish(row)}>Make Active</Button>}
                          {row.status !== 'draft' && <Button variant="outline" size="sm" onClick={()=>markDraft(row)}>Draft</Button>}
                          {row.status !== 'superseded' && <Button variant="outline" size="sm" onClick={()=>supersede(row)}>Supersede</Button>}
                          <Button variant="destructive" size="sm" onClick={()=>del(row)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PolicyFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        type={type}
        mode="add"
        onSaved={fetchList}
      />
      <PolicyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        type={type}
        mode="edit"
        policy={selected}
        onSaved={fetchList}
      />
      <PolicyViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        id={selected?.id}
        type={type}
      />
    </div>
  );
}
