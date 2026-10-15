import { describe, it, expect } from 'vitest';
import { makeStore } from '../../store';
import { login, logoutUser } from './authThunks';

describe('auth simulation', () => {
  it('starts logged out', () => {
    const { auth } = makeStore().getState();
    expect(auth).toEqual({ user: null, isAuthenticated: false, loading: false, error: null });
  });

  it('logs in with valid credentials', async () => {
    const store = makeStore();
    const promise = store.dispatch(login({ username: 'sam', password: 'secret' }, 0));
    expect(store.getState().auth.loading).toBe(true);
    await promise;

    const { auth } = store.getState();
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user).toEqual({ username: 'sam' });
    expect(auth.loading).toBe(false);
  });

  it('rejects a short password', async () => {
    const store = makeStore();
    await store.dispatch(login({ username: 'sam', password: 'abc' }, 0));

    const { auth } = store.getState();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.error).toBeTruthy();
  });

  it('rejects an empty username', async () => {
    const store = makeStore();
    await store.dispatch(login({ username: '  ', password: 'secret' }, 0));
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('logs out', async () => {
    const store = makeStore();
    await store.dispatch(login({ username: 'sam', password: 'secret' }, 0));
    store.dispatch(logoutUser());

    const { auth } = store.getState();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
  });
});
