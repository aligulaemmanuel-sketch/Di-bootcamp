import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (form: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", form);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? err.response?.data?.errors?.[0] ?? "Registration failed");
    }
  }
);

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch {
    return rejectWithValue("Session expired");
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (patch: { bio?: string; avatarUrl?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/auth/me", patch);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => { state.status = "loading"; state.error = null; };
    const rejected = (state: AuthState, action: any) => {
      state.status = "failed";
      state.error = action.payload as string;
    };
    builder
      .addCase(login.pending, pending)
      .addCase(register.pending, pending)
      .addCase(login.rejected, rejected)
      .addCase(register.rejected, rejected)
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
