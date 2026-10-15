import { configureStore } from '@reduxjs/toolkit';
import ageReducer from './features/age/ageSlice';

// configureStore applies redux-thunk middleware by default,
// which is what lets createAsyncThunk actions be dispatched.
export const makeStore = () =>
  configureStore({
    reducer: {
      age: ageReducer,
    },
  });

export const store = makeStore();
