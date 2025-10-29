import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for Admin User
interface AdminUser {
  id?: string;
  name: string;
  email: string;
  rememberMe?: boolean;
  role?: string;
}

// Define the type for Authentication State
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoggedin: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("adminToken"),
  isLoggedin : false,
  error: null,
};

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login action
    login: (state, action: PayloadAction<{ user: AdminUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedin = true;
      state.error = null;
      localStorage.setItem("adminToken", action.payload.token);
    },
    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedin = false;
      localStorage.removeItem("adminToken");
    },
    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    // Clear error action
    clearError: (state) => {
      state.error = null;
    }
  }
});

// Export actions
export const { login, logout, setError, clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selector functions
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isLoggedin;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
