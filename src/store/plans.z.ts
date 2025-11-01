// src/store/plans.z.ts
import { create } from "zustand";
import axios from "axios";

export type PlanStatus = "active" | "inactive";
export interface Plan {
  id: number; code: string; name: string;
  description?: string | null;
  price: number; currency: string; duration_days: number;
  tender_limit?: number | null; state_limit?: number | null;
  is_all_india?: 0 | 1; status: PlanStatus; created_at_ist?: string;
}

type Filter = { status?: "all" | PlanStatus; q?: string };

interface PlansState {
  items: Plan[];
  loading: boolean;
  error?: string;
  filterStatus: "all" | PlanStatus;
  search: string;
  fetchPlans: (f?: Filter) => Promise<void>;
  setSearch: (q: string) => void;
  setFilterStatus: (s: "all" | PlanStatus) => void;
}

const samplePlans: Plan[] = [/* … your same sample array … */];

export const usePlansStore = create<PlansState>((set, get) => ({
  items: samplePlans,
  loading: false,
  error: undefined,
  filterStatus: "all",
  search: "",

  fetchPlans: async (f = {}) => {
    const status = f.status ?? get().filterStatus ?? "all";
    const q = f.q ?? get().search ?? "";
    set({ loading: true, error: undefined });

    try {
      const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const res = await axios.get(`${base}/plans`, { params: { status, q } });
      const plans: Plan[] = Array.isArray(res.data) ? res.data : res.data.plans;
      console.log( "Plans Data--->" ,plans)
      set({ items: plans, loading: false });
    } catch (err: any) {
      console.warn("Plans API failed — using sample");
      set({
        items: samplePlans,
        loading: false,
        error: err?.response?.data?.message || err?.message || "Failed to load plans",
      });
    }
  },

  setSearch: (q) => set({ search: q }),
  setFilterStatus: (s) => set({ filterStatus: s }),
}));
