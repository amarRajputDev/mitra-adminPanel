import { create } from "zustand";
import axios from "axios";

type PaymentRow = {
  id: number;                 // numeric id for actions
  display_id?: string;        // pretty id like PAY001
  user_id: number;
  display_user_id?: string;   // pretty user id like U001
  userName: string;
  amount: number;
  status: "success" | "created" | "failed";
  plan: string;
  date: string;               // YYYY-MM-DD
  method: string;             // gateway label
};

type FetchParams = {
  status?: "all" | "success" | "created" | "failed";
  q?: string;
};

type PaymentsState = {
  payments: PaymentRow[];
  totalRevenue: number;
  pendingAmount: number;
  loading: boolean;
  error?: string | null;
  lastQuery: FetchParams;

  fetchPayments: (params?: FetchParams) => Promise<void>;
  setStatus: (status: FetchParams["status"]) => void;
  setSearch: (q: string) => void;
};

// ---- Dummy fallback ----
const dummyPayments: PaymentRow[] = [
  {
    id: 1, display_id: "PAY001", user_id: 101, display_user_id: "U101",
    userName: "Amit Sharma", amount: 2999, status: "success",
    plan: "Premium 90", date: "2025-10-30", method: "razorpay",
  },
  {
    id: 2, display_id: "PAY002", user_id: 102, display_user_id: "U102",
    userName: "Neha Gupta", amount: 999, status: "failed",
    plan: "Starter 30", date: "2025-10-29", method: "razorpay",
  },
  {
    id: 3, display_id: "PAY003", user_id: 103, display_user_id: "U103",
    userName: "Ravi Kumar", amount: 2499, status: "created",
    plan: "Pro 90", date: "2025-10-28", method: "razorpay",
  },
];

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  totalRevenue: 0,
  pendingAmount: 0,
  loading: false,
  error: null,
  lastQuery: { status: "all", q: "" },

  fetchPayments: async (params = {}) => {
    const q = params.q ?? get().lastQuery.q ?? "";
    const status = params.status ?? get().lastQuery.status ?? "all";

    set({ loading: true, error: null, lastQuery: { status, q } });

    try {
      const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const res = await axios.get(`${base}/payments`, {
        params: { status, q },
      });

      const data = res.data || {};
      set({
        payments: Array.isArray(data.payments) ? data.payments : [],
        totalRevenue: Number(data.totalRevenue || 0),
        pendingAmount: Number(data.pendingAmount || 0),
        loading: false,
        error: null,
      });
    } catch (err: any) {
      // fallback to dummy so UI stays usable
      const totalRevenue = dummyPayments
        .filter(p => p.status === "success")
        .reduce((s, p) => s + (p.amount || 0), 0);
      const pendingAmount = dummyPayments
        .filter(p => p.status === "created")
        .reduce((s, p) => s + (p.amount || 0), 0);

      set({
        payments: dummyPayments,
        totalRevenue,
        pendingAmount,
        loading: false,
        error: err?.response?.data?.message || err?.message || "Failed to load payments",
      });
    }
  },

  setStatus: (status) => set({ lastQuery: { ...get().lastQuery, status } }),
  setSearch: (q) => set({ lastQuery: { ...get().lastQuery, q } }),
}));
