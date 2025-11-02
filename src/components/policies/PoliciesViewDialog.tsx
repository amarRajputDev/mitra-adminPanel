import axios from "axios";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PolicyViewDialog({ open, onOpenChange, id, type }: { open: boolean; onOpenChange: (v:boolean)=>void; id?: number; type: "terms"|"privacy"|"refund"; }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  useEffect(() => {
    if (!open || !id) return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/policies/${id}`, { params:{ type }, signal: ac.signal });
        setData(res.data?.policy);
      } catch (e:any) {
        if (e.name === 'CanceledError') return;
        setError(e?.response?.data?.message || e.message || 'Failed to load policy');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [open, id, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>View {type} policy</DialogTitle></DialogHeader>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {data && (
          <div className="space-y-2 text-sm">
            <div><b>ID:</b> {data.id}</div>
            <div><b>Version:</b> {data.version}</div>
            <div><b>Title:</b> {data.title}</div>
            <div><b>Status:</b> {data.status}</div>
            <div><b>Created:</b> {data.created_at_ist}</div>
            <div className="pt-2">
              <b>Body:</b>
              <pre className="mt-1 bg-muted/50 p-2 rounded whitespace-pre-wrap">{data.body}</pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
