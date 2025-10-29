import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import Plans from "./pages/admin/Plans";
import Tenders from "./pages/admin/Tenders";
import Analytics from "./pages/admin/Analytics";
import Notifications from "./pages/admin/Notifications";
import SMS from "./pages/admin/SMS";
import Policies from "./pages/admin/Policies";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="payments" element={<Payments />} />
              <Route path="plans" element={<Plans />} />
              <Route path="tenders" element={<Tenders />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="sms" element={<SMS />} />
              <Route path="policies" element={<Policies />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
