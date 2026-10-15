import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Both thunks simulate a server round trip with setTimeout.
// The optional argument is the delay in ms (tests pass 0).
export const ageUpAsync = createAsyncThunk(
  'age/ageUpAsync',
  async (delayMs = DEFAULT_DELAY_MS) => {
    await wait(delayMs);
    return 1;
  }
);

export const ageDownAsync = createAsyncThunk(
  'age/ageDownAsync',
  async (delayMs = DEFAULT_DELAY_MS) => {
    await wait(delayMs);
    return 1;
  }
);

const initialState = {
  age: 20,
  loading: false,
};

const ageSlice = createSlice({
  name: 'age',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setAge(state, action) {
      state.age = Math.max(0, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ageUpAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(ageUpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.age += action.payload;
      })
      .addCase(ageUpAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(ageDownAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(ageDownAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.age = Math.max(0, state.age - action.payload); // age can't go below 0
      })
      .addCase(ageDownAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setLoading, setAge } = ageSlice.actions;

export default ageSlice.reducer;
