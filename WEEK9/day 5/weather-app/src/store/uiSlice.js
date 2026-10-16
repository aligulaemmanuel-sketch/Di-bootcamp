import { createSlice, isRejected } from '@reduxjs/toolkit';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toast: null },
  reducers: {
    dismissToast(state) {
      state.toast = null;
    },
  },
  extraReducers: (builder) => {
    // Any failed thunk surfaces as a toast
    builder.addMatcher(isRejected, (state, action) => {
      state.toast = {
        id: action.meta.requestId,
        message: typeof action.payload === 'string' ? action.payload : FALLBACK_MESSAGE,
      };
    });
  },
});

export const { dismissToast } = uiSlice.actions;
export default uiSlice.reducer;
