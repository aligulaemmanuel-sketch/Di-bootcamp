import { configureStore } from '@reduxjs/toolkit';
import booksReducer from '../features/books/booksSlice';

// configureStore adds redux-thunk, the Redux DevTools extension,
// and dev-only immutability/serializability checks by default.
export const store = configureStore({
  reducer: {
    books: booksReducer,
  },
});
