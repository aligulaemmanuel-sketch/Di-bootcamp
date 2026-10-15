import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';

// configureStore includes redux-thunk middleware by default,
// so thunk action creators can be dispatched without extra setup.
export const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
    },
  });

export const store = makeStore();
