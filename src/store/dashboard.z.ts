import { create } from 'zustand';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: string;
  totalRevenue: string;
  activePlans: string;
  smsSuccessRate: string;
  activeTenders: string;
  avgFeedback: string;
}

interface RevenueData {
  date: string;
  amount: number;
}

interface SignupData {
  datee: string;
  users: number;
}

interface PlanData {
  name: string;
  value: number;
  color: string;
}

interface DashboardState {
  stats: DashboardStats;
  revenueData: RevenueData[];
  signupData: SignupData[];
  planData: PlanData[];

  updateStats: (newStats: Partial<DashboardStats>) => void;
  updateRevenueData: (data: RevenueData[]) => void;
  updateSignupData: (data: SignupData[]) => void;
  updatePlanData: (data: PlanData[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    totalUsers: "12,543",
    totalRevenue: "₹8,45,230",
    activePlans: "950",
    smsSuccessRate: "98.5%",
    activeTenders: "2,341",
    avgFeedback: "4.8",
  },
  revenueData: [
    { date: "Jan 1", amount: 12000 },
    { date: "Jan 5", amount: 18000 },
    { date: "Jan 10",amount: 15000 },
    { date: "Jan 15",amount: 22000 },
    { date: "Jan 20",amount: 28000 },
    { date: "Jan 25",amount: 32000 },
    { date: "Jan 30",amount: 38000 },
  ],
  signupData: [
    { datee: "Jan 1", users: 50 },
  ],
  planData: [
    { name: "Basic", value: 450, color: "hsl(217, 91%, 60%)" },
    { name: "Pro", value: 320, color: "hsl(221, 83%, 53%)" },
    { name: "Enterprise", value: 180, color: "hsl(215, 16%, 47%)" },
  ],

  updateStats: (newStats) =>
    set((state) => ({
      stats: { ...state.stats, ...newStats },
    })),

updateRevenueData: (data) =>
  set(() => ({
    revenueData: data.map((item) => ({
      ...item,
      date: format(new Date(item.date), "MMM d, yyyy h:mm a"),
    })),
  })),

  updateSignupData: (data) =>
    set(() => ({
      signupData: data,
    })),

  updatePlanData: (data) =>
    set(() => ({
      planData: data,
    })),
}));
export default useDashboardStore;