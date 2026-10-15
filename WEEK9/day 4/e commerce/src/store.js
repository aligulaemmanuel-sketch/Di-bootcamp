import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productReducer from './features/products/productSlice';
import cartReducer from './features/cart/cartSlice';

// configureStore includes redux-thunk middleware by default,
// so thunk action creators can be dispatched directly.
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      products: productReducer,
      cart: cartReducer,
    },
  });

export const store = makeStore();
