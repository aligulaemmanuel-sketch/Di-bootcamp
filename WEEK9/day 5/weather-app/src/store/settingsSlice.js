import { createSlice } from '@reduxjs/toolkit';

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    themeMode: prefersDark ? 'dark' : 'light',
    unit: 'C',
  },
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
    },
    setUnit(state, action) {
      state.unit = action.payload;
    },
  },
});

export const { toggleTheme, setUnit } = settingsSlice.actions;
export default settingsSlice.reducer;
