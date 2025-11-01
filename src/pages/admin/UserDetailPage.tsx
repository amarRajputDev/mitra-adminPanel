import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function UserDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}admin/users/${id}`).then(res => {
      setData(res.data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <Loader2 className="mx-auto animate-spin mt-10" />

  const u = data.profile

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{u.name}</h1>
        <Link to="/admin/users" className="text-blue-600 hover:underline">← Back</Link>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><strong>Email:</strong> {u.email || "—"}</div>
          <div><strong>Mobile:</strong> {u.mobile || "—"}</div>
          <div><strong>City:</strong> {u.city || "—"}</div>
          <div><strong>Status:</strong> {u.status}</div>
          <div><strong>Referral Code:</strong> {u.referral_code || "—"}</div>
          <div><strong>Referred By:</strong> {u.referred_by || "—"}</div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc ml-5 text-sm">
            <li>Email: {u.email_enabled ? "Enabled" : "Disabled"}</li>
            <li>WhatsApp: {u.whatsapp_enabled ? "Enabled" : "Disabled"}</li>
            <li>Telegram: {u.telegram_enabled ? "Enabled" : "Disabled"}</li>
            <li>In-App: {u.inapp_enabled ? "Enabled" : "Disabled"}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Plans */}
      <Card>
        <CardHeader><CardTitle>Plans</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr><th>ID</th><th>Plan</th><th>Status</th><th>Period</th></tr></thead>
            <tbody>
              {data.plans.map((p:any) => (
                <tr key={p.user_plan_id}>
                  <td>{p.user_plan_id}</td>
                  <td>{p.plan_name}</td>
                  <td>{p.status}</td>
                  <td>{p.start_at_ist} → {p.end_at_ist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr><th>ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {data.payments.map((p:any) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.amount} {p.currency}</td>
                  <td>{p.status}</td>
                  <td>{p.created_at_ist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Communication Logs */}
      <Card>
        <CardHeader><CardTitle>Communication Logs (SMS / WhatsApp)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">SMS Logs</h4>
              <ul className="text-xs space-y-1">
                {data.communications.sms_logs.map((s:any)=>(
                  <li key={s.id}>[{s.created_at}] {s.status} - {s.message}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">WhatsApp Logs</h4>
              <ul className="text-xs space-y-1">
                {data.communications.whatsapp_logs.map((w:any)=>(
                  <li key={w.id}>[{w.created_at}] {w.status} - {w.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            {data.activities.map((a:any)=>(
              <li key={a.id}>[{a.created_at_ist}] {a.activity_type}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            {data.feedback.map((f:any)=>(
              <li key={f.created_at}>⭐ {f.rating}/5 - {f.feedback}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
