// EditPlanDialog.tsx
import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const EditSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  base_price: z.coerce.number().min(0).optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  sale_tag: z.string().optional().nullable(),
  currency: z.enum(["INR","USD","EUR"]).default("INR"),
  duration_days: z.coerce.number().int().min(1),
  tender_limit: z.coerce.number().int().min(0).optional().nullable(),
  state_limit: z.coerce.number().int().min(0).optional().nullable(),
  is_all_india: z.boolean().default(false),
  status: z.enum(["active","inactive"]).default("active"),

  // structured features
  max_keywords: z.coerce.number().int().min(0).default(5),
  max_states: z.coerce.number().int().min(0).default(1),
  support: z.enum(["Email only","Email + WhatsApp","Priority support"]).default("Email only"),
})

export function EditPlanDialog({ plan, open, onOpenChange, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = plan?.id ?? plan?.plan_id

  // Parse features safely from incoming plan
  const parsedFeatures = useMemo(() => {
    const f = plan?.features_obj ?? plan?.features
    if (!f) return {}
    if (typeof f === "string") {
      try { return JSON.parse(f) } catch { return {} }
    }
    return f || {}
  }, [plan])

  const form = useForm({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      code: plan?.code ?? plan?.plan_code ?? "",
      name: plan?.name ?? plan?.plan_name ?? "",
      description: plan?.description ?? "",
      price: plan?.price ?? 0,
      base_price: plan?.base_price ?? null,
      discount_percent: plan?.discount_percent ?? 0,
      sale_tag: plan?.sale_tag ?? "",
      currency: plan?.currency ?? "INR",
      duration_days: plan?.duration_days ?? 30,
      tender_limit: plan?.tender_limit ?? null,
      state_limit: plan?.state_limit ?? null,
      is_all_india: Boolean(plan?.is_all_india),
      status: plan?.status ?? plan?.plan_status ?? "active",
      // structured features defaults
      max_keywords: parsedFeatures?.max_keywords ?? plan?.max_keywords ?? 5,
      max_states:   parsedFeatures?.max_states   ?? plan?.max_states   ?? 1,
      support:      parsedFeatures?.support      ?? plan?.support      ?? "Email only",
    },
    mode: "onBlur",
  })

  // Ensure dialog re-hydrates on open/plan change
  useEffect(() => {
    if (!open || !plan) return
    form.reset({
      code: plan?.code ?? plan?.plan_code ?? "",
      name: plan?.name ?? plan?.plan_name ?? "",
      description: plan?.description ?? "",
      price: plan?.price ?? 0,
      base_price: plan?.base_price ?? "",
      discount_percent: plan?.discount_percent ?? "",
      sale_tag: plan?.sale_tag ?? "",
      currency: plan?.currency ?? "INR",
      duration_days: plan?.duration_days ?? 30,
      tender_limit: plan?.tender_limit ?? "",
      state_limit: plan?.state_limit ?? "",
      is_all_india: Boolean(plan?.is_all_india),
      status: plan?.status ?? plan?.plan_status ?? "active",
      max_keywords: parsedFeatures?.max_keywords ?? plan?.max_keywords ?? 5,
      max_states:   parsedFeatures?.max_states   ?? plan?.max_states   ?? 1,
      support:      parsedFeatures?.support      ?? plan?.support      ?? "Email only",
    })
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan])

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = form

  const onSubmit = async (values: any) => {
    if (!id) return
    setSaving(true); setError(null)
    try {
      const features = {
        max_keywords: Number(values.max_keywords ?? 5),
        max_states:   Number(values.max_states ?? 1),
        support:      values.support || "Email only",
      }

      const payload = {
        code: values.code,
        name: values.name,
        description: values.description || null,
        price: Number(values.price),
        base_price: values.base_price !== "" && values.base_price != null ? Number(values.base_price) : null,
        discount_percent: values.discount_percent !== "" && values.discount_percent != null ? Number(values.discount_percent) : 0,
        sale_tag: values.sale_tag || null,
        currency: values.currency || "INR",
        duration_days: Number(values.duration_days),
        tender_limit: values.tender_limit !== "" && values.tender_limit != null ? Number(values.tender_limit) : null,
        state_limit: values.state_limit !== "" && values.state_limit != null ? Number(values.state_limit) : null,
        is_all_india: Boolean(values.is_all_india),
        status: values.status,
        features:{
          ...features
        }
      }

      const res = await axios.put(`http://localhost:3001/api/admin/update-plan/${id}`, payload)
      const updated = res.data?.plan || res.data
      onSaved?.(updated)
      onOpenChange(false)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to update plan")
    } finally {
      setSaving(false)
    }
  }

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="max-w-3xl p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Plan — {plan?.name ?? plan?.plan_name ?? plan?.code}</DialogTitle>
        </DialogHeader>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Code</Label>
              <Input {...register("code")} />
              {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message as string}</p>}
            </div>
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v, { shouldDirty: true })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          {/* Row 3: pricing */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Price</Label>
              <Input type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Base Price (optional)</Label>
              <Input type="number" step="0.01" min="0" {...register("base_price", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Discount %</Label>
              <Input type="number" step="0.01" min="0" max="100" {...register("discount_percent", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v, { shouldDirty: true })}>
                <SelectTrigger><SelectValue placeholder="INR" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: limits & flags */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Duration (days)</Label>
              <Input type="number" min="1" {...register("duration_days", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Tender Limit</Label>
              <Input type="number" min="0" {...register("tender_limit", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>State Limit</Label>
              <Input type="number" min="0" {...register("state_limit", { valueAsNumber: true })} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={watch("is_all_india")} onCheckedChange={(v) => setValue("is_all_india", v, { shouldDirty: true })}/>
              <Label className="cursor-pointer">All India</Label>
            </div>
          </div>

          {/* Row 5: sale tag */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sale Tag (optional)</Label>
              <Input {...register("sale_tag")} placeholder="Diwali Offer" />
            </div>
          </div>

          {/* Row 6: structured features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Max Keywords</Label>
              <Input type="number" min="0" {...register("max_keywords", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Max States</Label>
              <Input type="number" min="0" {...register("max_states", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Support</Label>
              <Select value={watch("support")} onValueChange={(v) => setValue("support", v, { shouldDirty: true })}>
                <SelectTrigger><SelectValue placeholder="Email only" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email only">Email only</SelectItem>
                  <SelectItem value="Email + WhatsApp">Email + WhatsApp</SelectItem>
                  <SelectItem value="Priority support">Priority support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !isDirty}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
