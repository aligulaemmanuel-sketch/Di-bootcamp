import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [] },
  reducers: {
    toggleFavorite(state, action) {
      const index = state.items.findIndex((favorite) => favorite.key === action.payload.key);
      if (index === -1) state.items.push(action.payload);
      else state.items.splice(index, 1);
    },
    removeFavorite(state, action) {
      state.items = state.items.filter((favorite) => favorite.key !== action.payload);
    },
  },
});

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
