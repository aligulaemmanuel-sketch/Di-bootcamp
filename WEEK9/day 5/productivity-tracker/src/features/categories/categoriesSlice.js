import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { id: 'cat-work', name: 'Work', color: '#4f46e5' },
    { id: 'cat-health', name: 'Health', color: '#16a34a' },
    { id: 'cat-learning', name: 'Learning', color: '#d97706' },
  ],
  // 'all' is a UI pseudo-category meaning "no filter"
  selectedId: 'all',
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare(name, color = '#64748b') {
        return { payload: { id: nanoid(), name, color } };
      },
    },
    editCategory(state, action) {
      const { id, changes } = action.payload;
      const category = state.items.find((c) => c.id === id);
      if (category) Object.assign(category, changes);
    },
    deleteCategory(state, action) {
      state.items = state.items.filter((c) => c.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = 'all';
    },
    setSelectedCategory(state, action) {
      state.selectedId = action.payload;
    },
  },
});

export const { addCategory, editCategory, deleteCategory, setSelectedCategory } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
