import { createSlice } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice';

const initialState = {
  items: [], // { id, title, price, image, quantity }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    // payload: { id, quantity }. A quantity of 0 or less removes the item.
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
        return;
      }
      const item = state.items.find((i) => i.id === id);
      if (item) item.quantity = quantity;
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // Logging out empties the cart.
    builder.addCase(logout, (state) => {
      state.items = [];
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

// Totals are derived from the items rather than stored, so they can't drift.
export const selectCartItems = (state) => state.cart.items;

export const selectCartTotalItems = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotalPrice = (state) => {
  const total = state.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return Math.round(total * 100) / 100;
};

export default cartSlice.reducer;
