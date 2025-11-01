// AddPlanForm.tsx
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Plus } from "lucide-react"

export const AddPlanSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative("Must be ≥ 0"),
  base_price: z.coerce.number().nonnegative("Must be ≥ 0").optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  sale_tag: z.string().optional().nullable(),
  currency: z.enum(["INR", "USD", "EUR"]).default("INR"),
  duration_days: z.coerce.number().int().positive("Must be > 0"),
  tender_limit: z.coerce.number().int().nonnegative().optional().nullable(),
  state_limit: z.coerce.number().int().nonnegative().optional().nullable(),
  is_all_india: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),

  // 👇 structured "features" inputs
  max_keywords: z.coerce.number().int().min(0).default(5),
  max_states: z.coerce.number().int().min(0).default(1),
  support: z.enum(["Email only", "Email + phone", "support 24*7"]).default("Email only"),
})

export function AddPlanForm({ saving, onCancel, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(AddPlanSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      price: 0,
      base_price: null,
      discount_percent: 0,
      sale_tag: "",
      currency: "INR",
      duration_days: 30,
      tender_limit: null,
      state_limit: null,
      is_all_india: false,
      status: "active",
      max_keywords: 5,
      max_states: 1,
      support: "Email only",
    },
    mode: "onBlur",
  })

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = form

  const price = watch("price")
  const discount = watch("discount_percent") || 0
  const currency = watch("currency") || "INR"
  const effectivePrice = useMemo(() => {
    const p = Number(price || 0)
    const d = Number(discount || 0)
    return p - (p * d) / 100
  }, [price, discount])

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Code</Label>
          <Input {...register("code")} placeholder="PRO_90" />
          {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Name</Label>
          <Input {...register("name")} placeholder="Pro (90 Days)" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
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
        <Textarea rows={3} {...register("description")} placeholder="Short plan description…" />
      </div>

      {/* Row 3: pricing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Price</Label>
          <Input type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label>Base Price (optional)</Label>
          <Input type="number" step="0.01" min="0" {...register("base_price", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Discount %</Label>
          <Input type="number" step="0.01" min="0" max="100" {...register("discount_percent", { valueAsNumber: true })} />
          {errors.discount_percent && <p className="text-xs text-red-600 mt-1">{errors.discount_percent.message}</p>}
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

      {/* Effective price */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Effective Price:</span>
        <Badge variant="outline">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(effectivePrice || 0)}
        </Badge>
        {watch("sale_tag") && <Badge>{watch("sale_tag")}</Badge>}
      </div>

      {/* Row 4: limits & flags */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Duration (days)</Label>
          <Input type="number" min="1" {...register("duration_days", { valueAsNumber: true })} />
          {errors.duration_days && <p className="text-xs text-red-600 mt-1">{errors.duration_days.message}</p>}
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
          {errors.max_keywords && <p className="text-xs text-red-600 mt-1">{errors.max_keywords.message}</p>}
        </div>
        <div>
          <Label>Max States</Label>
          <Input type="number" min="0" {...register("max_states", { valueAsNumber: true })} />
          {errors.max_states && <p className="text-xs text-red-600 mt-1">{errors.max_states.message}</p>}
        </div>
        <div>
          <Label>Support</Label>
          <Select value={watch("support")} onValueChange={(v) => setValue("support", v, { shouldDirty: true })}>
            <SelectTrigger><SelectValue placeholder="Email only" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Email only">Email only</SelectItem>
              <SelectItem value="Email + WhatsApp">Email + Phone</SelectItem>
              <SelectItem value="Priority support">support 24*7</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving || !isDirty}>
          {saving ? "Saving…" : "Create Plan"}
        </Button>
      </div>
    </form>
  )
}


export function AddPlanDialog({ open, onOpenChange, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values) => {
    setSaving(true); setError(null)
    try {
      // Build features JSON from structured fields
      const features = {
        max_keywords: Number(values.max_keywords ?? 5),
        max_states: Number(values.max_states ?? 1),
        support: values.support || "Email only",
      }

      const payload = {
        code: values.code,
        name: values.name,
        description: values.description || null,
        price: Number(values.price),
        base_price: values.base_price != null ? Number(values.base_price) : null,
        discount_percent: values.discount_percent != null ? Number(values.discount_percent) : 0,
        sale_tag: values.sale_tag || null,
        currency: values.currency || "INR",
        duration_days: Number(values.duration_days),
        tender_limit: values.tender_limit != null ? Number(values.tender_limit) : null,
        state_limit: values.state_limit != null ? Number(values.state_limit) : null,
        is_all_india: Boolean(values.is_all_india),
        status: values.status || "active",
        features, // 👈 send as JSON
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/add-plan`, payload)
      const created = res.data?.plan || res.data
      onSaved?.(created)
      onOpenChange(false)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to create plan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="max-w-3xl p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Plan</DialogTitle>
        </DialogHeader>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        <AddPlanForm
          saving={saving}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

export function AddPlanButton({ onCreated }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Plan
      </Button>

      <AddPlanDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={(created) => {
          onCreated?.(created)        // parent can refresh list
          setOpen(false)
        }}
      />
    </>
  )
}