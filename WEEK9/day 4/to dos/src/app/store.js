import { configureStore } from '@reduxjs/toolkit';
import todoReducer from '../features/todos/todoSlice';

// configureStore includes redux-thunk middleware by default,
// so thunks such as fetchTodos can be dispatched directly.
export const makeStore = () =>
  configureStore({
    reducer: {
      todos: todoReducer,
    },
  });

export const store = makeStore();
