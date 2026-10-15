import { describe, it, expect } from 'vitest';
import { makeStore } from '../../store';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartTotalItems,
  selectCartTotalPrice,
} from './cartSlice';
import { login } from '../auth/authThunks';
import { logoutUser } from '../auth/authThunks';

const shirt = { id: 1, title: 'Shirt', price: 10.5, image: 'shirt.png' };
const hat = { id: 2, title: 'Hat', price: 4.25, image: 'hat.png' };

describe('cart slice', () => {
  it('adds a new item with quantity 1', () => {
    const store = makeStore();
    store.dispatch(addToCart(shirt));
    expect(store.getState().cart.items).toEqual([{ ...shirt, quantity: 1 }]);
  });

  it('increments quantity when the same item is added again', () => {
    const store = makeStore();
    store.dispatch(addToCart(shirt));
    store.dispatch(addToCart(shirt));
    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().cart.items[0].quantity).toBe(2);
  });

  it('removes an item', () => {
    const store = makeStore();
    store.dispatch(addToCart(shirt));
    store.dispatch(addToCart(hat));
    store.dispatch(removeFromCart(1));
    expect(store.getState().cart.items.map((i) => i.id)).toEqual([2]);
  });

  it('updates quantity and removes the item when it reaches 0', () => {
    const store = makeStore();
    store.dispatch(addToCart(shirt));
    store.dispatch(updateQuantity({ id: 1, quantity: 5 }));
    expect(store.getState().cart.items[0].quantity).toBe(5);

    store.dispatch(updateQuantity({ id: 1, quantity: 0 }));
    expect(store.getState().cart.items).toEqual([]);
  });

  it('calculates totals', () => {
    const store = makeStore();
    store.dispatch(addToCart(shirt));
    store.dispatch(addToCart(shirt));
    store.dispatch(addToCart(hat));

    expect(selectCartTotalItems(store.getState())).toBe(3);
    expect(selectCartTotalPrice(store.getState())).toBe(25.25);
  });

  it('clears the cart', () => {
    const store = makeStore();
    store.dispatch(addToCart(shirt));
    store.dispatch(clearCart());
    expect(store.getState().cart.items).toEqual([]);
  });

  it('empties the cart when the user logs out', async () => {
    const store = makeStore();
    await store.dispatch(login({ username: 'sam', password: 'secret' }, 0));
    store.dispatch(addToCart(shirt));
    store.dispatch(logoutUser());
    expect(store.getState().cart.items).toEqual([]);
  });
});
