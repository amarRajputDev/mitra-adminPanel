import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  revenue: number;
}

interface SignupData {
  day: string;
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
}

const initialState: DashboardState = {
  stats: {
    totalUsers: "12,543",
    totalRevenue: "₹8,45,230",
    activePlans: "950",
    smsSuccessRate: "98.5%",
    activeTenders: "2,341",
    avgFeedback: "4.8",
  },
  revenueData: [
    { date: "Jan 1", revenue: 12000 },
    { date: "Jan 5", revenue: 18000 },
    { date: "Jan 10", revenue: 15000 },
    { date: "Jan 15", revenue: 22000 },
    { date: "Jan 20", revenue: 28000 },
    { date: "Jan 25", revenue: 32000 },
    { date: "Jan 30", revenue: 38000 },
  ],
  signupData: [
    { day: "Mon", users: 45 },
    { day: "Tue", users: 62 },
    { day: "Wed", users: 48 },
    { day: "Thu", users: 75 },
    { day: "Fri", users: 88 },
    { day: "Sat", users: 52 },
    { day: "Sun", users: 38 },
  ],
  planData: [
    { name: "Basic", value: 450, color: "hsl(217, 91%, 60%)" },
    { name: "Pro", value: 320, color: "hsl(221, 83%, 53%)" },
    { name: "Enterprise", value: 180, color: "hsl(215, 16%, 47%)" },
  ],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    updateRevenueData: (state, action: PayloadAction<RevenueData[]>) => {
      state.revenueData = action.payload;
    },
    updateSignupData: (state, action: PayloadAction<SignupData[]>) => {
      state.signupData = action.payload;
    },
    updatePlanData: (state, action: PayloadAction<PlanData[]>) => {
      state.planData = action.payload;
    },
  },
});

export const { updateStats, updateRevenueData, updateSignupData, updatePlanData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
