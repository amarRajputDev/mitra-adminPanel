import { DashboardCard } from "@/components/admin/DashboardCard";
import { Loader2, Users, Search } from "lucide-react";
import UserList from "@/components/userComponent/UsersList";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function UsersManagement() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<{count:number,total:number,users:any[],page:number,limit?:number}>({
    count: 0, total: 0, users: [], page: 1
  });

  const base = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  const fetchUsers = async (pageNum: number, query: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${base}/users/allUsers`, {
        params: { page: pageNum, q: query, limit: 20 }
      });
      setResp(res.data);
      console.log(res.data)
    } catch (e:any) {
      console.error("fetchUsers error:", e?.message);
      setResp((prev) => ({ ...prev, users: [], count: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // load on mount + when page or debounced search changes
  useEffect(() => {
    fetchUsers(page, debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQ]);

  const totalUsers = useMemo(() => resp.total || 0, [resp.total]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all registered users</p>
        </div>

        {/* Search box */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by name, email, mobile or ID…"
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <DashboardCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          change="+12.5% from last month"
          changeType="positive"
          navigateTo="/admin/users"
        />
        <DashboardCard
          title="Page Users"
          value={resp.count || 0}
          icon={Users}
          change="+1.2% this page"
          changeType="positive"
          navigateTo="/admin/users"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        ) : (
          <UserList
            users={resp.users}
            loading={false}
            page={page}
            totalPages={Math.max(1, Math.ceil((resp.total || 0) / (resp.limit || 20)))}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
