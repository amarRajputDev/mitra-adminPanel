import React, { useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as Select from "@radix-ui/react-select";

type PolicyType = "terms" | "privacy" | "refund";
type Status = "active" | "draft" | "superseded";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: PolicyType;
  mode: "add" | "edit";
  policy?: any;
  onSaved?: () => void;
}

export default function PolicyFormDialog({ open, onOpenChange, type, mode, policy, onSaved }: Props) {
  const [form, setForm] = React.useState({
    version: "",
    title: "",
    body: "",
    status: "draft" as Status,
    prev_policy_id: "" as string | number | "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (open && mode === "edit" && policy) {
      setForm({
        version: policy.version || "",
        title: policy.title || "",
        body: policy.body || "",
        status: (policy.status || "draft") as Status,
        prev_policy_id: policy.prev_policy_id || "",
      });
      setError(null);
    }
    if (open && mode === "add") {
      setForm({ version: "", title: "", body: "", status: "draft", prev_policy_id: "" });
      setError(null);
    }
  }, [open, mode, policy]);

  const save = async () => {
    try {
      setSaving(true); setError(null);
      const payload = {
        type,
        version: form.version.trim(),
        title: form.title.trim(),
        body: form.body ?? "",
        status: form.status,
        prev_policy_id: form.prev_policy_id || null,
      };
      if (mode === "add") {
        await axios.post(`${import.meta.env.VITE_API_URL}/policies`, payload);
      } else {
        await axios.put(`${import.meta.env.VITE_API_URL}/policies/${policy.id}`, payload);
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to save policy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v)=>!saving && onOpenChange(v)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? `Add ${type} policy` : `Edit ${type} policy`}</DialogTitle>
        </DialogHeader>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        <div className="grid gap-3">
          <div>
            <Label>Version</Label>
            <Input value={form.version} onChange={e=>setForm(f=>({...f, version:e.target.value}))} placeholder="v1.0.0" />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} placeholder="Privacy Policy – 2025" />
          </div>
          <div>
            <Label>Body (Markdown/HTML/Text)</Label>
            <Textarea rows={10} value={form.body} onChange={e=>setForm(f=>({...f, body:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select.Root value={form.status} onValueChange={(v: any)=>setForm(f=>({...f, status:v}))}>
                <Select.Trigger className="w-full rounded border px-2 py-1 text-left">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content className="z-50 rounded-md border bg-white p-1 shadow-md">
                  <Select.Item value="draft" className="px-2 py-1 text-sm cursor-pointer">draft</Select.Item>
                  <Select.Item value="active" className="px-2 py-1 text-sm cursor-pointer">active</Select.Item>
                  <Select.Item value="superseded" className="px-2 py-1 text-sm cursor-pointer">superseded</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div>
              <Label>Prev Policy ID (optional)</Label>
              <Input value={String(form.prev_policy_id ?? "")} onChange={e=>setForm(f=>({...f, prev_policy_id:e.target.value}))} placeholder="e.g. 12" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={()=>onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
