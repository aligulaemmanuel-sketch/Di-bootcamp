import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../features/tasks/tasksSlice';
import categoriesReducer from '../features/categories/categoriesSlice';

export const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      tasks: tasksReducer,
      categories: categoriesReducer,
    },
    preloadedState,
  });

export const store = makeStore();
