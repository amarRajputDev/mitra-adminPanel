import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificationLogs() {
  const [loading, setLoading] = useState(true)
  const [smsLogs, setSmsLogs] = useState<any[]>([])
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([])

  // 🧠 Sample Data (for development mode)
  const sampleSMS = [
    {
      id: 1,
      user_name: "Rajesh Kumar",
      phone: "+91 9876543210",
      message: "Your tender #2456 has been successfully submitted.",
      status: "delivered",
      provider: "Twilio",
      type: "sms",
      created_at: "2025-10-30T10:15:00Z",
    },
    {
      id: 2,
      user_name: "Priya Sharma",
      phone: "+91 9823456710",
      message: "Payment for Plan PRO received successfully.",
      status: "failed",
      provider: "Msg91",
      type: "sms",
      created_at: "2025-10-29T14:30:00Z",
    },
    {
      id: 3,
      user_name: "Amit Patel",
      phone: "+91 9988776655",
      message: "Your tender alert summary is ready.",
      status: "pending",
      provider: "Twilio",
      type: "sms",
      created_at: "2025-10-29T09:00:00Z",
    },
  ]

  const sampleWhatsApp = [
    {
      id: 1,
      user_name: "Sneha Reddy",
      phone: "+91 9000012345",
      message: "Welcome to Mitra Tenders! Your account is verified ✅",
      status: "sent",
      provider: "Gupshup",
      type: "whatsapp",
      created_at: "2025-10-30T11:00:00Z",
    },
    {
      id: 2,
      user_name: "Vikram Singh",
      phone: "+91 9090909090",
      message: "Your subscription 'Tez Monthly' expires in 3 days.",
      status: "read",
      provider: "360Dialog",
      type: "whatsapp",
      created_at: "2025-10-29T16:45:00Z",
    },
    {
      id: 3,
      user_name: "Anjali Verma",
      phone: "+91 9123456789",
      message: "Payment failed — please retry using UPI or card.",
      status: "failed",
      provider: "Gupshup",
      type: "whatsapp",
      created_at: "2025-10-29T13:10:00Z",
    },
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setSmsLogs(sampleSMS)
      setWhatsappLogs(sampleWhatsApp)
      setLoading(false)
    }, 800)
  }, [])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes("fail")) return <Badge variant="destructive">Failed</Badge>
    if (s.includes("pend")) return <Badge className="bg-yellow-500 text-white">Pending</Badge>
    if (s.includes("read")) return <Badge className="bg-green-600 text-white">Read</Badge>
    if (s.includes("deliv")) return <Badge className="bg-green-600 text-white">Delivered</Badge>
    if (s.includes("sent")) return <Badge className="bg-blue-500 text-white">Sent</Badge>
    return <Badge>{status}</Badge>
  }

  const LogList = ({ logs, type }: { logs: any[]; type: string }) => {
    if (loading)
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <Loader2 className="animate-spin mr-2" /> Loading {type} logs...
        </div>
      )

    if (!logs.length)
      return (
        <p className="text-center text-muted-foreground py-8">
          No {type} logs found.
        </p>
      )

    return (
      <ScrollArea className="h-[480px] pr-3">
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-muted/40 transition-colors"
            >
              <div>
                <p className="font-medium">{log.user_name}</p>
                <p className="text-sm text-muted-foreground">{log.phone}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {log.message}
                </p>
              </div>
              <div className="text-right space-y-1 mt-3 md:mt-0">
                {getStatusBadge(log.status)}
                <p className="text-xs text-muted-foreground">
                  Provider: {log.provider}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <MessageCircle className="w-6 h-6 text-primary" />
          Notification Logs
        </h1>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sms" className="w-full">
        <TabsList>
          <TabsTrigger value="sms">📱 SMS Logs</TabsTrigger>
          <TabsTrigger value="whatsapp">💬 WhatsApp Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Delivery Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <LogList logs={smsLogs} type="SMS" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Delivery Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <LogList logs={whatsappLogs} type="WhatsApp" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
