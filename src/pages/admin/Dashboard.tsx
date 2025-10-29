import { Users, DollarSign, Package, MessageSquare, FileText, Star } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { stats, revenueData, signupData, planData } = useAppSelector((state) => state.dashboard);
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with MitraTender today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          change="+12.5% from last month"
          changeType="positive"
          navigateTo="/admin/users"
        />
        <DashboardCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          change="+8.2% from last month"
          changeType="positive"
          navigateTo="/admin/payments"
        />
        <DashboardCard
          title="Active Plans"
          value={stats.activePlans}
          icon={Package}
          change="+5.1% from last month"
          changeType="positive"
          navigateTo="/admin/plans"
        />
        <DashboardCard
          title="SMS Success Rate"
          value={stats.smsSuccessRate}
          icon={MessageSquare}
          change="0.3% from last week"
          changeType="neutral"
          navigateTo="/admin/sms"
        />
        <DashboardCard
          title="Active Tenders"
          value={stats.activeTenders}
          icon={FileText}
          change="+15.3% from last month"
          changeType="positive"
          navigateTo="/admin/tenders"
        />
        <DashboardCard
          title="Avg Feedback"
          value={stats.avgFeedback}
          icon={Star}
          change="+0.2 from last month"
          changeType="positive"
          navigateTo="/admin/notifications"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(217, 91%, 60%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Signups Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>User Signups by Day</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="users" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geo Heatmap Placeholder */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Top Search States</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
              <p className="text-muted-foreground text-center">
                Geo Heatmap Visualization
                <br />
                <span className="text-sm">(Integration coming soon)</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
