import { describe, it, expect, vi, afterEach } from 'vitest';
import { makeStore } from '../app/store';
import { fetchUser } from './userSlice';

const mockUser = { id: 1, name: 'Leanne Graham', email: 'leanne@example.com' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchUser thunk', () => {
  it('fetches and stores user data on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    }));

    const store = makeStore();
    const promise = store.dispatch(fetchUser(1));
    expect(store.getState().user.loading).toBe(true);

    await promise;

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.data).toEqual(mockUser);
    expect(state.error).toBeNull();
  });

  it('stores an error when the API responds with a failure status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toMatch(/500/);
    expect(state.data).toEqual({});
  });

  it('stores an error when the network request rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    const store = makeStore();
    await store.dispatch(fetchUser(1));

    const state = store.getState().user;
    expect(state.error).toBe('Network down');
    expect(state.loading).toBe(false);
  });
});
