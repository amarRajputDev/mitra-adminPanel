import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  FileText,
  BarChart3,
  Bell,
  MessageSquare,
  FileCheck,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { useSelector } from "react-redux";
import { useAppSelector } from "@/store";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Payments", icon: CreditCard, path: "/admin/payments" },
  { title: "Plans", icon: Package, path: "/admin/plans" },
  { title: "Tenders", icon: FileText, path: "/admin/tenders" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "SMS Logs", icon: MessageSquare, path: "/admin/sms" },
  { title: "Policies", icon: FileCheck, path: "/admin/policies" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(true);

  const { user } = useAppSelector((state: any) => state.auth);

  const handleLinkClick = () => {
    // Close sidebar on mobile when clicking a link
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
        aria-label="Toggle menu"
      >
        {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen gradient-sidebar border-r border-sidebar-border transition-all duration-300 z-40 overflow-y-auto",
          collapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "w-64 translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            {!collapsed && (
              <h1 className="text-xl font-bold text-sidebar-foreground">
                MitraTender
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                    collapsed && "justify-center"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          {!collapsed && (
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
