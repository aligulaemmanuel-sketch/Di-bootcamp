import { describe, it, expect, vi, afterEach } from 'vitest';
import { makeStore } from '../../store';
import { fetchProducts } from './productThunks';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchProducts thunk', () => {
  it('stores fetched products on success', async () => {
    const products = [
      { id: 1, title: 'Backpack', price: 109.95, image: 'a.png' },
      { id: 2, title: 'T-Shirt', price: 22.3, image: 'b.png' },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => products })
    );

    const store = makeStore();
    const promise = store.dispatch(fetchProducts());
    expect(store.getState().products.loading).toBe(true);
    await promise;

    const state = store.getState().products;
    expect(state.items).toEqual(products);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('stores an error when the API responds with a failure status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const store = makeStore();
    await store.dispatch(fetchProducts());

    const state = store.getState().products;
    expect(state.error).toMatch(/503/);
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('stores an error when the network request rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    const store = makeStore();
    await store.dispatch(fetchProducts());

    expect(store.getState().products.error).toBe('Network down');
  });
});
