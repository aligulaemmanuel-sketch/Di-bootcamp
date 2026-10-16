import { createSlice, nanoid } from '@reduxjs/toolkit';
import { deleteCategory } from '../categories/categoriesSlice';

// A task is "completed" when its progress reaches 100 (derived, not stored twice).
const initialState = [
  { id: 't1', title: 'Write weekly report', categoryId: 'cat-work', progress: 100 },
  { id: 't2', title: 'Review pull requests', categoryId: 'cat-work', progress: 40 },
  { id: 't3', title: '30 minute walk', categoryId: 'cat-health', progress: 0 },
  { id: 't4', title: 'Stretch routine', categoryId: 'cat-health', progress: 100 },
  { id: 't5', title: 'Read Redux Toolkit docs', categoryId: 'cat-learning', progress: 60 },
];

const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare({ title, categoryId }) {
        return { payload: { id: nanoid(), title, categoryId, progress: 0 } };
      },
    },
    editTask(state, action) {
      const { id, changes } = action.payload;
      const task = state.find((t) => t.id === id);
      if (task) Object.assign(task, changes);
    },
    deleteTask(state, action) {
      return state.filter((t) => t.id !== action.payload);
    },
    updateTaskProgress(state, action) {
      const { id, progress } = action.payload;
      const task = state.find((t) => t.id === id);
      if (task) task.progress = clamp(progress);
    },
  },
  extraReducers: (builder) => {
    // Deleting a category also removes the tasks that belonged to it
    builder.addCase(deleteCategory, (state, action) =>
      state.filter((t) => t.categoryId !== action.payload)
    );
  },
});

export const { addTask, editTask, deleteTask, updateTaskProgress } = tasksSlice.actions;
export default tasksSlice.reducer;
